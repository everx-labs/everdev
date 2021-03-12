import path from "path";
import {
    compareVersions,
    downloadFromBinaries,
    executableName,
    formatTable,
    httpsGetJson,
    nullTerminal,
    run,
} from "../../core/utils";
import {Terminal} from "../../core";
import fs from "fs";

export type ComponentOptions = {
    executable?: boolean,
    extractCurrentVersionRegExp?: RegExp,
    targetName?: string,
}

export class Component {
    isExecutable: boolean = true;
    extractCurrentVersionRegExp: RegExp;
    targetName: string;
    path: string;

    constructor(public home: string, public name: string, options?: ComponentOptions) {
        this.isExecutable = options?.executable ?? false;
        this.extractCurrentVersionRegExp = options?.extractCurrentVersionRegExp ?? /Version:\s*([0-9.]+)/;
        this.targetName = options?.targetName ?? name;
        if (this.isExecutable) {
            this.targetName = executableName(this.targetName);
        }
        this.path = path.resolve(home, this.targetName);
    }

    async run(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
        const out = await run(this.path, args, {cwd: workDir}, terminal);
        return out.replace(/\r?\n/g, "\r\n");
    }

    getSourceName(version: string): string {
        return `${this.name}_${version.split(".").join("_")}_{p}`;
    }

    async loadAvailableVersions(): Promise<string[]> {
        const versions = (await httpsGetJson(`https://binaries.tonlabs.io/${this.name}.json`))
            [this.name].sort(compareVersions).reverse();
        return versions.length < 10 ? versions : [...versions.slice(0, 10), "..."];
    }

    async getCurrentVersion(): Promise<string> {
        if (fs.existsSync(this.path)) {
            const compilerOut = await this.run(nullTerminal, process.cwd(), ["--version"]);
            return compilerOut.match(this.extractCurrentVersionRegExp)?.[1] ?? "";
        }
        return "";
    }

    async ensureVersion(
        terminal: Terminal,
        requiredVersion?: string,
    ): Promise<boolean> {
        const current = await this.getCurrentVersion();
        if (current !== "" && !requiredVersion) {
            return false;
        }
        let required = (requiredVersion ?? "latest").toLowerCase();
        if (required === current) {
            return false;
        }
        const available = await this.loadAvailableVersions();
        if (required === "latest") {
            required = available[0];
        } else {
            if (!available.includes(required)) {
                throw new Error(`Invalid ${this.name} version ${required}`);
            }
        }
        if (required === current) {
            return false;
        }
        const sourceName = this.getSourceName(required);
        await downloadFromBinaries(terminal, this.path, sourceName, {
            executable: this.isExecutable,
        });
        return true;
    }

    static async ensureInstalledAll(terminal: Terminal, components: { [name: string]: Component }) {
        for (const component of Object.values(components)) {
            await component.ensureVersion(terminal);
        }
    }

    static async setVersions(
        terminal: Terminal,
        components: { [name: string]: Component },
        versions: { [name: string]: any }) {
        let hasUpdates = false;
        for (const [name, component] of Object.entries(components)) {
            if (await component.ensureVersion(terminal, versions[name])) {
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            terminal.log(await this.getInfoAll(components));
        } else {
            terminal.log("All components already up to date.");
        }
    }

    static async updateAll(terminal: Terminal, components: { [name: string]: Component }) {
        const latest: { [name: string]: string } = {};
        for (const name of Object.keys(components)) {
            latest[name] = "latest";
        }
        await this.setVersions(terminal, components, latest);
    }

    static async getInfoAll(components: { [name: string]: Component }): Promise<string> {
        const table = [["Component", "Version", "Available"]];
        for (const [name, component] of Object.entries(components)) {
            table.push([
                name,
                await component.getCurrentVersion(),
                (await component.loadAvailableVersions()).join(", "),
            ]);
        }
        return formatTable(table, {headerSeparator: true});
    }

}

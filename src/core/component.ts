import path from "path";
import {
    downloadFromBinaries,
    executableName,
    formatTable,
    loadBinaryVersions,
    nullTerminal,
    run,
} from "./utils";
import {Terminal} from "./";
import fs from "fs";

export type ComponentOptions = {
    /**
     * Component is an executable file.
     */
    executable?: boolean,
    /**
     * Component must be aliased to run globally.
     */
    globally?: boolean,
    /**
     * Regular expression to extract version from
     * components --version output.
     */
    resolveVersionRegExp?: RegExp,
    /**
     * Target name for a component file.
     */
    targetName?: string,
}

export class Component {
    isExecutable: boolean;
    globally: boolean;
    resolveVersionRegExp: RegExp;
    targetName: string;
    path: string;

    constructor(public home: string, public name: string, options?: ComponentOptions) {
        this.isExecutable = options?.executable ?? false;
        this.globally = options?.globally ?? false;
        this.resolveVersionRegExp = options?.resolveVersionRegExp ?? /Version:\s*([0-9.]+)/;
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
        return `${this.name}_${version.split(".").join("_")}_{p}.gz`;
    }

    async loadAvailableVersions(): Promise<string[]> {
        return loadBinaryVersions(this.name);
    }

    async resolveVersion(_downloadedVersion: string): Promise<string> {
        if (fs.existsSync(this.path)) {
            const compilerOut = await this.run(nullTerminal, process.cwd(), ["--version"]);
            return compilerOut.match(this.resolveVersionRegExp)?.[1] ?? "";
        }
        return "";
    }

    async getCurrentVersion(): Promise<string> {
        const infoPath = `${this.path}.json`;
        if (fs.existsSync(infoPath)) {
            try {
                const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
                if (info.version) {
                    return info.version;
                }
            } catch {
            }
        }
        return this.resolveVersion("");
    }

    async ensureVersion(
        terminal: Terminal,
        requiredVersion?: string,
    ): Promise<boolean> {
        const current = await this.getCurrentVersion();
        if (current !== "" && !requiredVersion) {
            return false;
        }
        let version = (requiredVersion ?? "latest").toLowerCase();
        if (version === current) {
            return false;
        }
        const available = await this.loadAvailableVersions();
        if (version === "latest") {
            version = available[0];
        } else {
            if (!available.includes(version)) {
                throw new Error(`Invalid ${this.name} version ${version}`);
            }
        }
        if (version === current) {
            return false;
        }
        const sourceName = this.getSourceName(version);
        await downloadFromBinaries(terminal, this.path, sourceName, {
            executable: this.isExecutable,
            globally: this.globally,
            version,
        });
        const info = {
            version: await this.resolveVersion(version),
        };
        fs.writeFileSync(`${this.path}.json`, JSON.stringify(info));
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

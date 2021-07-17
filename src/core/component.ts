import path from "path";
import {
    downloadFromBinaries,
    executableName,
    formatTable,
    loadBinaryVersions,
    nullTerminal,
    run,
} from "./utils";
import { Terminal } from "./";
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
    /**
     * Path to executable file name inside targetName (when targetName is a directory)
     */
    innerPath?: string;
}

export class Component {
    isExecutable: boolean;
    globally: boolean;
    resolveVersionRegExp: RegExp;
    targetName: string;
    path: string;
    adjustedPath?: string;

    constructor(public home: string, public name: string, options?: ComponentOptions) {
        this.isExecutable = options?.executable ?? false;
        this.globally = options?.globally ?? false;
        this.resolveVersionRegExp = options?.resolveVersionRegExp ?? /Version:\s*([0-9.]+)/;
        this.targetName = options?.targetName ?? name;
        if (this.isExecutable) {
            this.targetName = executableName(this.targetName);
        }

        if (this.globally && !home) {
            this.path = this.targetName;
        } else {
            this.path = path.resolve(home, this.targetName);
        }

        if (options?.innerPath) {
            this.adjustedPath = path.resolve(home, options.innerPath);
        }
    }

    async run(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
        const out = await run(this.adjustedPath ?? this.path, args, { cwd: workDir }, terminal);
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
        force: boolean,
        requiredVersion?: string,
    ): Promise<boolean> {
        const current = await this.getCurrentVersion();
        if (!force && current !== "" && !requiredVersion) {
            return false;
        }
        let version = (requiredVersion ?? "latest").toLowerCase();
        if (!force && version === current) {
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
        if (!force && version === current) {
            return false;
        }
        const sourceName = this.getSourceName(version);
        await downloadFromBinaries(terminal, this.path, sourceName, {
            executable: this.isExecutable,
            adjustedPath: this.adjustedPath, // need for chmod only
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
            await component.ensureVersion(terminal, false);
        }
    }

    static async setVersions(
        terminal: Terminal,
        force: boolean,
        components: { [name: string]: Component },
        versions: { [name: string]: any },
    ) {
        let hasUpdates = false;
        for (const [name, component] of Object.entries(components)) {
            if (await component.ensureVersion(terminal, force, versions[name])) {
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            terminal.log(await this.getInfoAll(components));
        } else {
            terminal.log("All components already up to date.");
        }
    }

    static async updateAll(terminal: Terminal, force: boolean, components: { [name: string]: Component }) {
        const latest: { [name: string]: string } = {};
        for (const name of Object.keys(components)) {
            latest[name] = "latest";
        }
        await this.setVersions(terminal, force, components, latest);
    }

    static async getInfoAll(components: { [name: string]: Component }): Promise<string> {
        const table = [["Component", "Version", "Available"]];
        let hasNotInstalledComponents = false;
        for (const [name, component] of Object.entries(components)) {
            const version = await component.getCurrentVersion();
            if (version === "") {
                hasNotInstalledComponents = true;
            }
            table.push([
                name,
                version !== "" ? version : "not installed",
                (await component.loadAvailableVersions()).join(", "),
            ]);
        }
        let info = formatTable(table, { headerSeparator: true });
        if (hasNotInstalledComponents) {
            info += "\n\nMissing components will be automatically installed  on first demand.";
        }
        return info;
    }

}

import path from "path";
import {
    downloadFromBinaries,
    ellipsisString,
    executableName,
    formatTable,
    loadBinaryVersions,
    nullTerminal,
    run,
    StringTerminal,
    writeJsonFile,
} from "./utils";
import {
    Terminal,
    everdevHome,
} from "./";
import fs from "fs";

export type ComponentOptions = {
    /**
     * Component is an executable file.
     */
    isExecutable?: boolean,
    /**
     * Component must be aliased to run globally.
     */
    runGlobally?: boolean,
    /**
     * Regular expression to extract version from
     * components --version output.
     */
    resolveVersionRegExp?: RegExp,
    /**
     * Target name for a component file. In some cases targetName is a path to folder.
     */
    targetName?: string,
    /**
     * Path to executable file name inside targetName (when targetName is a directory)
     */
    innerPath?: string;
    /**
     * Do not include this component in the displayed list
     */
    hidden?: boolean;
}

export class Component {
    isExecutable: boolean;
    runGlobally: boolean;
    resolveVersionRegExp: RegExp;
    targetName: string;
    innerPath?: string;
    hidden?: boolean;

    constructor(public toolFolderName: string, public name: string, options?: ComponentOptions) {
        this.isExecutable = options?.isExecutable ?? false;
        this.runGlobally = options?.runGlobally ?? false;
        this.resolveVersionRegExp = options?.resolveVersionRegExp ?? /Version:\s*([0-9.]+)/;
        this.targetName = options?.targetName ?? name;
        if (this.isExecutable) {
            this.targetName = executableName(this.targetName);
        }

        this.innerPath = options?.innerPath;
        this.hidden = options?.hidden ?? false;
    }

    home(): string {
        return this.toolFolderName !== "" ? path.resolve(everdevHome(), this.toolFolderName) : "";
    }

    path(): string {
        return (this.runGlobally && this.toolFolderName === "")
            ? this.targetName
            : path.resolve(this.home(), this.targetName);
    }

    adjustedPath(): string | undefined {
        return this.innerPath !== undefined ? path.resolve(this.home(), this.innerPath) : undefined;
    }

    async run(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
        const out = await run(this.adjustedPath() ?? this.path(), args, { cwd: workDir }, terminal);
        return out.replace(/\r?\n/g, "\r\n");
    }

    async silentRun(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
        const runTerminal = new StringTerminal();
        try {
            return await this.run(runTerminal, workDir, args);
        } catch (error) {
            if (runTerminal.stdout !== "") {
                terminal.write(runTerminal.stdout);
            }
            if (runTerminal.stderr !== "") {
                terminal.writeError(runTerminal.stderr);
            }
            throw error;
        }
    }

    getSourceName(version: string): string {
        return `${this.name}_${version.split(".").join("_")}_{p}.gz`;
    }

    async loadAvailableVersions(): Promise<string[]> {
        return loadBinaryVersions(this.name);
    }

    async resolveVersion(_downloadedVersion: string): Promise<string> {
        if (fs.existsSync(this.path())) {
            const isDeprecatedVersion = !!(_downloadedVersion.match(/^0.21.0$|^0.1.21$/))
            const compilerOut = await this.run(nullTerminal, process.cwd(), ["--version"]);
            return isDeprecatedVersion
                ? _downloadedVersion
                : compilerOut.match(this.resolveVersionRegExp)?.[1] ?? ''
        }
        return "";
    }

    async getCurrentVersion(): Promise<string> {
        const infoPath = `${this.path()}.json`;
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
        await downloadFromBinaries(terminal, this.path(), sourceName, {
            executable: this.isExecutable,
            adjustedPath: this.adjustedPath(), // need for chmod only
            globally: this.runGlobally,
            version,
        });
        const info = {
            version: await this.resolveVersion(version),
        };
        writeJsonFile(`${this.path()}.json`, info);
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
            const allVersions = await component.loadAvailableVersions()
            if (!component.hidden) {
                table.push([
                    name,
                    version !== '' ? version : 'not installed',
                    ellipsisString(allVersions),
                ])
            }
        }
        let info = formatTable(table, { headerSeparator: true });
        if (hasNotInstalledComponents) {
            info += "\n\nMissing components will be automatically installed  on first demand.";
        }
        return info;
    }

}

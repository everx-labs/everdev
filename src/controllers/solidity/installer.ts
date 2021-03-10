import path from "path";
import fs from "fs";
import {
    Terminal,
    tondevHome,
} from "../../core";
import {
    compareVersions,
    downloadFromBinaries,
    executableName,
    formatTable,
    httpsGetJson,
    nullTerminal,
    run,
} from "../../core/utils";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

function configPath(): string {
    return path.resolve(solidityHome(), "config.json");
}

export type SolidityConfig = {
    compilerVersion: string,
    linkerVersion: string,
}

export async function getConfig(): Promise<SolidityConfig> {
    let config: SolidityConfig | null = null;
    try {
        if (fs.existsSync(configPath())) {
            config = JSON.parse(fs.readFileSync(configPath(), "utf8"));
        }
    } catch {
    }
    if (!config) {
        const {
            compiler,
            linker,
        } = await loadAvailableVersions();
        config = {
            compilerVersion: compiler[0],
            linkerVersion: linker[0],
        };
        await setConfig(config);
    }
    return config;
}

export function setConfig(config: SolidityConfig) {
    const configDir = path.dirname(configPath());
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, {recursive: true});
    }
    fs.writeFileSync(configPath(), JSON.stringify(config, undefined, "    "), "utf8");
}


export function compilerPath() {
    return path.resolve(solidityHome(), executableName("solc"));
}

export function linkerPath() {
    return path.resolve(solidityHome(), executableName("tvm_linker"));
}

export function stdLibPath() {
    return path.resolve(solidityHome(), "stdlib_sol.tvm");
}

export async function solidityEnsureInstalled(terminal: Terminal) {
    if (fs.existsSync(compilerPath())) {
        return;
    }
    const config = await getConfig();
    terminal.log("Installing solidity compiler...");
    await downloadFromBinaries(terminal, stdLibPath(), "stdlib_sol");
    await downloadFromBinaries(
        terminal,
        compilerPath(),
        `solc_${config.compilerVersion.split(".").join("_")}_{p}`, {
            executable: true,
        });
    await downloadFromBinaries(
        terminal,
        linkerPath(),
        `tvm_linker_${config.linkerVersion.split(".").join("_")}_{p}`, {
            executable: true,
        });
    terminal.log("Solidity compiler has been installed.");
}

export async function soliditySet(terminal: Terminal, update: Partial<SolidityConfig>) {
    const config = await getConfig();
    let hasUpdates = false;
    if (update.compilerVersion && update.compilerVersion !== config.compilerVersion) {
        config.compilerVersion = update.compilerVersion;
        hasUpdates = true;
    }
    if (update.linkerVersion && update.linkerVersion !== config.linkerVersion) {
        config.linkerVersion = update.linkerVersion;
        hasUpdates = true;
    }
    if (!hasUpdates) {
        terminal.log("No changes to solidity config.");
        return;
    }
    if (fs.existsSync(compilerPath())) {
        fs.unlinkSync(compilerPath());
    }
    if (fs.existsSync(linkerPath())) {
        fs.unlinkSync(linkerPath());
    }
    setConfig(config);
    await solidityEnsureInstalled(terminal);
    await solidityInfo(terminal);
}

export async function solidityUpdate(terminal: Terminal) {
    const {
        compiler,
        linker,
    } = await loadAvailableVersions();
    await soliditySet(terminal, {
        compilerVersion: compiler[0],
        linkerVersion: linker[0],
    });
}

async function runTool(terminal: Terminal, toolPath: string, workDir: string, args: string[]): Promise<string> {
    await solidityEnsureInstalled(terminal);
    const out = await run(toolPath, args, {cwd: workDir}, terminal);
    return out.replace(/\r?\n/g, "\r\n");
}

export async function solc(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
    return runTool(terminal, compilerPath(), workDir, args);
}

export async function tvmLinker(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
    return runTool(terminal, linkerPath(), workDir, args);
}

export type ComponentVersion = {
    current: string,
    available: string[],
}

export type SolidityVersions = {
    compiler: ComponentVersion,
    linker: ComponentVersion,
}

async function loadVersions(name: string): Promise<string[]> {
    const versions = (await httpsGetJson(`https://binaries.tonlabs.io/${name}.json`))
        [name].sort(compareVersions).reverse();
    return versions.length < 10 ? versions : [...versions.slice(0, 10), "..."];
}

export async function loadAvailableVersions(): Promise<{ compiler: string[], linker: string[] }> {
    return {
        compiler: await loadVersions("solc"),
        linker: await loadVersions("tvm_linker"),
    };
}

export async function getVersions(_terminal: Terminal): Promise<SolidityVersions> {
    const compilerOut = await solc(nullTerminal, process.cwd(), ["--version"]);
    const linkerOut = await tvmLinker(nullTerminal, process.cwd(), ["--version"]);
    const available = await loadAvailableVersions();
    return {
        compiler: {
            current: compilerOut.match(/Version:\s*([0-9.]+)/)?.[1] ?? "",
            available: available.compiler,
        },
        linker: {
            current: linkerOut.match(/TVM linker\s*([0-9.]+)/)?.[1] ?? "",
            available: available.linker,
        },
    };
}

export async function solidityInfo(terminal: Terminal): Promise<void> {
    const version = await getVersions(terminal);
    terminal.log(formatTable([
        ["Component", "Version", "Available"],
        ["Compiler", version.compiler.current, version.compiler.available.join(", ")],
        ["Linker", version.linker.current, version.linker.available.join(", ")],
    ], {headerSeparator: true}));
}

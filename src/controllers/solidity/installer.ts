import path from "path";
import fs from "fs";
import { Terminal, tondevHome } from "../../core";
import { downloadFromBinaries, executableName, nullTerminal, run } from "../../core/utils";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

function compilerVersion() {
    return "0_36_0";
}

function linkerVersion() {
    return "0_1_0";
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
    terminal.log("Installing solidity compiler...");
    await downloadFromBinaries(terminal, stdLibPath(), "stdlib_sol");
    await downloadFromBinaries(terminal, compilerPath(), `solc_${compilerVersion()}_{p}`, {
        executable: true,
    });
    await downloadFromBinaries(terminal, linkerPath(), `tvm_linker_${linkerVersion()}_{p}`, {
        executable: true,
    });
    terminal.log("Solidity compiler has been installed.");
}

export async function solidityUpdate(terminal: Terminal) {
    if (fs.existsSync(solidityHome())) {
        fs.rmdirSync(solidityHome(), { recursive: true });
    }
    solidityEnsureInstalled(terminal);
}

async function runTool(terminal: Terminal, toolPath: string, workDir: string, args: string[]): Promise<string> {
    await solidityEnsureInstalled(terminal);
    const out = await run(toolPath, args, { cwd: workDir }, nullTerminal);
    return out.replace(/\r?\n/g, "\r\n");
}

export async function solc(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
    return runTool(terminal, compilerPath(), workDir, args);
};

export async function tvmLinker(terminal: Terminal, workDir: string, args: string[]): Promise<string> {
    return runTool(terminal, linkerPath(), workDir, args);
};

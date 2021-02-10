import path from "path";
import fs from "fs";
import {Terminal, tondevHome} from "../../core";
import {downloadFromBinaries, executableName} from "../../core/utils";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

function compilerVersion() {
    return "0_6_3";
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

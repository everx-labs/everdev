import path from "path";
import fs from "fs";
import {Terminal, tondevHome} from "../../core";
import {downloadFromBinaries, executableName} from "../../core/utils";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

export function compilerPath() {
    return path.resolve(solidityHome(), executableName("solc"));
}

export function linkerPath() {
    return path.resolve(solidityHome(), executableName("sol2tvm"));
}

export function stdLibPath() {
    return path.resolve(solidityHome(), "stdlib_sol.tvm");
}

export async function ensureSolidityCompiler(terminal: Terminal) {
    if (fs.existsSync(compilerPath())) {
        return;
    }
    terminal.log("Installing solidity compiler...");
    await downloadFromBinaries(terminal, stdLibPath(), "stdlib_sol");
    await downloadFromBinaries(terminal, compilerPath(), "solc_0_6_3_darwin", {executable: true});
    await downloadFromBinaries(terminal, linkerPath(), "tvm_linker_0_1_0_darwin", {executable: true});
    terminal.log("Solidity compiler has been installed.");
}

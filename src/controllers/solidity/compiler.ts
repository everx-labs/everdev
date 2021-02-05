import path from "path";
import * as fs from "fs";
import {compilerPath, ensureSolidityCompiler, linkerPath, stdLibPath} from "./installer";
import {Terminal} from "../../core";
import {changeExt, run} from "../../core/utils";

export async function compileSolidity(terminal: Terminal, args: { file: string }): Promise<void> {
    terminal.log("Starting build...");
    const ext = path.extname(args.file);
    if (ext !== ".sol") {
        terminal.log(`Choose solidity source file.`);
        return;
    }
    await ensureSolidityCompiler(terminal);
    const fileDir = path.dirname(args.file);
    const fileName = path.basename(args.file);
    const tvcName = changeExt(fileName, ".tvc");
    const codeName = changeExt(fileName, ".code");

    const runSol = async (toolPath: string, args: string[]) => {
        const out = await run(toolPath, args, {cwd: fileDir}, (_message) => {
        });
        return out.replace(/\r?\n/g, "\r\n");
    };

    const compilerOut = await runSol(compilerPath(), [fileName]);
    const linkerOut = await runSol(linkerPath(), ["compile", codeName, "--lib", stdLibPath()]);
    const generatedTvcName = `${/Saved contract to file (.*)$/mg.exec(linkerOut)?.[1]}`;
    fs.renameSync(path.resolve(fileDir, generatedTvcName), path.resolve(fileDir, tvcName));
    fs.unlinkSync(path.resolve(fileDir, codeName));
    terminal.log(compilerOut);
    terminal.log(linkerOut);
    terminal.log("Compile complete.");
}

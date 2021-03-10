import path from "path";
import * as fs from "fs";
import { solidityEnsureInstalled, stdLibPath, solc, tvmLinker } from "./installer";
import { Command, Terminal } from "../../core";
import { changeExt } from "../../core/utils";

export const solidityCompileCommand: Command = {
    name: "compile",
    title: "Compile Solidity Contract",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.sol$/i,
        },
    ],
    async run(terminal: Terminal, args: { file: string }): Promise<void> {
        terminal.log("Starting build...");
        const ext = path.extname(args.file);
        if (ext !== ".sol") {
            terminal.log(`Choose solidity source file.`);
            return;
        }
        await solidityEnsureInstalled(terminal);
        const fileDir = path.dirname(args.file);
        const fileName = path.basename(args.file);
        const tvcName = changeExt(fileName, ".tvc");
        const codeName = changeExt(fileName, ".code");

        await solc(terminal, fileDir, [fileName]);
        const linkerOut = await tvmLinker(terminal, fileDir, ["compile", codeName, "--lib", stdLibPath()]);

        const generatedTvcName = `${/Saved contract to file (.*)$/mg.exec(linkerOut)?.[1]}`;
        fs.renameSync(path.resolve(fileDir, generatedTvcName), path.resolve(fileDir, tvcName));
        fs.unlinkSync(path.resolve(fileDir, codeName));
        terminal.log("Compile complete.");
    },
};

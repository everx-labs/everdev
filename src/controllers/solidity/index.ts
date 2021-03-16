import {
    Command,
    Component,
    Terminal,
    ToolController,
} from "../../core";
import path from "path";
import {
    changeExt,
    uniqueFilePath,
} from "../../core/utils";
import fs from "fs";
import {BasicContract} from "./snippets";
import {components} from "./components";

export const solidityVersionCommand: Command = {
    name: "version",
    title: "Show Solidity Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.getInfoAll(components));
    },
};

export const solidityCreateCommand: Command = {
    name: "create",
    title: "Create Solidity Contract",
    args: [{
        isArg: true,
        name: "name",
        title: "Contract Name",
        type: "string",
        defaultValue: "Contract",
    }, {
        name: "folder",
        type: "folder",
    }],
    async run(terminal: Terminal, args: { name: string, folder: string }) {
        const filePath = uniqueFilePath(args.folder, `${args.name}{}.sol`);
        const text = BasicContract.split("{name}").join(args.name);
        fs.writeFileSync(filePath, text);
        terminal.log(`Solidity contract ${path.basename(filePath)} created.`);
    },
};


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
        await Component.ensureInstalledAll(terminal, components);
        const fileDir = path.dirname(args.file);
        const fileName = path.basename(args.file);
        const tvcName = changeExt(fileName, ".tvc");
        const codeName = changeExt(fileName, ".code");

        await components.compiler.run(terminal, fileDir, [fileName]);
        const linkerOut = await components.linker.run(
            terminal,
            fileDir,
            ["compile", codeName, "--lib", components.stdlib.path]);

        const generatedTvcName = `${/Saved contract to file (.*)$/mg.exec(linkerOut)?.[1]}`;
        fs.renameSync(path.resolve(fileDir, generatedTvcName), path.resolve(fileDir, tvcName));
        fs.unlinkSync(path.resolve(fileDir, codeName));
        terminal.log("Compile complete.");
    },
};

export const solidityUpdateCommand: Command = {
    name: "update",
    title: "Update Solidity Compiler",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await Component.updateAll(terminal, components);
    },
};

export const soliditySetCommand: Command = {
    name: "set",
    title: "Change Solidity Config",
    args: [
        {
            name: "compiler",
            title: "Compiler version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
        {
            name: "linker",
            title: "Linker version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
        {
            name: "stdlib",
            title: "Stdlib version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
    ],
    async run(terminal: Terminal, args: {
        compiler: string,
        linker: string,
        stdlib: string,
    }): Promise<void> {
        const versions: {
            compiler?: string,
            linker?: string,
            stdlib?: string,
        } = {};
        if (args.compiler !== "") {
            versions.compiler = args.compiler;
        }
        if (args.linker !== "") {
            versions.linker = args.linker;
        }
        if (args.stdlib !== "") {
            versions.stdlib = args.stdlib;
        }
        await Component.setVersions(terminal, components, versions);
    },
};


export const Solidity: ToolController = {
    name: "sol",
    title: "Solidity Compiler",
    commands: [
        solidityCreateCommand,
        solidityCompileCommand,
        solidityVersionCommand,
        soliditySetCommand,
        solidityUpdateCommand,
    ],
};

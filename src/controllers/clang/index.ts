import { Command, Component, Terminal, ToolController } from "../../core";
import path from "path";
import { changeExt, uniqueFilePath } from "../../core/utils";
import fs from "fs";
import { BasicContractCode, BasicContractHeaders } from "./snippets";
import { components } from "./components";

export const clangVersionCommand: Command = {
    name: "version",
    title: "Show C++ Compiler Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.getInfoAll(components));
    },
};

export const clangCreateCommand: Command = {
    name: "create",
    title: "Create C++ Contract",
    args: [
        {
            isArg: true,
            name: "name",
            title: "Contract Name",
            type: "string",
            defaultValue: "Contract",
        },
        {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        // filename was entered with an extension, delete it
        args.name = args.name.replace(/.cpp$/, "");

        const hFilePath = uniqueFilePath(args.folder, `${args.name}{}.hpp`);
        const cFilePath = uniqueFilePath(args.folder, `${args.name}{}.cpp`);

        fs.writeFileSync(hFilePath, BasicContractHeaders);
        fs.writeFileSync(cFilePath, BasicContractCode.split("{name}").join(hFilePath));
        terminal.log(`${hFilePath} created.`);
        terminal.log(`${cFilePath} created.`);
    },
};

export const clangCompileCommand: Command = {
    name: "compile",
    title: "Compile C++ Contract",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.cpp$/i,
        },
    ],
    async run(terminal: Terminal, args: { file: string }): Promise<void> {
        const ext = path.extname(args.file);
        if (ext !== ".cpp") {
            terminal.log(`Choose source file.`);
            return;
        }
        await Component.ensureInstalledAll(terminal, components);
        const tvcName = changeExt(args.file, ".tvc");
        const abiName = changeExt(args.file, ".abi.json");

        await components.clang.run(
            terminal,
            path.dirname(args.file), // cd to this directory
            [args.file, "-o", tvcName]
        );
        terminal.log(`Success, files created: ${tvcName}, ${abiName}`);
    },
};

export const clangUpdateCommand: Command = {
    name: "update",
    title: "Update C++ Compiler",
    args: [
        {
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        },
    ],
    async run(terminal: Terminal, args: { force: boolean }): Promise<void> {
        await Component.updateAll(terminal, args.force, components);
    },
};

export const clangSetCommand: Command = {
    name: "set",
    title: "Change C++ Compiler Config",
    args: [
        {
            name: "compiler",
            alias: "c",
            title: "Compiler version (version number or `latest`)",
            type: "string",
            defaultValue: "",
        },
        {
            name: "force",
            alias: "f",
            title: "Force reinstall even if up to date",
            type: "boolean",
            defaultValue: "false",
        },
    ],
    async run(
        terminal: Terminal,
        args: {
            force: boolean;
            compiler: string;
        }
    ): Promise<void> {
        const versions: {
            compiler?: string;
        } = {};
        if (args.compiler !== "") {
            versions.compiler = args.compiler;
        }
        await Component.setVersions(terminal, args.force, components, versions);
    },
};

export const Clang: ToolController = {
    name: "clang",
    title: "C++ compiler",
    commands: [
        clangCreateCommand,
        clangCompileCommand,
        clangVersionCommand,
        clangSetCommand,
        clangUpdateCommand,
    ],
};

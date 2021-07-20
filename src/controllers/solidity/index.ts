import {
    Command,
    Component,
    Terminal,
    ToolController,
} from "../../core";
import path from "path";
import {
    changeExt,
    uniqueFilePath, writeStringToFile,
} from "../../core/utils";
import fs from "fs";
import mv from 'mv';
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
        title: "Target folder (current is default)",
    }],
    async run(terminal: Terminal, args: { name: string, folder: string }) {
        const filePath = uniqueFilePath(args.folder, `${args.name}{}.sol`);
        const text = BasicContract.split("{name}").join(args.name);
        writeStringToFile(filePath, text);
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
        {
            name: 'output-dir',
            alias: 'o',
            type: 'folder',
            title: 'Output folder (current is default)',
            defaultValue: '',
        },
    ],
    async run(terminal: Terminal, args: { file: string, outputDir: string }): Promise<void> {
        const ext = path.extname(args.file);
        if (ext !== ".sol") {
            terminal.log(`Choose solidity source file.`);
            return;
        }
        await Component.ensureInstalledAll(terminal, components);
        const fileDir = path.dirname(args.file);
        const fileName = path.basename(args.file);

        const outputDir = path.resolve(args.outputDir ?? ".");
        const tvcName = path.resolve( outputDir, changeExt(fileName, ".tvc"));
        const codeName = path.resolve( outputDir, changeExt(fileName, ".code" ));

        await components.compiler.run(terminal, fileDir, ["-o", outputDir, fileName]);
        const linkerOut = await components.linker.run(
            terminal,
            fileDir,
            ["compile", codeName, "--lib", components.stdlib.path]);

        const generatedTvcName = `${/Saved contract to file (.*)$/mg.exec(linkerOut)?.[1]}`;

        // fs.renameSync was replaces by this code, because of an error: EXDEV: cross-device link not permitted
        await new Promise((res, rej) =>
            mv(
                path.resolve(fileDir, generatedTvcName),
                path.resolve(outputDir, tvcName),
                { mkdirp: true, clobber: true },
                (err: Error) => (err ? rej(err) : res(true)),
            )
        );
        fs.unlinkSync(path.resolve(fileDir, codeName));
    },
};

export const solidityUpdateCommand: Command = {
    name: "update",
    title: "Update Solidity Compiler",
    args: [{
        name: "force",
        alias: "f",
        title: "Force reinstall even if up to date",
        type: "boolean",
        defaultValue: "false",
    }],
    async run(terminal: Terminal, args: { force: boolean }): Promise<void> {
        await Component.updateAll(terminal, args.force, components);
    },
};

export const soliditySetCommand: Command = {
    name: "set",
    title: "Change Solidity Config",
    args: [
        {
            name: "compiler",
            alias: "c",
            title: "Compiler version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
        {
            name: "linker",
            alias: "l",
            title: "Linker version (version number or `latest`)",
            type: "string",
            defaultValue: "",

        },
        {
            name: "stdlib",
            alias: "s",
            title: "Stdlib version (version number or `latest`)",
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
    async run(terminal: Terminal, args: {
        force: boolean,
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
        await Component.setVersions(terminal, args.force, components, versions);
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

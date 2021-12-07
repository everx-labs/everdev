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
    writeTextFile,
} from "../../core/utils";
import fs from "fs";
import mv from "mv";
import { BasicContract } from "./snippets";
import { components } from "./components";

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
        writeTextFile(filePath, text);
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
            name: "code",
            alias: "c",
            title: "Save .code file (false is default)",
            type: "boolean",
            defaultValue: "false",
        },
        {
            name: "output-dir",
            alias: "o",
            type: "folder",
            title: "Output folder (current is default)",
            defaultValue: "",
        },
    ],
    async run(terminal: Terminal, args: {
        file: string,
        outputDir: string,
        code: boolean,
    }): Promise<void> {
        await Component.ensureInstalledAll(terminal, components);
        const fileDir = path.dirname(args.file);
        const fileName = path.basename(args.file);

        const outputDir = path.resolve(args.outputDir ?? ".");
        const preserveCode = args.code;
        const tvcName = path.resolve(outputDir, changeExt(fileName, ".tvc"));
        const abiName = path.resolve(outputDir, changeExt(fileName, ".abi.json"));
        const codeName = path.resolve(outputDir, changeExt(fileName, ".code"));

        const isDeprecatedVersion = (await components.compiler.getCurrentVersion()) <= '0.21.0'

        let linkerOut: string;

        if (isDeprecatedVersion) {
            terminal.log("You use an obsolete version of the compiler.\nThe output files are saved in the current directory");

            await components.compiler.silentRun(terminal, fileDir, [ fileName]);
            linkerOut = await components.linker.silentRun(
                terminal,
                fileDir,
                ["compile", codeName, "-a", abiName,  "--lib", components.stdlib.path()],
            );
        } else {
            await components.compiler.silentRun(terminal, fileDir, ["-o", outputDir, fileName]);
            linkerOut = await components.linker.silentRun(
                terminal,
                fileDir,
                ["compile", codeName, "--lib", components.stdlib.path()],
            );
        }

        const generatedTvcName = `${/Saved contract to file (.*)$/mg.exec(linkerOut)?.[1]}`;

        // fs.renameSync was replaces by this code, because of an error: EXDEV: cross-device link not permitted
        await new Promise((res, rej) =>
            mv(
                path.resolve(fileDir, generatedTvcName),
                path.resolve(outputDir, tvcName),
                {
                    mkdirp: true,
                    clobber: true,
                },
                (err: Error) => (err ? rej(err) : res(true)),
            ),
        );
        if (!preserveCode) fs.unlinkSync(path.resolve(fileDir, codeName));
    },
};

export const solidityAstCommand: Command = {
    name: "ast",
    title: "AST of all source files in a JSON or compact-JSON format.",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\.sol$/i,
        },
        {
            name: "format",
            alias: "f",
            type: "string",
            title: "-f, --format <json | compact-json>",
            defaultValue: "compact-json",
        },
        {
            name: "output-dir",
            alias: "o",
            type: "folder",
            title: "Output folder (current is default)",
            defaultValue: "",
        }
    ],
    async run(terminal: Terminal, args: {
        file: string,
        format: string,
        outputDir?: string
    }): Promise<void> {
        const ext = path.extname(args.file);
        if (ext !== ".sol") {
            terminal.log(`Choose solidity source file.`);
            return;
        }
        if(args.format.match(/^(compact-json|json)$/i) == null){
            terminal.log(`Wrong ast format.`);
            return;
        }
        await Component.ensureInstalledAll(terminal, components);
        const fileDir = path.dirname(args.file);
        const fileName = path.basename(args.file);
        const outputDir = path.resolve(args.outputDir ?? ".");
        delete args.outputDir;
        const astName = path.resolve(outputDir, changeExt(fileName, ".ast.json"));
        let astJson = await components.compiler.silentRun(terminal, fileDir, [`--ast-${args.format}`, fileName]);
        writeTextFile(astName, astJson);
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
            versions.stdlib = args.compiler;
        }
        if (args.linker !== "") {
            versions.linker = args.linker;
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
        solidityAstCommand,
        solidityVersionCommand,
        soliditySetCommand,
        solidityUpdateCommand,
    ],
};

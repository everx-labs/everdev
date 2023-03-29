import chalk from "chalk"
import { Command, Component, Terminal, ToolController } from "../../core"
import path from "path"
import {
    changeExt,
    defineFileType,
    uniqueFilePath,
    writeTextFile,
} from "../../core/utils"
import fs from "fs"
import mv from "mv"
import { BasicContract } from "./snippets"
import { components } from "./components"

export const SOLIDITY_FILE = defineFileType("Solidity", /\.t?sol$/i, [
    ".sol",
    ".tsol",
])

function resolveSoliditySource(file: string): {
    fileDir: string
    fileName: string
} {
    const fileDir = path.dirname(file)
    let fileName = path.basename(file)
    const exists = (name: string): boolean => {
        return fs.existsSync(path.resolve(fileDir, name))
    }
    if (!exists(fileName)) {
        for (const ext of SOLIDITY_FILE.extensions) {
            fileName = changeExt(fileName, ext)
            if (exists(fileName)) {
                break
            }
        }
        if (!exists(fileName)) {
            throw new Error(`Solidity source file ${file} does not exist.`)
        }
    }
    return { fileDir, fileName }
}

export const solidityVersionCommand: Command = {
    name: "version",
    title: "Show Solidity Version",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(await Component.getInfoAll(components))
        terminal.log(
            chalk.yellow(
                "\nYou can find the list of stable solc versions in Solidity Compiler changelog:" +
                    "\nhttps://github.com/tonlabs/TON-Solidity-Compiler/blob/master/Changelog_TON.md",
            ),
        )
    },
}

export const solidityCreateCommand: Command = {
    name: "create",
    title: "Create Solidity Contract",
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
        const filePath = uniqueFilePath(
            args.folder,
            `${args.name}{}${SOLIDITY_FILE.defaultExt}`,
        )
        const text = BasicContract.split("{name}").join(args.name)
        writeTextFile(filePath, text)
        terminal.log(`Solidity contract ${path.basename(filePath)} created.`)
    },
}

export const solidityCompileCommand: Command = {
    name: "compile",
    title: "Compile Solidity Contract",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: SOLIDITY_FILE.nameRegEx,
            greedy: true,
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
        {
            name: "base-path",
            alias: "b",
            type: "folder",
            title: "Set the given path as the root of the source tree (required solc 0.67.0 or later)",
            defaultValue: ".",
        },
        {
            name: "include-path",
            alias: "i",
            type: "folder",
            title: "Additional path(s) for inputs (required solc 0.57.0 or later), node_modules is default",
            defaultValue: "node_modules",
        },
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            outputDir: string
            basePath: string
            includePath: string
            code: boolean
        },
    ): Promise<void> {
        await Component.ensureInstalledAll(terminal, components)
        for (const file of args.file.split(" ")) {
            const { fileDir, fileName } = resolveSoliditySource(file)
            const outputDir = path.resolve(args.outputDir ?? ".")
            const basePath = path.resolve(args.basePath ?? ".")
            const includePath = args.includePath
                ? args.includePath
                      .split(",")
                      .map(p => path.resolve(p))
                      .join(" -i ")
                      .split(" ")
                : [path.resolve("node_modules")]
            const preserveCode = args.code
            const tvcName = path.resolve(outputDir, changeExt(fileName, ".tvc"))
            const abiName = path.resolve(
                outputDir,
                changeExt(fileName, ".abi.json"),
            )
            const codeName = path.resolve(
                outputDir,
                changeExt(fileName, ".code"),
            )

            const isDeprecatedVersion =
                (await components.compiler.getCurrentVersion()) <= "0.21.0"

            let linkerOut: string

            if (isDeprecatedVersion) {
                terminal.log(
                    "You use an obsolete version of the compiler.\nThe output files are saved in the current directory",
                )

                await components.compiler.silentRun(terminal, fileDir, [
                    fileName,
                ])
                linkerOut = await components.linker.silentRun(
                    terminal,
                    fileDir,
                    [
                        "compile",
                        codeName,
                        "-a",
                        abiName,
                        "--lib",
                        components.stdlib.path(),
                    ],
                )
            } else {
                await components.compiler.silentRun(terminal, fileDir, [
                    "-o",
                    outputDir,
                    ...(await addBasePathOption(basePath)),
                    ...(await addIncludePathOption(includePath)),
                    fileName,
                ])

                linkerOut = await components.linker.silentRun(
                    terminal,
                    fileDir,
                    ["compile", codeName, "--lib", components.stdlib.path()],
                )
            }

            const generatedTvcName = `${
                /Saved contract to file (.*)$/gm.exec(linkerOut)?.[1]
            }`

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
            )
            if (!preserveCode) {
                fs.unlinkSync(path.resolve(fileDir, codeName))
            }
        }
    },
}

export const solidityAstCommand: Command = {
    name: "ast",
    title: "AST of all source files in a JSON or compact-JSON format.",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: SOLIDITY_FILE.nameRegEx,
            greedy: true,
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
        },
        {
            name: "base-path",
            alias: "b",
            type: "folder",
            title: "Set the given path as the root of the source tree (required solc 0.67.0 or later)",
            defaultValue: ".",
        },
        {
            name: "include-path",
            alias: "i",
            type: "folder",
            title: "Additional path(s) for inputs (required solc 0.57.0 or later), node_modules is default",
            defaultValue: "node_modules",
        },
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            format: string
            basePath: string
            includePath: string
            outputDir?: string
        },
    ): Promise<void> {
        for (const file of args.file.split(" ")) {
            if (args.format.match(/^(compact-json|json)$/i) == null) {
                terminal.log(`Wrong ast format.`)
                return
            }
            await Component.ensureInstalledAll(terminal, components)
            const { fileDir, fileName } = resolveSoliditySource(file)
            args.outputDir = path.resolve(args.outputDir ?? ".")
            const basePath = path.resolve(args.basePath ?? ".")
            const includePath = args.includePath
                ? args.includePath
                      .split(",")
                      .map(p => path.resolve(p))
                      .join(" -i ")
                      .split(" ")
                : [path.resolve("node_modules")]

            await components.compiler.silentRun(terminal, fileDir, [
                `--ast-${args.format}`,
                "--output-dir",
                args.outputDir,
                ...(await addBasePathOption(basePath)),
                ...(await addIncludePathOption(includePath)),
                fileName,
            ])
        }
    },
}

export const solidityUpdateCommand: Command = {
    name: "update",
    title: "Update Solidity Compiler",
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
        await Component.updateAll(terminal, args.force, components)
    },
}

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
    async run(
        terminal: Terminal,
        args: {
            force: boolean
            compiler: string
            linker: string
            stdlib: string
        },
    ): Promise<void> {
        const versions: {
            compiler?: string
            linker?: string
            stdlib?: string
        } = {}
        if (args.compiler !== "") {
            versions.compiler = args.compiler
            versions.stdlib = args.compiler
        }
        if (args.linker !== "") {
            versions.linker = args.linker
        }
        await Component.setVersions(terminal, args.force, components, versions)
    },
}

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
}
async function addIncludePathOption(paths: string[]) {
    return (await components.compiler.getCurrentVersion()) >= "0.57.0"
        ? ["--include-path", ...paths]
        : []
}
async function addBasePathOption(path: string) {
    return (await components.compiler.getCurrentVersion()) >= "0.67.0"
        ? ["--base-path", path]
        : []
}

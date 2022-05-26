import path from "path"
import { Command, Component, Terminal, ToolController } from "../../core"
import { uniqueFilePath, writeTextFile } from "../../core/utils"
import { components } from "./components"
import { BasicTest } from "./snippets"

export const ts4VersionCommand: Command = {
    name: "version",
    title: "Show installed and available versions",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(await Component.getInfoAll(components))
    },
}

export const ts4InstallCommand: Command = {
    name: "install",
    title: "Install a specific release of TestSuite4",
    args: [
        {
            isArg: true,
            name: "version",
            type: "string",
            title: "TestSuite4 version (semver compatible)",
        },
    ],
    async run(terminal: Terminal, args: { version: string }) {
        const versions: {
            ts4?: string
        } = {
            ...(args.version !== "" ? { ts4: args.version } : {}),
        }
        await Component.setVersions(terminal, false, components, versions)
    },
}

export const ts4UpdateCommand: Command = {
    name: "update",
    title: "Update to the latest version",
    async run(terminal: Terminal): Promise<void> {
        await Component.updateAll(terminal, true, components)
    },
}

export const ts4CreateCommand: Command = {
    name: "create",
    title: "Create TestSuite4 test",
    args: [
        {
            isArg: true,
            name: "name",
            title: "Test script name",
            type: "string",
            defaultValue: "Test",
        },
        {
            name: "folder",
            type: "folder",
            title: "Target folder (current is default)",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        const filePath = uniqueFilePath(args.folder, `${args.name}{}.py`)
        const text = BasicTest.split("{name}").join(args.name)
        writeTextFile(filePath, text)
        terminal.log(
            `TestSuite4 test script ${path.basename(filePath)} created.`,
        )
    },
}

export const ts4RunCommand: Command = {
    name: "run",
    title: "Run TestSuite4's test",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            title: "Test",
            nameRegExp: /\.py$/i,
        },
    ],
    async run(terminal: Terminal, args: { file: string }): Promise<void> {
        const ext = path.extname(args.file)
        if (ext !== ".py") {
            terminal.log(`Choose file *.py`)
            return
        }
        await Component.ensureInstalledAll(terminal, components)
        const fileDir = path.dirname(args.file)
        const fileName = path.basename(args.file)

        await components.ts4.run(terminal, fileDir, [fileName])
    },
}

export const TestSuite4: ToolController = {
    name: "ts4",
    title: "TestSuite4 framework",
    commands: [
        ts4VersionCommand,
        ts4InstallCommand,
        ts4UpdateCommand,
        ts4CreateCommand,
        ts4RunCommand,
    ],
}

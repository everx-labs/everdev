import chalk from "chalk"
import { Command, Component, Terminal, ToolController } from "../../core"
import { components } from "./components"

export const soldVersionCommand: Command = {
    name: "version",
    title: "Show Sold Version",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(await Component.getInfoAll(components))
        terminal.log(
            chalk.yellow(
                "\nYou can find the list of stable sold versions in Solidity Compiler changelog:" +
                    "\nhttps://github.com/tonlabs/TON-Solidity-Compiler/blob/master/Changelog_TON.md",
            ),
        )
    },
}

export const soldUpdateCommand: Command = {
    name: "update",
    title: "Update Sold Compiler Driver",
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

export const soldInstallCommand: Command = {
    name: "install",
    title: "Install latest stable sold",
    args: [],
    async run(terminal: Terminal) {
        await Component.ensureInstalledAll(terminal, components)
    },
}

export const soldSetCommand: Command = {
    name: "set",
    title: "Change installed version",
    args: [
        {
            name: "version",
            title: "version to install (e.g. 0.8.1 or latest)",
            type: "string",
            defaultValue: "latest",
        },
    ],
    async run(terminal: Terminal, args: { version: string }): Promise<void> {
        await Component.setVersions(terminal, false, components, {
            driver: args.version,
        })
    },
}

export const Sold: ToolController = {
    name: "sold",
    title: "Sold Compiler Driver",
    commands: [
        soldVersionCommand,
        soldUpdateCommand,
        soldInstallCommand,
        soldSetCommand,
    ],
}

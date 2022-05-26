import { Command, Component, Terminal, ToolController } from "../../core"
import { components } from "./components"

export const tonosInstallCommand: Command = {
    name: "install",
    title: "Install latest stable TON OS CLI",
    args: [],
    async run(terminal: Terminal) {
        await Component.ensureInstalledAll(terminal, components)
    },
}

export const tonosSetCommand: Command = {
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
            tonoscli: args.version,
        })
    },
}

export const tonosUpdateCommand: Command = {
    name: "update",
    title: "Update to the latest version",
    async run(terminal: Terminal): Promise<void> {
        await Component.updateAll(terminal, false, components)
    },
}

export const tonosVersionCommand: Command = {
    name: "version",
    title: "Show installed and available versions",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(await Component.getInfoAll(components))
    },
}

export const TONOS: ToolController = {
    name: "tonos-cli",
    title: "TON OS CLI",
    commands: [
        tonosInstallCommand,
        tonosSetCommand,
        tonosVersionCommand,
        tonosUpdateCommand,
    ],
}

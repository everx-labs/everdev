import { Command, Component, Terminal, ToolController } from "../../core"
import { components } from "./components"

export const soldVersionCommand: Command = {
    name: "version",
    title: "Show Sold Version",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(await Component.getInfoAll(components))
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

export const Sold: ToolController = {
    name: "sold",
    title: "Sold Compiler Driver",
    commands: [soldVersionCommand, soldUpdateCommand],
}

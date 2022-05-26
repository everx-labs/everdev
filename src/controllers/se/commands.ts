import { SERegistry, RegistryError } from "./registry"
import { Command, CommandArg, Terminal } from "../../core"
import { formatTable, StringTerminal } from "../../core/utils"
import { printUsage } from "../../everdev/help"
import { SE } from "."

export const instanceArg: CommandArg = {
    isArg: true,
    name: "instance",
    type: "string",
    defaultValue: "*",
    title: "SE Instance Filter",
}

const forceArg: CommandArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Delete multiple instances",
    description:
        'If you want to delete several instances (e.g. with "*") you should set this option.',
    defaultValue: "false",
}

export const seInfoCommand: Command = {
    name: "info",
    title: "Show SE Info",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        const table: (string | number | undefined)[][] = [
            [
                "Instance",
                "State",
                "Version",
                "GraphQL Port",
                "ArangoDB Port",
                "Docker Container",
                "Docker Image",
            ],
        ]
        const registry = new SERegistry()
        for (const item of registry.filter(args.instance, false)) {
            const info = await registry.getItemInfo(item)
            table.push([
                item.name,
                info.state,
                await registry.getSourceInfo(item),
                item.port,
                item.dbPort,
                info.docker.container,
                info.docker.image,
            ])
        }
        terminal.log(formatTable(table, { headerSeparator: true }))
    },
}

export const seVersionCommand: Command = {
    name: "version",
    title: "Show SE Versions",
    async run(terminal: Terminal): Promise<void> {
        const registry = new SERegistry()
        for (const item of registry.items) {
            terminal.log(`${item.name}: ${await registry.getSourceInfo(item)}`)
        }
        terminal.log(
            `Available Versions: ${(await SERegistry.getVersions()).join(
                ", ",
            )}`,
        )
    },
}

export const seStartCommand: Command = {
    name: "start",
    title: "Start SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await new SERegistry().start(terminal, args.instance)
    },
}

export const seStopCommand: Command = {
    name: "stop",
    title: "Stop SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await new SERegistry().stop(terminal, args.instance)
    },
}

export const seResetCommand: Command = {
    name: "reset",
    title: "Reset SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await new SERegistry().reset(terminal, args.instance)
    },
}

export const seUpdateCommand: Command = {
    name: "update",
    title: "Update SE Instance Version",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await new SERegistry().update(terminal, args.instance)
    },
}

export const seSetCommand: Command = {
    name: "set",
    title: "Update SE Instance Config",
    args: [
        instanceArg,
        {
            name: "version",
            title: "SE version (version number or `latest`)",
            type: "string",
            defaultValue: "",
        },
        {
            name: "image",
            title: "Custom SE docker image name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "container",
            title: "Custom SE docker container name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "port",
            title: "Port on localhost used to expose GraphQL API",
            type: "string",
            defaultValue: "",
        },
        {
            name: "db-port",
            title: "Port on localhost used to expose ArangoDB API (number or `none`)",
            type: "string",
            defaultValue: "",
        },
    ],
    async run(
        terminal: Terminal,
        args: {
            version: string
            image: string
            container: string
            port: string
            dbPort: string
            instance: string
        },
    ): Promise<void> {
        try {
            await new SERegistry().configure(terminal, args)
        } catch (err: any) {
            if (err instanceof RegistryError) {
                // Show HELP section
                const terminal = new StringTerminal()
                terminal.log(err.message + "\n")
                await printUsage(terminal, SE, this)
                throw Error(terminal.stdout)
            } else {
                throw err
            }
        }
    },
}

export const seDeleteCommand: Command = {
    name: "delete",
    title: "Delete SE from list",
    description: "This command doesn't delete any docker container or image.",
    args: [instanceArg, forceArg],
    async run(_terminal: Terminal, args: { instance: string; force: boolean }) {
        new SERegistry().delete(args.instance, args.force)
    },
}

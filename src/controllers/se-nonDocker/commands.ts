
import { Command, Terminal } from "../../core";
import { formatTable } from "../../core/utils";
import * as tonosTondev from "tonos-se-tondev";
let tonosSe = require("@ton-actions/tonos-se-package");

export const seInfoCommand: Command = {
    name: "info",
    title: "Show SE Info",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        const table: any[][] = [[
            "State",
            "Version",
            "GraphQL Port",
            "ArangoDB Port",
        ]]

        const info = await tonosTondev.seInfoCommand(tonosSe);
        table.push([
            info.state,
            info.version,
            info.port,
            info.dbPort
        ]);
        terminal.log(formatTable(table, { headerSeparator: true }))
    },
};

export const seVersionCommand: Command = {
    name: "version",
    title: "Show SE Versions",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const version = await tonosTondev.seVersionCommand(tonosSe);
        terminal.log(`Current version: ${version.current}`);
        terminal.log(`Available Versions: ${(version.availableVersions).join(", ")}`);
    },
};

export const seStartCommand: Command = {
    name: "start",
    title: "Start SE Instance",
    args: [],
    async run(): Promise<void> {
        await tonosTondev.seStartCommand(tonosSe);
    },
};

export const seStopCommand: Command = {
    name: "stop",
    title: "Stop SE Instance",
    args: [],
    async run(): Promise<void> {
        await tonosTondev.seStopCommand(tonosSe);
    },
};

export const seResetCommand: Command = {
    name: "reset",
    title: "Reset SE Instance",
    args: [],
    async run(): Promise<void> {
        await tonosTondev.seResetCommand(tonosSe);
    },
};

export const seUpdateCommand: Command = {
    name: "update",
    title: "Update SE Instance Version",
    args: [],
    async run(): Promise<void> {
        await tonosTondev.seUpdateCommand(tonosSe);
    },
};

export const seSetCommand: Command = {
    name: "set",
    title: "Update SE Instance Config",
    args: [
        {
            name: "version",
            title: "SE version (version number or `latest`)",
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
        }
    ],
    async run(_undefined, args: {
        version: string,
        port: string,
        dbPort: string,
        instance: string
    }): Promise<void> {
        if (!args.version && !args.port && !args.dbPort){
            return;
        }
        await tonosTondev.seStopCommand(tonosSe);
        if (args.version) {
            await tonosTondev.seSetVersionCommand(args.version);
        }
        if (args.port || args.dbPort){
            await tonosTondev.seSetPortsCommand(tonosSe, args.port, args.dbPort);
        }
        delete require.cache[require.resolve('@ton-actions/tonos-se-package')]
        tonosSe = require("@ton-actions/tonos-se-package");        
        await tonosTondev.seStartCommand(tonosSe);
    },
};

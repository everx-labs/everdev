import { Command, Terminal } from "../../core";
import { formatTable } from "../../core/utils";
import * as tonosTondev from "@ton-actions/tonos-se-tondev";

import {
    progress,
    progressDone,
    compareVersions
} from "../../core/utils";

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
        progress(terminal, 'Initialization...');
        const info = await tonosTondev.seInfoCommand();
        progressDone(terminal);
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
        progress(terminal, 'Initialization...');
        const current = await tonosTondev.seVersionCommand();
        const availableVersions = await tonosTondev.getAvailableVersions();
        progressDone(terminal);
        terminal.log(`Current version: ${current}`);
        terminal.log(`Available Versions: ${(availableVersions).sort(compareVersions).join(", ")}`);
    },
};

export const seStartCommand: Command = {
    name: "start",
    title: "Start SE Instance",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        progress(terminal, 'Starting...');
        await tonosTondev.seStartCommand();
        progressDone(terminal);
    },
};

export const seStopCommand: Command = {
    name: "stop",
    title: "Stop SE Instance",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        progress(terminal, 'Stoping...');
        await tonosTondev.seStopCommand();
        progressDone(terminal);
    },
};


export const seRestartCommand: Command = {
    name: "restart",
    title: "Restart SE Instance",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        progress(terminal, 'Resarting...');
        await tonosTondev.seStopCommand();
        await tonosTondev.seStartCommand();
        progressDone(terminal);
    },
};

export const seResetCommand: Command = {
    name: "reset",
    title: "Reset SE Instance",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        progress(terminal, 'Reseting...');
        await tonosTondev.seResetCommand();
        progressDone(terminal);
    },
};

export const seUpdateCommand: Command = {
    name: "update",
    title: "Update SE Instance Version",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        progress(terminal, 'Updating...');
        await tonosTondev.seSetCommand('latest', "", "");
        progressDone(terminal);
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
            title: "Port on localhost used to expose ArangoDB API",
            type: "string",
            defaultValue: "",
        }
    ],
    async run(terminal: Terminal, args: {
        version: string,
        port: string,
        dbPort: string,
        'db-port': string
    }): Promise<void> {
        progress(terminal, 'Updating config...');
        // workaround for VSCode plugin, so it pass db-port property...
        args.dbPort ??= args['db-port'];
        if (!args.version && !args.port && !args.dbPort) {
            return;
        }
        if (args.version) {
            const availableVersions = await tonosTondev.getAvailableVersions();
            if (!availableVersions.includes(args.version)) {
                throw new Error(`Invalid version: ${args.version} Available versions: ${(availableVersions).sort(compareVersions).join(", ")}`);
            }
        }
        await tonosTondev.seSetCommand(args.version, args.port, args.dbPort);
        progressDone(terminal);
    },
};

import {
    Command,
    CommandArg,
    Terminal,
    ToolController,
} from "../../core";
import {
    loadStore,
    addNet,
    saveStore,
    getNet,
} from "./store";
import {formatTable} from "../../core/utils";

const forceArg: CommandArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Overwrite key if already exists",
    defaultValue: "false",
};

export const netAddCommand: Command = {
    name: "add",
    title: "Add net",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
        {
            isArg: true,
            name: "endpoints",
            type: "string",
            title: "Comma separated endpoints",
        },
        forceArg,
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        endpoints: string,
        dictionary: string,
        force: boolean
    }) {
        const endpoints = args.endpoints.split(",").filter(x => x !== "");
        await addNet(args.name, "", endpoints, args.force);
    },
};

export const netListCommand: Command = {
    name: "list",
    title: "Prints list of nets",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const store = loadStore();
        const rows = [["Net", "Endpoints", "Description"]];
        store.nets.forEach((net) => {
            rows.push([
                `${net.name}${net.name === store.default ? " (Default)" : ""}`,
                net.endpoints[0] ?? "",
                net.description ?? "",
            ]);
            net.endpoints.slice(1).forEach(x => rows.push(["", x, ""]));
        });
        terminal.log(formatTable(rows, {headerSeparator: true}));
    },
};

export const netDeleteCommand: Command = {
    name: "delete",
    title: "Delete net from store",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const net = getNet(args.name);
        const store = loadStore();
        store.nets.splice(store.nets.findIndex(x => x.name === net.name), 1);
        if (store.default === net.name) {
            delete store.default;
        }
        saveStore(store);
    },
};

export const netDefaultCommand: Command = {
    name: "default",
    title: "Set default net",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const net = getNet(args.name);
        const store = loadStore();
        store.default = net.name;
        saveStore(store);
    },
};


export const Net: ToolController = {
    name: "net",
    title: "Blockchain Networks",
    commands: [
        netAddCommand,
        netDeleteCommand,
        netListCommand,
        netDefaultCommand,
    ],
};

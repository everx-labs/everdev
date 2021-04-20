import {
    Command,
    CommandArg,
    Terminal,
    ToolController,
} from "../../core";
import {
    NetworkRegistry,
} from "./registry";
import {
    formatTable,
    parseNumber,
} from "../../core/utils";

const forceArg: CommandArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Overwrite key if already exists",
    defaultValue: "false",
};

const nameArg: CommandArg = {
    isArg: true,
    name: "name",
    type: "string",
    title: "Network name",
};

export const networkAddCommand: Command = {
    name: "add",
    title: "Add net",
    args: [
        nameArg,
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
        new NetworkRegistry().add(args.name, "", endpoints, args.force);
    },
};

export const networkListCommand: Command = {
    name: "list",
    alias: "l",
    title: "Prints list of networks",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const registry = new NetworkRegistry();
        const rows = [["Network", "Endpoints", "Giver", "Description"]];
        registry.items.forEach((network) => {
            const maxEndpoints = 3;
            const endpoints = network.endpoints.length <= maxEndpoints
                ? network.endpoints
                : [...network.endpoints.slice(0, maxEndpoints), "..."];
            rows.push([
                `${network.name}${network.name === registry.default ? " (Default)" : ""}`,
                endpoints.join(", "),
                network.giver?.address ?? "",
                network.description ?? "",
            ]);
        });
        const table = formatTable(rows, { headerSeparator: true });
        if (table.trim() !== "") {
            terminal.log();
            terminal.log(table);
            terminal.log();
        }
    },
};

export const networkInfoCommand: Command = {
    name: "info",
    alias: "i",
    title: "Prints network detailed information",
    args: [
        {
            ...nameArg,
            defaultValue: "",
        },
    ],
    async run(terminal: Terminal, args: { name: string }) {
        if (args.name === "") {
            return networkListCommand.run(terminal, {});
        }
        const registry = new NetworkRegistry();
        const network = registry.get(args.name);
        const rows = [["Network", network.name]];
        rows.push(["Endpoints", network.endpoints.join(", ")]);
        const giver = network.giver;
        if (giver) {
            rows.push([
                "Giver",
                `${giver.name} at ${giver.address}${giver.signer ? ` signed by ${giver.signer}` : ""}`,
            ]);
        }
        if (network.name === registry.default) {
            rows.push(["Default", "true"]);
        }
        if (network.description) {
            rows.push(["Description", network.description]);
        }
        terminal.log();
        terminal.log(formatTable(rows));
        terminal.log();
    },
};

export const networkDeleteCommand: Command = {
    name: "delete",
    title: "Delete network from registry",
    args: [nameArg],
    async run(_terminal: Terminal, args: { name: string }) {
        new NetworkRegistry().delete(args.name);
    },
};

export const networkDefaultCommand: Command = {
    name: "default",
    alias: "d",
    title: "Set default network",
    args: [nameArg],
    async run(_terminal: Terminal, args: { name: string }) {
        new NetworkRegistry().setDefault(args.name);
    },
};


export const networkGiverCommand: Command = {
    name: "giver",
    alias: "g",
    title: "Set giver for network",
    args: [
        nameArg,
        {
            isArg: true,
            name: "address",
            title: "Giver address",
            type: "string",
            defaultValue: "",
        },
        {
            name: "signer",
            alias: "s",
            title: "Signer to be used with giver",
            type: "string",
            defaultValue: "",
        },
        {
            name: "value",
            alias: "v",
            title: "Deploying account initial balance",
            type: "string",
            defaultValue: "",
        },
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        address: string,
        signer: string,
        value: string,
    }) {
        const value = parseNumber(args.value);
        return new NetworkRegistry().setGiver(args.name, args.address, args.signer, value);
    },
};

export const NetworkTool: ToolController = {
    name: "network",
    alias: "n",
    title: "Network Registry",
    commands: [
        networkAddCommand,
        networkDeleteCommand,
        networkListCommand,
        networkInfoCommand,
        networkDefaultCommand,
        networkGiverCommand,
    ],
};

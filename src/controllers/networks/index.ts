import {
    Command,
    CommandArg,
    Terminal,
    ToolController,
} from "../../core";
import {
    NetworkRegistry,
} from "./registry";
import {formatTable} from "../../core/utils";

const forceArg: CommandArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Overwrite key if already exists",
    defaultValue: "false",
};

// const networkArg: CommandArg = {
//     name: "network",
//     alias: "n",
//     type: "string",
//     title: "Network name",
//     defaultValue: "",
// };
//
// const signerArg: CommandArg = {
//     name: "signer",
//     alias: "s",
//     title: "Signer key name",
//     type: "string",
//     defaultValue: "",
// };

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
        new NetworkRegistry().add(args.name, "", endpoints, args.force);
    },
};

export const netListCommand: Command = {
    name: "list",
    alias: "l",
    title: "Prints list of nets",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const registry = new NetworkRegistry();
        const rows = [["Network", "Endpoints", "Giver", "Description"]];
        registry.networks.forEach((network) => {
            rows.push([
                `${network.name}${network.name === registry.default ? " (Default)" : ""}`,
                network.endpoints[0] ?? "",
                network.giver ? `${network.giver.address} (${network.giver.signer})` : "",
                network.description ?? "",
            ]);
            network.endpoints.slice(1).forEach(x => rows.push(["", x, ""]));
        });
        const table = formatTable(rows, {headerSeparator: true});
        if (table.trim() !== "") {
            terminal.log();
            terminal.log(table);
            terminal.log();
        }
    },
};

export const netDeleteCommand: Command = {
    name: "delete",
    title: "Delete network from registry",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        new NetworkRegistry().delete(args.name);
    },
};

export const netDefaultCommand: Command = {
    name: "default",
    alias: "d",
    title: "Set default net",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        new NetworkRegistry().setDefault(args.name);
    },
};


// export const netGiverCommand: Command = {
//     name: "giver",
//     title: "Set giver for network",
//     args: [
//         networkArg,
//         {
//             isArg: true,
//             name: "address",
//             title: "Giver address",
//             type: "string",
//         },
//         signerArg,
//     ],
//     async run(_terminal: Terminal, args: {
//         network: string,
//         address: string,
//         signer: string,
//     }) {
//         new NetworkRegistry().setGiver(args.network, args.address, args.signer);
//     },
// };

export const Networks: ToolController = {
    name: "networks",
    alias: "n",
    title: "Networks Registry",
    commands: [
        netAddCommand,
        netDeleteCommand,
        netListCommand,
        netDefaultCommand,
        // netGiverCommand,
    ],
};

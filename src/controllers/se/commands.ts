import {
    filterConfigInstances,
    getConfig,
    getInstanceInfo,
    getLatestVersion,
    getVersions,
    instanceContainerDef,
    PORT_NONE,
    SEInstanceConfig,
    updateConfig
} from "./installer";
import { Command, CommandArg, Terminal } from "../../core";
import { ContainerDef, ContainerStatus, DevDocker } from "./docker";
import { formatTable } from "../../core/utils";

export const instanceArg: CommandArg = {
    isArg: true,
    name: "instance",
    type: "string",
    defaultValue: "*",
    title: "SE Instance Filter",
};

async function controlInstances(
    instanceFilter: string,
    control: (docker: DevDocker, defs: ContainerDef[]) => Promise<void>
): Promise<void> {
    const defs: ContainerDef[] = (await filterConfigInstances(instanceFilter)).map(instanceContainerDef);
    await control(new DevDocker(), defs);
}

export const seInfoCommand: Command = {
    name: "info",
    title: "Show SE Info",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        const docker = new DevDocker();
        const table: any[][] = [[
            "Instance",
            "State",
            "Version",
            "GraphQL Port",
            "ArangoDB Port",
            "Docker Container",
            "Docker Image",
        ]]
        for (const instance of await filterConfigInstances(args.instance)) {
            const info = await getInstanceInfo(docker, instance);
            table.push([
                instance.name,
                info.state,
                instance.version,
                instance.port,
                instance.dbPort,
                info.docker.container,
                info.docker.image,
            ]);
        }
        terminal.log(formatTable(table, { headerSeparator: true }))
    },
};

export const seVersionCommand: Command = {
    name: "version",
    title: "Show SE Versions",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        for (const instance of (await getConfig()).instances) {
            terminal.log(`${instance.name}: ${instance.version}`);
        }
        terminal.log(`Available Versions: ${(await getVersions()).join(", ")}`);
    },
};

export const seStartCommand: Command = {
    name: "start",
    title: "Start SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await controlInstances(args.instance, async (docker, defs) => {
            await docker.startupContainers(terminal, defs, ContainerStatus.running);
        });
    },
};

export const seStopCommand: Command = {
    name: "stop",
    title: "Stop SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await controlInstances(args.instance, async (docker, defs) => {
            await docker.shutdownContainers(terminal, defs, ContainerStatus.created);
        });
    },
};

export const seResetCommand: Command = {
    name: "reset",
    title: "Reset SE Instance",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await controlInstances(args.instance, async (docker, defs) => {
            await docker.shutdownContainers(terminal, defs, ContainerStatus.missing);
            await docker.startupContainers(terminal, defs, ContainerStatus.running);
        });
    },
};

export const seUpdateCommand: Command = {
    name: "update",
    title: "Update SE Instance Version",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        await updateConfig(terminal, args.instance, {
            version: await getLatestVersion(),
        });
    },
};

export const seSetCommand: Command = {
    name: "set",
    title: "Update SE Instance Config",
    args: [instanceArg,
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
    async run(terminal: Terminal, args: {
        version: string,
        port: string,
        "db-port": string,
        instance: string
    }): Promise<void> {
        const updates: Partial<SEInstanceConfig> = {};
        if (args.version !== "") {
            if (args.version.toLowerCase() === "latest") {
                updates.version = await getLatestVersion();
            } else {
                if (!(await getVersions()).includes(args.version)) {
                    throw new Error(`Invalid version: ${args.version}`);
                }
                updates.version = args.version;
            }
        }

        if (args.port !== "") {
            updates.port = Number.parseInt(args.port);
            if (updates.port === undefined) {
                throw new Error(`Invalid port: ${args.port}`);
            }
        }

        if (args["db-port"] !== "") {
            if (args["db-port"].toLowerCase() === "none") {
                updates.dbPort = PORT_NONE;
            } else {
                updates.dbPort = Number.parseInt(args["db-port"]);
                if (updates.port === undefined) {
                    throw new Error(`Invalid db-port: ${args["db-port"]}`);
                }
            }
        }
        await updateConfig(terminal, args.instance, updates);
    },
};
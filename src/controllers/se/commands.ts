import {
    filterInstances,
    getConfig,
    getInstanceInfo,
    getLatestVersion,
    getVersions,
    instanceContainerDef,
    isInstanceMatched,
    setConfig
} from "./installer";
import { Command, CommandArg, Terminal } from "../../core";
import { ContainerDef, ContainerStatus, DevDocker } from "./docker";

export const instanceArg: CommandArg = {
    name: "instance",
    type: "string",
    defaultValue: "*",
    title: "SE Instance Filter",
};

async function controlInstances(
    instanceFilter: string,
    control: (docker: DevDocker, defs: ContainerDef[]) => Promise<void>
): Promise<void> {
    const defs: ContainerDef[] = (await filterInstances(instanceFilter)).map(instanceContainerDef);
    await control(new DevDocker(), defs);
}


export const seInfoCommand: Command = {
    name: "info",
    title: "Show TON SE Info",
    args: [instanceArg],
    async run(terminal: Terminal, args: { instance: string }): Promise<void> {
        const docker = new DevDocker();
        for (const instance of await filterInstances(args.instance)) {
            const info = await getInstanceInfo(docker, instance);
            terminal.log(`${instance.name}: ${info.state}`);
            terminal.log(`    Config: --version ${instance.version} --port ${instance.port} --db-port ${instance.dbPort ?? "none"}`);
            terminal.log(`    Docker: ${info.docker.container} (${info.docker.image})`);
        }
    },
};

export const seVersionCommand: Command = {
    name: "version",
    title: "Show Node SE Version",
    args: [{
        name: "available",
        type: "string",
        defaultValue: "false",
        title: "Show available versions",
    }],
    async run(terminal: Terminal, args: { available: string }): Promise<void> {
        for (const instance of (await getConfig()).instances) {
            terminal.log(`${instance.name}: ${instance.version}`);
        }
        if (args.available === "true") {
            terminal.log(`Available: ${(await getVersions()).join(", ")}`);
        }
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
        const config = await getConfig();
        const latestVersion = await getLatestVersion();
        const docker = new DevDocker();
        for (const instance of config.instances) {
            if (isInstanceMatched(instance, args.instance)) {
                instance.version = latestVersion;
                const def = instanceContainerDef(instance);
                await docker.shutdownContainer(terminal, def, ContainerStatus.missing);
                await docker.startupContainer(terminal, def, ContainerStatus.created);
            }
        }
        setConfig(config);
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
        const config = await getConfig();
        const docker = new DevDocker();
        
        let version: string | undefined = undefined;
        if (args.version !== "") {
            if (args.version.toLowerCase() === "latest") {
                version = await getLatestVersion();
            } else {
                if (!(await getVersions()).includes(args.version)) {
                    throw new Error(`Invalid version: ${args.version}`);
                }
                version = args.version;
            }
        }
        
        let port: number | undefined = undefined;
        if (args.port !== "") {
            port = Number.parseInt(args.port);
            if (port === undefined) {
                throw new Error(`Invalid port: ${args.port}`);
            }
        }
        
        let dbPort: number | "none" | undefined = undefined;
        if (args["db-port"] !== "") {
            if (args["db-port"].toLowerCase() === "none") {
                dbPort = "none";
            } else {
                dbPort = Number.parseInt(args["db-port"]);
                if (port === undefined) {
                    throw new Error(`Invalid db-port: ${args["db-port"]}`);
                }
            }
        }

        for (const instance of config.instances) {
            if (isInstanceMatched(instance, args.instance)) {
                if (version !== undefined) {
                    instance.version = version;
                }
                if (port !== undefined) {
                    instance.port = port;
                }
                if (dbPort === "none") {
                    delete instance.dbPort;
                } else if (dbPort !== undefined) {
                    instance.dbPort = dbPort;
                }
                const def = instanceContainerDef(instance);
                await docker.shutdownContainer(terminal, def, ContainerStatus.missing);
                await docker.startupContainer(terminal, def, ContainerStatus.created);
            }
        }
        setConfig(config);
    },
};
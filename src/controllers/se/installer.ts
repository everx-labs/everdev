import * as path from "path";
import * as fs from "fs";

import { tondevHome } from "../../core";
import { httpsGetJson, userIdentifier, versionToNumber } from "../../core/utils";
import { ContainerDef, DevDocker } from "./docker";
import Dockerode from "dockerode";

const DEFAULT_INSTANCE_NAME = "default";
const DEFAULT_INSTANCE_PORT = 2020;
const DOCKER_IMAGE_NAME = "tonlabs/local-node";
const DOCKER_CONTAINER_NAME_PREFIX = "tonlabs-tonos-se";

/**
 * SE instance config
 */
type SEInstanceConfig = {
    /**
     * Instance name
     */
    name: string,
    /**
     * Components version
     */
    version: string,
    /**
     * Port on localhost used to expose GraphQL API
     * GraphQL API is accessible through http://localhost:port/graphql
     * Node Requests API is accessible through http://localhost:port/topics/requests
     * Default value: 2020
     */
    port: number,
    /**
     * Port on localhost used to expose ArangoDB API
     */
    dbPort?: number,
    /**
     * Optional port on localhost used to expose Node API
     */
    nodePort?: number,
}

type SEConfig = {
    instances: SEInstanceConfig[],
}

function compareVersions(a: string, b: string): number {
    const an = versionToNumber(a);
    const bn = versionToNumber(b);
    return an < bn ? -1 : (an === bn ? 0 : 1);
}

export async function getVersions(): Promise<string[]> {
    const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
    return (await httpsGetJson(url)).results.map((x: any) => x.name).sort(compareVersions);
}

export async function getLatestVersion(): Promise<string> {
    const versions = await getVersions();
    const version = versions.pop();
    if (version && version.toLowerCase() !== "latest") {
        return version;
    }
    return versions.pop() ?? "";
}

function configPath(): string {
    return path.resolve(tondevHome(), "se", "config.json");
}

export async function getConfig(): Promise<SEConfig> {
    let config: SEConfig | null = null;
    try {
        if (fs.existsSync(configPath())) {
            config = JSON.parse(fs.readFileSync(configPath(), "utf8"));
        }
    } catch {
    }
    if (!config) {
        config = { instances: [] };
    } else if (!config.instances) {
        config.instances = [];
    }
    if (config.instances.length === 0) {
        config.instances.push({
            name: DEFAULT_INSTANCE_NAME,
            port: DEFAULT_INSTANCE_PORT,
            version: await getLatestVersion(),
        });
        await setConfig(config);
    }
    return config;
}

export async function setConfig(config: SEConfig) {
    const configDir = path.dirname(configPath());
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath(), JSON.stringify(config, undefined, "    "), "utf8");
}

export function isInstanceMatched(instance: SEInstanceConfig, instanceFilter: string): boolean {
    return instanceFilter === "*" || instanceFilter.toLowerCase() === instance.name.toLowerCase();
}

export async function filterInstances(instanceFilter: string): Promise<SEInstanceConfig[]> {
    const filtered: SEInstanceConfig[] = [];
    for (const instance of (await getConfig()).instances) {
        if (isInstanceMatched(instance, instanceFilter)) {
            filtered.push(instance);
        }
    }
    return filtered;
}

export function instanceContainerDef(instance: SEInstanceConfig): ContainerDef {
    const requiredImage = `${DOCKER_IMAGE_NAME}:${instance.version}`;
    const suffix = instance.name !== DEFAULT_INSTANCE_NAME ? `-${instance.name}` : '';
    const containerName = `${DOCKER_CONTAINER_NAME_PREFIX}-${userIdentifier()}${suffix}`;
    return {
        requiredImage,
        containerName,
        createContainer(docker: DevDocker) {
            const ports: Dockerode.PortMap = {
                '80/tcp': [
                    {
                        HostIp: '',
                        HostPort: `${instance.port}`,
                    },
                ],
            };
            if (instance.dbPort) {
                ports['8529/tcp'] = [
                    {
                        HostIp: '',
                        HostPort: `${instance.dbPort}`,
                    },
                ]
            }
            return docker.client.createContainer({
                name: containerName,
                // interactive: true,
                Image: requiredImage,
                Env: ['USER_AGREEMENT=yes'],
                HostConfig: {
                    PortBindings: ports,
                },
            });
        }
    };
}

function mapContainerName(name: string): string {
    return name.startsWith('/') ? name.substr(1) : name;
}

type SEInstanceInfo = {
    state: string,
    docker: {
        image: string,
        container: string,
    }
}

export async function getInstanceInfo(docker: DevDocker, instance: SEInstanceConfig): Promise<SEInstanceInfo> {
    const def = instanceContainerDef(instance);
    const info: Dockerode.ContainerInfo | null = await docker.findContainerInfo(def.containerName);
    return {
        state: info ? info.State : "not installed",
        docker: {
            image: info?.Image ?? def.requiredImage,
            container: info?.Names.map(mapContainerName).join(', ') ?? def.containerName,
        }
    };
}


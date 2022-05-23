import path from "path"
import fs from "fs"

import { Terminal, everdevHome } from "../../core"
import {
    compareVersionsDescending,
    httpsGetJson,
    userIdentifier,
    writeJsonFile,
} from "../../core/utils"
import { ContainerDef, ContainerStatus, DevDocker } from "../../core/docker"
import Dockerode from "dockerode"

const DEFAULT_INSTANCE_NAME = "default"
const DEFAULT_INSTANCE_PORT = 80
const DOCKER_IMAGE_NAME = "tonlabs/local-node"
const DOCKER_CONTAINER_NAME_PREFIX = "tonlabs-tonos-se"
export const PORT_NONE = -1

const TOOL_FOLDER_NAME = "se"

function seHome() {
    return path.resolve(everdevHome(), TOOL_FOLDER_NAME)
}

export enum SESourceType {
    TONOS_SE_VERSION = "tonos-se-version",
    DOCKER_IMAGE = "docker-image",
    DOCKER_CONTAINER = "docker-container",
}

export type SESource =
    | {
          type: SESourceType.TONOS_SE_VERSION
          version: string
      }
    | {
          type: SESourceType.DOCKER_IMAGE
          image: string
      }
    | {
          type: SESourceType.DOCKER_CONTAINER
          container: string
          image: string
      }

export function seSourceVersion(version: string): SESource {
    return {
        type: SESourceType.TONOS_SE_VERSION,
        version,
    }
}

export function seSourceDockerImage(image: string): SESource {
    return {
        type: SESourceType.DOCKER_IMAGE,
        image,
    }
}

export function seSourceDockerContainer(
    container: string,
    image: string,
): SESource {
    return {
        type: SESourceType.DOCKER_CONTAINER,
        container,
        image,
    }
}

/**
 * SE instance config
 */
export type SERegistryItem = {
    /**
     * Instance name
     */
    name: string

    /**
     * SE Instance Source
     */
    source: SESource

    /**
     * Port on localhost used to expose GraphQL API
     * GraphQL API is accessible through http://localhost:port/graphql
     * Node Requests API is accessible through http://localhost:port/topics/requests
     * Default value: 80
     */
    port: number

    /**
     * Port on localhost used to expose ArangoDB API
     */
    dbPort?: number

    /**
     * Optional port on localhost used to expose Node API
     */
    nodePort?: number
}

type SERegistryItemInfo = {
    state: string
    docker: {
        image: string
        container: string
    }
}

function registryPath(): string {
    return path.resolve(seHome(), "config.json")
}

function mapContainerName(name: string): string {
    return name.startsWith("/") ? name.substr(1) : name
}

export function updateInstance(
    instance: SERegistryItem,
    updates: Partial<SERegistryItem>,
) {
    if (
        updates.source === undefined &&
        updates.port === undefined &&
        updates.dbPort === undefined
    ) {
        throw new Error(
            "There is nothing to set. You have to specify at least one config parameter. See command help.",
        )
    }

    if (updates.source !== undefined) {
        instance.source = updates.source
    }
    if (updates.port !== undefined) {
        instance.port = updates.port
    }
    if (updates.dbPort === PORT_NONE) {
        delete instance.dbPort
    } else if (updates.dbPort !== undefined) {
        instance.dbPort = updates.dbPort
    }
}

export class SERegistry {
    items: SERegistryItem[]
    private docker: DevDocker | undefined = undefined

    constructor() {
        this.items = []
        try {
            if (fs.existsSync(registryPath())) {
                const loaded = JSON.parse(
                    fs.readFileSync(registryPath(), "utf8"),
                )
                this.items = loaded?.instances ?? loaded?.items ?? []
                this.items.forEach(instance => {
                    const deprecated = instance as unknown as {
                        version?: string
                    }
                    if (deprecated.version !== undefined) {
                        instance.source = seSourceVersion(deprecated.version)
                        delete deprecated.version
                    }
                })
            }
        } catch {}
        if (this.items.length === 0) {
            this.items.push({
                name: DEFAULT_INSTANCE_NAME,
                port: DEFAULT_INSTANCE_PORT,
                source: seSourceVersion(""),
            })
            this.save()
        }
    }

    private getDocker(): DevDocker {
        if (this.docker !== undefined) {
            return this.docker
        }
        this.docker = new DevDocker()
        return this.docker
    }

    save() {
        writeJsonFile(registryPath(), {
            items: this.items,
        })
    }

    static async getVersions(): Promise<string[]> {
        const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`
        return (await httpsGetJson(url)).results
            .map((x: any) => x.name)
            .sort(compareVersionsDescending)
    }

    static async getLatestVersion(): Promise<string> {
        const versions = await SERegistry.getVersions()
        const version = versions.shift()
        if (version && version.toLowerCase() !== "latest") {
            return version
        }
        return versions.shift() ?? ""
    }

    filter(filter: string, autoCreate: boolean): SERegistryItem[] {
        const names = filter
            .toLowerCase()
            .split(",")
            .map(x => x.trim())
            .filter(x => x !== "")
        if (names.includes("*")) {
            return this.items
        }
        const filtered: SERegistryItem[] = []
        names.forEach(name => {
            let instance = this.items.find(x => x.name.toLowerCase() === name)
            if (instance === undefined) {
                if (names.length === 1 && autoCreate) {
                    instance = {
                        name: filter.trim(),
                        port: DEFAULT_INSTANCE_PORT,
                        source: seSourceVersion(""),
                    }
                    this.items.push(instance)
                } else {
                    throw new Error(`Instance \"${name}\" is not found`)
                }
            }
            filtered.push(instance)
        })
        return filtered
    }

    async resolveItemSourceVersion(item: SERegistryItem): Promise<string> {
        if (item.source.type === SESourceType.TONOS_SE_VERSION) {
            if (
                item.source.version === "" ||
                item.source.version === "latest"
            ) {
                item.source.version = await SERegistry.getLatestVersion()
                this.save()
            }
            return item.source.version
        }
        return ""
    }

    async itemContainerDef(item: SERegistryItem): Promise<ContainerDef> {
        let requiredImage: string
        let containerName: string
        const source = item.source
        switch (source.type) {
            case SESourceType.TONOS_SE_VERSION:
                {
                    requiredImage = `${DOCKER_IMAGE_NAME}:${await this.resolveItemSourceVersion(
                        item,
                    )}`
                    const suffix =
                        item.name !== DEFAULT_INSTANCE_NAME
                            ? `-${item.name}`
                            : ""
                    containerName = `${DOCKER_CONTAINER_NAME_PREFIX}-${userIdentifier()}${suffix}`
                }
                break
            case SESourceType.DOCKER_IMAGE:
                {
                    requiredImage = source.image
                    const suffix =
                        item.name !== DEFAULT_INSTANCE_NAME
                            ? `-${item.name}`
                            : ""
                    containerName = `${DOCKER_CONTAINER_NAME_PREFIX}-${userIdentifier()}${suffix}`
                }
                break
            case SESourceType.DOCKER_CONTAINER:
                {
                    containerName = source.container
                    requiredImage = source.image
                }
                break
        }
        return {
            requiredImage,
            containerName,
            createContainer(docker: DevDocker) {
                const ports: Dockerode.PortMap = {
                    "80/tcp": [
                        {
                            HostIp: "",
                            HostPort: `${item.port}`,
                        },
                    ],
                }
                if (item.dbPort) {
                    ports["8529/tcp"] = [
                        {
                            HostIp: "",
                            HostPort: `${item.dbPort}`,
                        },
                    ]
                }
                return docker.client.createContainer({
                    name: containerName,
                    // interactive: true,
                    Image: requiredImage,
                    Env: ["USER_AGREEMENT=yes"],
                    HostConfig: {
                        PortBindings: ports,
                    },
                })
            },
        }
    }

    async getSourceInfo(item: SERegistryItem): Promise<string> {
        switch (item.source.type) {
            case SESourceType.TONOS_SE_VERSION:
                return await this.resolveItemSourceVersion(item)
            case SESourceType.DOCKER_IMAGE:
                return `${item.source.image} image`
            case SESourceType.DOCKER_CONTAINER:
                return `${item.source.container} container`
        }
    }

    async getItemInfo(item: SERegistryItem): Promise<SERegistryItemInfo> {
        const def = await this.itemContainerDef(item)
        const info: Dockerode.ContainerInfo | null =
            await this.getDocker().findContainerInfo(def.containerName)
        return {
            state: info ? info.State : "not installed",
            docker: {
                image: info?.Image ?? def.requiredImage,
                container:
                    info?.Names.map(mapContainerName).join(", ") ??
                    def.containerName,
            },
        }
    }

    async updateConfig(
        terminal: Terminal,
        filter: string,
        updateInstance: (instance: SERegistryItem) => Promise<void>,
        autoCreate: boolean,
    ): Promise<void> {
        const items = this.filter(filter, autoCreate)
        const docker = this.getDocker()

        for (const item of items) {
            const save = JSON.stringify(item)
            await updateInstance(item)
            if (JSON.stringify(item) !== save) {
                const def = await this.itemContainerDef(item)
                const info = await this.getItemInfo(item)
                await docker.shutdownContainer(
                    terminal,
                    def,
                    ContainerStatus.missing,
                )
                await docker.startupContainer(
                    terminal,
                    def,
                    info.state === "running"
                        ? ContainerStatus.running
                        : ContainerStatus.created,
                )
            }
        }
        this.save()
    }

    async controlItems(
        instanceFilter: string,
        control: (docker: DevDocker, defs: ContainerDef[]) => Promise<void>,
    ): Promise<void> {
        const defs: ContainerDef[] = []
        for (const item of await this.filter(instanceFilter, false)) {
            defs.push(await this.itemContainerDef(item))
        }
        await control(this.getDocker(), defs)
    }

    async start(terminal: Terminal, instance: string) {
        await this.controlItems(instance, async (docker, defs) => {
            await docker.startupContainers(
                terminal,
                defs,
                ContainerStatus.running,
            )
        })
    }

    async stop(terminal: Terminal, instance: string) {
        await this.controlItems(instance, async (docker, defs) => {
            await docker.shutdownContainers(
                terminal,
                defs,
                ContainerStatus.created,
            )
        })
    }

    async reset(terminal: Terminal, instance: string) {
        await this.controlItems(instance, async (docker, defs) => {
            await docker.shutdownContainers(
                terminal,
                defs,
                ContainerStatus.missing,
            )
            await docker.startupContainers(
                terminal,
                defs,
                ContainerStatus.running,
            )
        })
    }

    async update(terminal: Terminal, instance: string) {
        await this.updateConfig(
            terminal,
            instance,
            async instance => {
                if (instance.source.type === SESourceType.TONOS_SE_VERSION) {
                    updateInstance(instance, {
                        source: seSourceVersion(
                            await SERegistry.getLatestVersion(),
                        ),
                    })
                }
            },
            false,
        )
    }

    async configure(
        terminal: Terminal,
        args: {
            version: string
            image: string
            container: string
            port: string
            dbPort: string
            instance: string
        },
    ) {
        const updates: Partial<SERegistryItem> = {}
        const sources = [args.version, args.image, args.container].filter(
            x => x !== "",
        )
        if (sources.length > 1) {
            throw new Error(
                'You can\'t specify several SE sources. Please choose on of the "version", "image" or "container" option.',
            )
        }

        if (args.version !== "") {
            let version = args.version
            if (version.toLowerCase() === "latest") {
                version = await SERegistry.getLatestVersion()
            } else {
                if (!(await SERegistry.getVersions()).includes(version)) {
                    throw new Error(`Invalid version: ${version}`)
                }
            }
            updates.source = seSourceVersion(version)
        } else if (args.image !== "") {
            updates.source = seSourceDockerImage(args.image)
        } else if (args.container !== "") {
            const docker = this.getDocker()
            const image = (await docker.findContainerInfo(args.container))
                ?.Image
            if (image === undefined) {
                throw new Error(`Docker container ${args.container} not found.`)
            }
            updates.source = seSourceDockerContainer(args.container, image)
        }
        if (args.port !== "") {
            updates.port = Number.parseInt(args.port)
            if (updates.port === undefined) {
                throw new Error(`Invalid port: ${args.port}`)
            }
        }

        if (args.dbPort !== "") {
            if (args.dbPort.toLowerCase() === "none") {
                updates.dbPort = PORT_NONE
            } else {
                updates.dbPort = Number.parseInt(args.dbPort)
                if (updates.dbPort === undefined) {
                    throw new Error(`Invalid db-port: ${args.dbPort}`)
                }
            }
        }
        await this.updateConfig(
            terminal,
            args.instance,
            async x => updateInstance(x, updates),
            true,
        )
    }

    delete(instance: string, force: boolean) {
        const deleting = this.filter(instance, false)
        if (deleting.length === 0) {
            return
        }
        if (deleting.length > 1 && !force) {
            throw Error(
                'If you want to delete more than one instance you should specify "force" option.',
            )
        }
        if (deleting === this.items) {
            this.items = []
        } else {
            this.items = this.items.filter(x => !deleting.includes(x))
        }
        this.save()
    }
}

import path from "path"
import fs from "fs-extra"

import { everdevHome } from "../../core"
import { NetworkGiver } from "./giver"
import { TonClient } from "@eversdk/core"
import { KnownContracts } from "../../core/known-contracts"
import { writeJsonFile } from "../../core/utils"

function networkHome() {
    return path.resolve(everdevHome(), "network")
}

function registryPath() {
    return path.resolve(networkHome(), "registry.json")
}

export type NetworkGiverInfo = {
    name: string
    address: string
    signer: string
    value?: number
}

export type MetworkCredentials = {
    project?: string
    accessKey?: string
}

export type Network = {
    name: string
    description?: string
    endpoints: string[]
    giver?: NetworkGiverInfo
    credentials?: MetworkCredentials
}

type NetworkSummary = {
    name: string
    endpoints: string
    giver: string
    description: string
}

export function getGiverSummary(giver?: NetworkGiverInfo): string {
    if (!giver) {
        return ""
    }
    const { signer, name, address } = giver
    return `${address}\n${name}${signer ? ` signed by ${signer}` : ""}`
}

export class NetworkRegistry {
    readonly items: Network[] = []
    default?: string

    constructor() {
        let loaded = false
        if (fs.pathExistsSync(registryPath())) {
            try {
                const data = JSON.parse(fs.readFileSync(registryPath(), "utf8"))
                this.items = data.items ?? []
                if (data.default) {
                    this.default = data.default
                }
                loaded = true
            } catch {} // eslint-disable-line no-empty
        }
        if (!loaded) {
            this.items = [
                {
                    name: "se",
                    endpoints: ["http://localhost"],
                    giver: {
                        name: KnownContracts.GiverV2.name,
                        address:
                            "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5",
                        signer: "",
                    },
                },
                {
                    name: "dev",
                    endpoints: ["devnet.evercloud.dev"],
                },
                {
                    name: "main",
                    endpoints: ["mainnet.evercloud.dev"],
                },
            ]
            this.default = "dev"
        }
    }

    save() {
        if (!fs.pathExistsSync(networkHome())) {
            fs.mkdirSync(networkHome(), { recursive: true })
        }
        writeJsonFile(registryPath(), {
            items: this.items,
            default: this.default,
        })
    }

    add(
        name: string,
        description: string,
        endpoints: string[],
        overwrite: boolean,
    ) {
        name = name.trim()
        const existingIndex = this.items.findIndex(
            x => x.name.toLowerCase() === name.toLowerCase(),
        )
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Net "${name}" already exists.`)
        }
        const network: Network = {
            name,
            description,
            endpoints,
        }
        if (existingIndex >= 0) {
            this.items[existingIndex] = network
        } else {
            this.items.push(network)
        }
        if (!this.default) {
            this.default = name
        }
        this.save()
    }

    get(name: string): Network {
        let findName = name.toLowerCase().trim()
        if (findName === "") {
            findName = this.default ?? ""
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error(
                    "There are no networks defined. " +
                        'Use "everdev network add" command to register a network.',
                )
            } else {
                throw new Error(
                    "There is no default network. " +
                        'Use "everdev network default" command to set the default network. ' +
                        'Or explicitly specify the network with "--network" option.',
                )
            }
        }
        const network = this.items.find(x => x.name.toLowerCase() === findName)
        if (network) {
            return network
        }
        throw new Error(`Network not found: ${name}`)
    }

    delete(name: string) {
        const net = this.get(name)
        this.items.splice(
            this.items.findIndex(x => x.name === net.name),
            1,
        )
        if (this.default === net.name) {
            delete this.default
        }
        this.save()
    }

    setDefault(name: string) {
        this.default = this.get(name).name
        this.save()
    }

    async setGiver(
        networkName: string,
        address: string,
        signer: string,
        value: number | undefined,
        name: string,
    ) {
        const network = this.get(networkName)
        const client = new TonClient({
            network: { endpoints: network.endpoints },
        })
        try {
            const giver = await NetworkGiver.create(client, {
                name,
                address,
                signer,
                value,
            })
            network.giver = {
                name: giver.contract.name,
                address: giver.address,
                signer,
                value,
            }
            this.save()
        } finally {
            await client.close()
        }
    }

    async setCredentials(
        name: string,
        project?: string,
        accessKey?: string,
        clear?: boolean,
    ) {
        const network = this.get(name)

        if (!project && !accessKey) {
            if (clear) {
                network.credentials = null
            } else {
                throw Error("At least one option is required")
            }
        } else {
            if (clear) {
                throw Error("--clear option can not be used with other options")
            } else {
                network.credentials = {
                    ...(project ? { project } : {}),
                    ...(accessKey ? { accessKey } : {}),
                }
            }
        }
        this.save()
    }
    static getEndpointsSummary(network: Network): string {
        const maxEndpoints = 3
        const endpoints =
            network.endpoints.length <= maxEndpoints
                ? network.endpoints
                : [...network.endpoints.slice(0, maxEndpoints), "..."]
        return endpoints.join(", ")
    }

    getNetworkSummary(network: Network): NetworkSummary {
        return {
            name: `${network.name}${
                network.name === this.default ? " (Default)" : ""
            }`,
            endpoints: NetworkRegistry.getEndpointsSummary(network),
            giver: getGiverSummary(network.giver),
            description: network.description ?? "",
        }
    }
}

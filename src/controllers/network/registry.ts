import path from "path";
import fs from "fs-extra";

import {
    tondevHome,
} from "../../core";
import { NetworkGiver } from "./giver";
import { TonClient } from "@tonclient/core";
import { KnownContracts } from "../../core/known-contracts";
import {
    writeJsonFile,
} from "../../core/utils";

function networkHome() {
    return path.resolve(tondevHome(), "network");
}

function registryPath() {
    return path.resolve(networkHome(), "registry.json");
}

export type NetworkGiverInfo = {
    name: string,
    address: string,
    signer: string,
    value?: number,

}

export type Network = {
    name: string,
    description?: string,
    endpoints: string[],
    giver?: NetworkGiverInfo,
}

type NetworkSummary = {
    name: string,
    endpoints: string,
    giver: string,
    description: string,
}

export function getGiverSummary(giver?: NetworkGiverInfo): string {
    if (!giver) {
        return "";
    }
    const {
        signer,
        name,
        address,
    } = giver;
    return `${address}\n${name}${signer ? ` signed by ${signer}` : ""}`;
}

export class NetworkRegistry {
    readonly items: Network[] = [];
    default?: string;

    constructor() {
        let loaded = false;
        if (fs.pathExistsSync(registryPath())) {
            try {
                const data = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
                this.items = data.items ?? [];
                if (data.default) {
                    this.default = data.default;
                }
                loaded = true;
            } catch {
            }
        }
        if (!loaded) {
            this.items = [{
                name: "se",
                endpoints: ["http://localhost"],
                giver: {
                    name: KnownContracts.GiverV2.name,
                    address: "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5",
                    signer: "",
                },
            }, {
                name: "dev",
                endpoints: [
                    "net.ton.dev", "net1.ton.dev", "net5.ton.dev",
                ],
            }, {
                name: "main",
                endpoints: ["main.ton.dev", "main2.ton.dev", "main3.ton.dev", "main4.ton.dev"],
            }];
            this.default = "dev";
        }
    }

    save() {
        if (!fs.pathExistsSync(networkHome())) {
            fs.mkdirSync(networkHome(), { recursive: true });
        }
        writeJsonFile(registryPath(), {
            items: this.items,
            default: this.default,
        });
    }

    add(name: string, description: string, endpoints: string[], overwrite: boolean) {
        name = name.trim();
        const existingIndex = this.items.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Net "${name}" already exists.`);
        }
        const network: Network = {
            name,
            description,
            endpoints,
        };
        if (existingIndex >= 0) {
            this.items[existingIndex] = network;
        } else {
            this.items.push(network);
        }
        if (!this.default) {
            this.default = name;
        }
        this.save();
    }

    get(name: string): Network {
        let findName = name.toLowerCase().trim();
        if (findName === "") {
            findName = this.default ?? "";
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error(
                    "There are no networks defined. " +
                    "Use \"tondev network add\" command to register a network.",
                );
            } else {
                throw new Error(
                    "There is no default network. " +
                    "Use \"tondev network default\" command to set the default network. " +
                    "Or explicitly specify the network with \"--network\" option.",
                );
            }
        }
        const network = this.items.find(x => x.name.toLowerCase() === findName);
        if (network) {
            return network;
        }
        throw new Error(`Network not found: ${name}`);
    }

    delete(name: string) {
        const net = this.get(name);
        this.items.splice(this.items.findIndex(x => x.name === net.name), 1);
        if (this.default === net.name) {
            delete this.default;
        }
        this.save();

    }

    setDefault(name: string) {
        this.default = this.get(name).name;
        this.save();

    }

    async setGiver(name: string, address: string, signer: string, value: number | undefined) {
        const network = this.get(name);
        const client = new TonClient({ network: { endpoints: network.endpoints } });
        try {
            const giver = await NetworkGiver.get(client, {
                name: "",
                address,
                signer,
                value,
            });
            network.giver = {
                name: giver.contract.name,
                address: giver.address,
                signer,
                value,
            };
            this.save();
        } finally {
            await client.close();
        }
    }

    static getEndpointsSummary(network: Network): string {
        const maxEndpoints = 3;
        const endpoints = network.endpoints.length <= maxEndpoints
            ? network.endpoints
            : [...network.endpoints.slice(0, maxEndpoints), "..."];
        return endpoints.join(", ");
    }

    getNetworkSummary(network: Network): NetworkSummary {
        return {
            name: `${network.name}${network.name === this.default ? " (Default)" : ""}`,
            endpoints: NetworkRegistry.getEndpointsSummary(network),
            giver: getGiverSummary(network.giver),
            description: network.description ?? "",
        };
    }
}


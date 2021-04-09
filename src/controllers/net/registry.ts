import path from "path";
import fs from "fs-extra";

import {
    tondevHome,
} from "../../core";

function networksHome() {
    return path.resolve(tondevHome(), "networks");
}

function registryPath() {
    return path.resolve(networksHome(), "registry.json");
}

export type Network = {
    name: string,
    description?: string,
    endpoints: string[],
    giver?: {
        address: string,
        signer: string,
    }
}

export class NetworkRegistry {
    readonly networks: Network[] = [];
    default?: string;

    constructor() {
        let loaded = false;
        if (fs.pathExistsSync(registryPath())) {
            try {
                const data = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
                this.networks = data.networks ?? [];
                if (data.default) {
                    this.default = data.default;
                }
                loaded = true;
            } catch {
            }
        }
        if (!loaded) {
            this.networks = [{
                name: "main",
                endpoints: ["main.ton.dev"],
            }];
            this.default = "main";
        }
    }

    save() {
        if (!fs.pathExistsSync(networksHome())) {
            fs.mkdirSync(networksHome(), {recursive: true});
        }
        fs.writeFileSync(registryPath(), JSON.stringify({
            networks: this.networks,
            default: this.default,
        }));
    }

    add(name: string, description: string, endpoints: string[], overwrite: boolean) {
        name = name.trim();
        const existingIndex = this.networks.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Net "${name}" already exists.`);
        }
        const network: Network = {
            name,
            description,
            endpoints,
        };
        if (existingIndex >= 0) {
            this.networks[existingIndex] = network;
        } else {
            this.networks.push(network);
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
        const network = this.networks.find(x => x.name.toLowerCase() === findName);
        if (network) {
            return network;
        }
        throw new Error(`Network not found: ${name}`);
    }

    delete(name: string) {
        const net = this.get(name);
        this.networks.splice(this.networks.findIndex(x => x.name === net.name), 1);
        if (this.default === net.name) {
            delete this.default;
        }
        this.save();

    }

    setDefault(name: string) {
        this.default = this.get(name).name;
        this.save();

    }

    setGiver(name: string, address: string, signer: string) {
        const network = this.get(name);
        network.giver = {
            address,
            signer,
        };
        this.save();
    }
}


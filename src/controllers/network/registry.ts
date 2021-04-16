import path from "path";
import fs from "fs-extra";

import {
    tondevHome,
} from "../../core";

function networkHome() {
    return path.resolve(tondevHome(), "network");
}

function registryPath() {
    return path.resolve(networkHome(), "registry.json");
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
                name: "main",
                endpoints: ["main.ton.dev"],
            }];
            this.default = "main";
        }
    }

    save() {
        if (!fs.pathExistsSync(networkHome())) {
            fs.mkdirSync(networkHome(), {recursive: true});
        }
        fs.writeFileSync(registryPath(), JSON.stringify({
            items: this.items,
            default: this.default,
        }));
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

    setGiver(name: string, address: string, signer: string) {
        const network = this.get(name);
        network.giver = {
            address,
            signer,
        };
        this.save();
    }
}


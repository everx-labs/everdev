import path from "path";
import fs from "fs-extra";

import {
    tondevHome,
} from "../../core";

function netHome() {
    return path.resolve(tondevHome(), "net");
}

function storePath() {
    return path.resolve(netHome(), "store.json");
}

export type Net = {
    name: string,
    description?: string,
    endpoints: string[],
}

export type NetStore = {
    nets: Net[],
    default?: string,
}

export function loadStore(): NetStore {
    if (fs.pathExistsSync(storePath())) {
        try {
            return JSON.parse(fs.readFileSync(storePath(), "utf8"));
        } catch {
        }
    }
    return {
        nets: [{
            name: "main",
            endpoints: ["main.ton.dev"],
        }],
        default: "main",
    };
}

export function saveStore(store: NetStore) {
    if (!fs.pathExistsSync(netHome())) {
        fs.mkdirSync(netHome(), {recursive: true});
    }
    fs.writeFileSync(storePath(), JSON.stringify(store));
}

export async function addNet(name: string, description: string, endpoints: string[], overwrite: boolean) {
    const store = loadStore();
    name = name.trim();
    const existingIndex = store.nets.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0 && !overwrite) {
        throw new Error(`Net "${name}" already exists.`);
    }
    const net: Net = {
        name,
        description,
        endpoints,
    };
    if (existingIndex >= 0) {
        store.nets[existingIndex] = net;
    } else {
        store.nets.push(net);
    }
    if (!store.default) {
        store.default = name;
    }
    saveStore(store);
}

export function getNet(name: string): Net {
    const store = loadStore();
    const net = store.nets.find(x => x.name.toLowerCase() === name.toLowerCase().trim());
    if (net) {
        return net;
    }
    throw new Error(`Net not found: ${name}`);
}

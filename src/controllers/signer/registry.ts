import path from "path";
import fs from "fs-extra";

import {
    tondevHome,
} from "../../core";
import {
    KeyPair,
    Signer,
    signerKeys,
    signerNone,
    TonClient,
} from "@tonclient/core";
import { NetworkRegistry } from "../network/registry";

function signerHome() {
    return path.resolve(tondevHome(), "signer");
}

function registryPath() {
    return path.resolve(signerHome(), "registry.json");
}

export enum MnemonicDictionary {
    ton = 0,
    english = 1,
    chineseSimplified = 2,
    chineseTraditional = 3,
    french = 4,
    italian = 5,
    japanese = 6,
    korean = 7,
    spanish = 8,
}

export type SignerRegistryItem = {
    name: string,
    description: string,
    keys: KeyPair,
    mnemonic?: {
        phrase: string,
        dictionary: MnemonicDictionary,
    }
}

export type SignerSummary = {
    name: string,
    public: string,
    description: string,
    used: string,
};

export type ResolveSignerOptions = {
    useNoneForEmptyName: boolean,
};

export class SignerRegistry {
    items: SignerRegistryItem[] = [];
    default?: string;


    constructor() {
        if (fs.pathExistsSync(registryPath())) {
            try {
                const loaded = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
                this.items = loaded.items ?? [];
                this.default = loaded.default;
            } catch {
            }
        }
    }

    save() {
        if (!fs.pathExistsSync(signerHome())) {
            fs.mkdirSync(signerHome(), { recursive: true });
        }
        fs.writeFileSync(registryPath(), JSON.stringify({
            items: this.items,
            default: this.default,
        }));
    }

    private add(item: SignerRegistryItem, overwrite: boolean) {
        const existingIndex = this.items.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase());
        if (existingIndex >= 0 && !overwrite) {
            throw new Error(`Signer with name "${item.name}" already exists.`);
        }
        if (existingIndex >= 0) {
            this.items[existingIndex] = item;
        } else {
            this.items.push(item);
        }
        if (!this.default) {
            this.default = item.name;
        }
        this.save();
    }

    async addSecretKey(name: string, description: string, secret: string, overwrite: boolean) {
        const keys = {
            public: (await TonClient.default.crypto.nacl_sign_keypair_from_secret_key({ secret })).public,
            secret,
        };
        this.add({
            name,
            description,
            keys,
        }, overwrite);
    }

    async addMnemonicKey(name: string, description: string, phrase: string, dictionary: MnemonicDictionary, overwrite: boolean) {
        const secret = (await TonClient.default.crypto.mnemonic_derive_sign_keys({
            phrase,
            dictionary,
        })).secret;
        const keys = {
            public: (await TonClient.default.crypto.nacl_sign_keypair_from_secret_key({ secret })).public,
            secret,
        };
        this.add({
            name,
            description,
            keys,
        }, overwrite);
    }

    find(name: string): SignerRegistryItem | undefined {
        let findName = name.toLowerCase().trim();
        if (findName === "") {
            findName = this.default ?? "";
        }
        return this.items.find(x => x.name.toLowerCase() === findName);
    }

    get(name: string): SignerRegistryItem {
        let findName = name.trim();
        if (findName === "") {
            findName = this.default ?? "";
        }
        if (findName === "") {
            if (this.items.length === 0) {
                throw new Error(
                    "There are no signers defined. " +
                    "Use \"tondev signer add\" command to register a signer.",
                );
            } else {
                throw new Error(
                    "There is no default signer. " +
                    "Use \"tondev signer default\" command to set the default signer. " +
                    "Or explicitly specify the signer with \"--signer\" option.",
                );
            }
        }
        const signer = this.items.find(x => x.name.toLowerCase() === findName.toLowerCase());
        if (signer) {
            return signer;
        }
        throw new Error(`Signer not found: ${name}`);
    }

    delete(name: string) {
        const signer = this.get(name);
        this.items.splice(this.items.findIndex(x => x.name === signer.name), 1);
        if (this.default === signer.name) {
            this.default = undefined;
        }
        this.save();
    }

    setDefault(name: string) {
        this.default = this.get(name).name;
        this.save();

    }

    resolveItem(name: string, options: ResolveSignerOptions): SignerRegistryItem | null {
        name = name.trim().toLowerCase();
        if (name === "none") {
            return null;
        }
        if (name === "") {
            name = this.default ?? "";
        }
        if (name === "" && options.useNoneForEmptyName) {
            return null;
        }
        return this.get(name);
    }

    async createSigner(item: SignerRegistryItem | null): Promise<Signer> {
        return item !== null ? signerKeys(item.keys) : signerNone();
    }

    async resolveSigner(name: string, options: ResolveSignerOptions): Promise<Signer> {
        return await this.createSigner(this.resolveItem(name, options));
    }

    getSignerSummary(signer: SignerRegistryItem, networks: NetworkRegistry): SignerSummary {
        const used: string[] = [];
        networks.items.forEach(network => {
            if (network.giver) {
                if (network.giver.signer === signer.name) {
                    used.push(`${network.name} network giver signer`);
                }
            }
        });
        return {
            name: `${signer.name}${signer.name === this.default ? " (Default)" : ""}`,
            public: signer.keys.public,
            description: signer.description,
            used: used.join("\n"),
        };
    }
}

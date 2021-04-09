import path from "path";
import fs from "fs-extra";
import keytar from "keytar";

import {
    tondevHome,
} from "../../core";
import {
    TonClient,
} from "@tonclient/core";

const KEYCHAIN_SERVICE = "TON OS";
const KEYCHAIN_ACCOUNT = "Signer Registry Password";

function signersHome() {
    return path.resolve(tondevHome(), "signers");
}

function registryPath() {
    return path.resolve(signersHome(), "registry.json");
}

export enum SecretType {
    mnemonic,
    key
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

export type SecretBase = {
    key: string,
    type: SecretType,
}

export type SecretMnemonic = SecretBase & {
    type: SecretType.mnemonic,
    phrase: string,
    dictionary: MnemonicDictionary,
}

export type SecretKey = SecretBase & {
    type: SecretType.key,
}

export type Secret = SecretMnemonic | SecretKey;

export type SignerDef = {
    name: string,
    description: string,
    public: string,
    encryptedSecret: string,
}

export type KeyStore = {
    signers: SignerDef[],
    default?: string,
}

export function loadStore(): KeyStore {
    if (fs.pathExistsSync(registryPath())) {
        try {
            return JSON.parse(fs.readFileSync(registryPath(), "utf8"));
        } catch {
        }
    }
    return {
        signers: [],
    };
}

export function saveRegistry(store: KeyStore) {
    if (!fs.pathExistsSync(signersHome())) {
        fs.mkdirSync(signersHome(), {recursive: true});
    }
    fs.writeFileSync(registryPath(), JSON.stringify(store));
}

export async function getSecretBoxParams(): Promise<{ key: string, nonce: string }> {
    let password = await keytar.getPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT);
    if (password === null) {
        const generated = await TonClient.default.crypto.generate_random_bytes({length: 32 + 24});
        password = Buffer.from(generated.bytes, "base64").toString("hex");
        await keytar.setPassword(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, password);
    }
    return {
        key: password.substr(0, 64),
        nonce: password.substr(64),
    };
}

export async function addSigner(name: string, description: string, secret: Secret, overwrite: boolean) {
    const store = loadStore();
    name = name.trim();
    const existingIndex = store.signers.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0 && !overwrite) {
        throw new Error(`Key "${name}" already exists.`);
    }
    const box = await getSecretBoxParams();
    const publicKey = (await TonClient.default.crypto.nacl_sign_keypair_from_secret_key({secret: secret.key})).public;
    const encryptedSecret = (await TonClient.default.crypto.nacl_secret_box({
        key: box.key,
        nonce: box.nonce,
        decrypted: Buffer.from(JSON.stringify(secret)).toString("base64"),
    })).encrypted;
    const key: SignerDef = {
        name,
        description,
        public: publicKey,
        encryptedSecret,
    };
    if (existingIndex >= 0) {
        store.signers[existingIndex] = key;
    } else {
        store.signers.push(key);
    }
    if (!store.default) {
        store.default = name;
    }
    saveRegistry(store);
}

export function getSigner(name: string): SignerDef {
    const store = loadStore();
    let findName = name.toLowerCase().trim();
    if (findName === "") {
        findName = store.default ?? "";
    }
    const key = store.signers.find(x => x.name.toLowerCase() === findName);
    if (key) {
        return key;
    }
    throw new Error(`Key not found: ${name}`);
}

export async function getSignerSecret(key: SignerDef): Promise<Secret> {
    const box = await getSecretBoxParams();
    return JSON.parse(Buffer.from((await TonClient.default.crypto.nacl_secret_box_open({
        key: box.key,
        nonce: box.nonce,
        encrypted: key.encryptedSecret,
    })).decrypted, "base64").toString());
}

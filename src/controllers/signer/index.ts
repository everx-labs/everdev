import {
    Command,
    CommandArg,
    CommandArgVariant,
    Terminal,
    ToolController,
} from "../../core";
import {
    getSigner,
    getSignerSecret,
    loadStore,
    addSigner,
    Secret,
    SecretType,
    saveRegistry,
} from "./registry";
import {
    Signer,
    signerKeys,
    TonClient,
} from "@tonclient/core";
import {formatTable} from "../../core/utils";

const typeArg: CommandArg = {
    name: "type",
    type: "string",
    title: "Secret type",
    defaultValue: "mnemonic",
    getVariants(): CommandArgVariant[] {
        return [
            {
                value: "mnemonic",
                description: "Mnemonic seed phrase",
            },
            {
                value: "key",
                description: "Secret key",
            },
        ];
    },
};

const dictionaryArg: CommandArg = {
    name: "dictionary",
    type: "string",
    title: "Mnemonic dictionary",
    defaultValue: "0",
    getVariants(): CommandArgVariant[] {
        return [
            {
                value: "0",
                description: "TON",
            },
            {
                value: "1",
                description: "English",
            },
            {
                value: "2",
                description: "Chinese Simplified",
            },
            {
                value: "3",
                description: "Chinese Traditional",
            },
            {
                value: "4",
                description: "French",
            },
            {
                value: "5",
                description: "Italian",
            },
            {
                value: "6",
                description: "Japanese",
            },
            {
                value: "7",
                description: "Korean",
            },
            {
                value: "8",
                description: "Spanish",
            },
        ];
    },
};

const forceArg: CommandArg = {
    name: "force",
    alias: "f",
    type: "boolean",
    title: "Overwrite signer if already exists",
    defaultValue: "false",
};

export const signerGenerateCommand: Command = {
    name: "generate",
    title: "Add signer with randomly generated keys",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
        typeArg,
        dictionaryArg,
        {
            name: "words",
            type: "string",
            title: "Number of mnemonic words",
            defaultValue: "12",
        },
        forceArg,
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        type: string,
        dictionary: string,
        words: string,
        force: boolean
    }) {
        let secret: Secret;
        if (args.type === "mnemonic") {
            const dictionary = Number.parseInt(args.dictionary);
            const word_count = Number.parseInt(args.words);
            const phrase = (await TonClient.default.crypto.mnemonic_from_random({
                dictionary,
                word_count,
            })).phrase;
            const key = (await TonClient.default.crypto.mnemonic_derive_sign_keys({
                phrase,
                dictionary,
                word_count,
            })).secret;
            secret = {
                type: SecretType.mnemonic,
                key,
                dictionary,
                phrase,
            };
        } else {
            secret = {
                type: SecretType.key,
                key: (await TonClient.default.crypto.generate_random_sign_keys()).secret,
            };
        }
        await addSigner(args.name, "", secret, args.force);
    },
};

export const signerAddCommand: Command = {
    name: "add",
    title: "Add signer",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
        {
            isArg: true,
            name: "secret",
            type: "string",
            title: "Secret key or mnemonic phrase",
        },
        dictionaryArg,
        forceArg,
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        secret: string,
        dictionary: string,
        force: boolean
    }) {
        let secret: Secret;
        const words = args.secret.split(" ").filter(x => x !== "");
        if (words.length > 1) {
            const dictionary = Number.parseInt(args.dictionary);
            const phrase = words.join(" ");
            const key = (await TonClient.default.crypto.mnemonic_derive_sign_keys({
                phrase,
                dictionary,
                word_count: words.length,
            })).secret;
            secret = {
                type: SecretType.mnemonic,
                key,
                dictionary,
                phrase,
            };
        } else {
            secret = {
                type: SecretType.key,
                key: words[0],
            };
        }
        await addSigner(args.name, "", secret, args.force);
    },
};

export const signerListCommand: Command = {
    name: "list",
    title: "Prints list of registered signers",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const store = loadStore();
        const rows = [["Signer", "Public Key", "Description"]];
        store.signers.forEach(x => rows.push([
            `${x.name}${x.name === store.default ? " (Default)" : ""}`,
            x.public,
            x.description,
        ]));
        const table = formatTable(rows, {headerSeparator: true});
        if (table.trim() !== "") {
            terminal.log();
            terminal.log(table);
            terminal.log();
        }
    },
};

export const signerGetCommand: Command = {
    name: "get",
    title: "Get signer details",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(terminal: Terminal, args: { name: string }) {
        const signer = getSigner(args.name);
        const secret = await getSignerSecret(signer);
        terminal.log(JSON.stringify({
            name: signer.name,
            description: signer.description,
            public: signer.public,
            secret,
        }, undefined, "    "));
    },
};

export const signerDeleteCommand: Command = {
    name: "delete",
    title: "Delete signer from registry",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const signer = getSigner(args.name);
        const store = loadStore();
        store.signers.splice(store.signers.findIndex(x => x.name === signer.name), 1);
        if (store.default === signer.name) {
            delete store.default;
        }
        saveRegistry(store);
    },
};

export const signerDefaultCommand: Command = {
    name: "default",
    title: "Set default signer",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const signer = getSigner(args.name);
        const store = loadStore();
        store.default = signer.name;
        saveRegistry(store);
    },
};

export async function createSigner(name: string): Promise<Signer> {
    const signer = getSigner(name);
    const secret = await getSignerSecret(signer);
    return signerKeys({
        public: signer.public,
        secret: secret.key,
    });
}

export const Signers: ToolController = {
    name: "signer",
    title: "Signer Registry",
    commands: [
        signerGenerateCommand,
        signerAddCommand,
        signerDeleteCommand,
        signerListCommand,
        signerGetCommand,
        signerDefaultCommand,
    ],
};

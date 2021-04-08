import {
    Command,
    CommandArg,
    CommandArgVariant,
    Terminal,
    ToolController,
} from "../../core";
import {
    getKey,
    getKeySecret,
    loadStore,
    addKey,
    Secret,
    SecretType,
    saveStore,
} from "./store";
import {TonClient} from "@tonclient/core";
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
    title: "Overwrite key if already exists",
    defaultValue: "false",
};

export const keyGenerateCommand: Command = {
    name: "generate",
    title: "Add randomly generated key",
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
        await addKey(args.name, "", secret, args.force);
    },
};

export const keyAddCommand: Command = {
    name: "add",
    title: "Add key",
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
        await addKey(args.name, "", secret, args.force);
    },
};

export const keyListCommand: Command = {
    name: "list",
    title: "Prints list of stored keys",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const store = loadStore();
        const rows = store.keys.map(x => [
            `${x.name}${x.name === store.default ? " (Default)" : ""}`,
            x.public,
            x.description,
        ]);
        const table = [["Key", "Public", "Description"], ...rows];
        terminal.log(formatTable(table, {headerSeparator: true}));
    },
};

export const keyExportCommand: Command = {
    name: "export",
    title: "Export key secret",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(terminal: Terminal, args: { name: string }) {
        const key = getKey(args.name);
        const secret = await getKeySecret(key);
        terminal.log(JSON.stringify({
            name: key.name,
            description: key.description,
            public: key.public,
            secret,
        }, undefined, "    "));
    },
};

export const keyDeleteCommand: Command = {
    name: "delete",
    title: "Delete key from store",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const key = getKey(args.name);
        const store = loadStore();
        store.keys.splice(store.keys.findIndex(x => x.name === key.name), 1);
        if (store.default === key.name) {
            delete store.default;
        }
        saveStore(store);
    },
};

export const keyDefaultCommand: Command = {
    name: "default",
    title: "Set default key",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
        },
    ],
    async run(_terminal: Terminal, args: { name: string }) {
        const key = getKey(args.name);
        const store = loadStore();
        store.default = key.name;
        saveStore(store);
    },
};


export const Key: ToolController = {
    name: "key",
    title: "Key Store",
    commands: [
        keyGenerateCommand,
        keyAddCommand,
        keyDeleteCommand,
        keyListCommand,
        keyExportCommand,
        keyDefaultCommand,
    ],
};

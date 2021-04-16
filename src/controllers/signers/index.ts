import {
    Command,
    CommandArg,
    CommandArgVariant,
    Terminal,
    ToolController,
} from "../../core";
import {
    SignerRegistry,
} from "./registry";
import {
    Signer,
    signerKeys,
    TonClient,
} from "@tonclient/core";
import {formatTable} from "../../core/utils";

const nameArg: CommandArg = {
    isArg: true,
    name: "name",
    title: "Signer name",
    type: "string",
};

const secretArg: CommandArg = {
    isArg: true,
    name: "secret",
    title: "Secret key or seed phrase",
    type: "string",
};

const mnemonicOpt: CommandArg = {
    name: "mnemonic",
    alias: "m",
    title: "Use mnemonic phrase",
    type: "boolean",
    defaultValue: "false",
};

const dictionaryOpt: CommandArg = {
    name: "dictionary",
    alias: "d",
    type: "string",
    title: "Mnemonic dictionary",
    defaultValue: "1",
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

const wordsOpt: CommandArg = {
    name: "words",
    alias: "w",
    title: "Number of mnemonic words",
    type: "string",
    defaultValue: "12",
};

const forceOpt: CommandArg = {
    name: "force",
    alias: "f",
    title: "Overwrite signer if already exists",
    type: "boolean",
    defaultValue: "false",
};

export const signerGenerateCommand: Command = {
    name: "generate",
    alias: "gen",
    title: "Add signer with randomly generated keys",
    args: [
        nameArg,
        mnemonicOpt,
        dictionaryOpt,
        wordsOpt,
        forceOpt,
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        mnemonic: boolean,
        dictionary: string,
        words: string,
        force: boolean
    }) {
        if (args.mnemonic) {
            const dictionary = Number.parseInt(args.dictionary);
            const word_count = Number.parseInt(args.words);
            const phrase = (await TonClient.default.crypto.mnemonic_from_random({
                dictionary,
                word_count,
            })).phrase;
            await new SignerRegistry().addMnemonicKey(args.name, "", phrase, dictionary, args.force);
        } else {
            await new SignerRegistry().addSecretKey(
                args.name,
                "",
                (await TonClient.default.crypto.generate_random_sign_keys()).secret,
                args.force,
            );
        }
    },
};

export const signerAddCommand: Command = {
    name: "add",
    title: "Add signer",
    args: [
        nameArg,
        secretArg,
        dictionaryOpt,
        forceOpt,
    ],
    async run(_terminal: Terminal, args: {
        name: string,
        secret: string,
        dictionary: string,
        force: boolean
    }) {
        const words = args.secret.split(" ").filter(x => x !== "");
        if (words.length > 1) {
            const dictionary = Number.parseInt(args.dictionary);
            const phrase = words.join(" ");
            await new SignerRegistry().addMnemonicKey(args.name, "", phrase, dictionary, args.force);
        } else {
            await new SignerRegistry().addSecretKey(args.name, "", args.secret, args.force);
        }
    },
};

export const signerListCommand: Command = {
    name: "list",
    alias: "l",
    title: "Prints list of registered signers",
    args: [],
    async run(terminal: Terminal, _args: {}) {
        const registry = new SignerRegistry();
        const rows = [["Signer", "Public Key", "Description"]];
        registry.items.forEach(x => rows.push([
            `${x.name}${x.name === registry.default ? " (Default)" : ""}`,
            x.keys.public,
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
    alias: "g",
    title: "Get signer details",
    args: [
        nameArg,
    ],
    async run(terminal: Terminal, args: { name: string }) {
        const signer = new SignerRegistry().get(args.name);
        terminal.log(JSON.stringify(signer, undefined, "    "));
    },
};

export const signerDeleteCommand: Command = {
    name: "delete",
    title: "Delete signer from registry",
    args: [nameArg],
    async run(_terminal: Terminal, args: { name: string }) {
        new SignerRegistry().delete(args.name);
    },
};

export const signerDefaultCommand: Command = {
    name: "default",
    alias: "d",
    title: "Set default signer",
    args: [nameArg],
    async run(_terminal: Terminal, args: { name: string }) {
        new SignerRegistry().setDefault(args.name);
    },
};

export async function createSigner(name: string): Promise<Signer> {
    return signerKeys(new SignerRegistry().get(name).keys);
}

export const Signers: ToolController = {
    name: "signers",
    alias: "s",
    title: "Signers Registry",
    commands: [
        signerGenerateCommand,
        signerAddCommand,
        signerDeleteCommand,
        signerListCommand,
        signerGetCommand,
        signerDefaultCommand,
    ],
};

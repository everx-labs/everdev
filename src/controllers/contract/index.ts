import {
    Command,
    CommandArg,
    Terminal,
    ToolController,
} from "../../core";
import {
    Account,
    AccountType,
} from "@tonclient/appkit";
import {TonClient} from "@tonclient/core";
import {getAccount} from "./accounts";
import {
    getRunParams,
    resolveInputs,
    logRunResult,
} from "./run";
import {NetworkGiver} from "../network/giver";
import {NetworkRegistry} from "../network/registry";
import {parseNumber} from "../../core/utils";

const fileArg: CommandArg = {
    isArg: true,
    name: "file",
    title: "ABI file",
    type: "file",
    nameRegExp: /\.abi$/i,
};

const networkOpt: CommandArg = {
    name: "network",
    alias: "n",
    type: "string",
    title: "Network name",
    defaultValue: "",
};

const signerOpt: CommandArg = {
    name: "signer",
    alias: "s",
    title: "Signer key name",
    type: "string",
    defaultValue: "",
};

const addressOpt: CommandArg = {
    name: "address",
    alias: "a",
    title: "Account address",
    type: "string",
    defaultValue: "",
};

const functionArg: CommandArg = {
    isArg: true,
    name: "function",
    title: "Function name",
    type: "string",
    defaultValue: "",
};

const inputOpt: CommandArg = {
    name: "input",
    alias: "i",
    title: "Function parameters (name:value,...)",
    type: "string",
    defaultValue: "",
};

const valueOpt: CommandArg = {
    name: "value",
    alias: "v",
    title: "Deploying balance value",
    type: "string",
    defaultValue: "",
};

const preventUiOpt: CommandArg = {
    name: "prevent-ui",
    alias: "p",
    title: "Prevent user interaction",
    type: "boolean",
    defaultValue: "false",
};

function reduceBase64String(s: string | undefined): string | undefined {
    if (s === undefined) {
        return undefined;
    }
    if (s.length < 80) {
        return s;
    }
    const bytes = Buffer.from(s, "base64");
    return `${s.slice(0,30)} ... ${s.slice(-30)} (${bytes.length} bytes)`;
}

export const contractInfoCommand: Command = {
    name: "info",
    alias: "i",
    title: "Prints contract summary",
    args: [
        fileArg,
        networkOpt,
        signerOpt,
        addressOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
    }) {
        const account = await getAccount(terminal, args);
        const parsed = await account.getAccount();
        const accType = parsed.acc_type as AccountType;
        if (account.contract.tvc) {
            const boc = account.client.boc;
            const codeHash = (await boc.get_boc_hash({
                boc: (await boc.get_code_from_tvc({ tvc: account.contract.tvc })).code,
            })).hash;
            terminal.log(`Code Hash: ${codeHash} (from TVC file)`);
        }
        if (accType === AccountType.nonExist) {
            terminal.log("Account:   Not exists");
        } else {
            const token = BigInt(1000000000);
            const balance = BigInt(parsed.balance);
            let tokens = Number(balance / token) + Number(balance % token) / Number(token);
            const tokensString = tokens < 1 ? tokens.toString() : `≈ ${Math.round(tokens)}`;
            terminal.log(`Account:   ${parsed.acc_type_name}`);
            terminal.log(`Balance:   ${balance} (${tokensString} tokens)`);
            parsed.boc = reduceBase64String(parsed.boc);
            parsed.code = reduceBase64String(parsed.code);
            parsed.data = reduceBase64String(parsed.data);

            terminal.log(`Details:   ${JSON.stringify(parsed, undefined, "    ")}`);
        }
        await account.free();
        account.client.close();
    },
};

export const contractDeployCommand: Command = {
    name: "deploy",
    alias: "d",
    title: "Deploy contract to network",
    args: [
        fileArg,
        functionArg,
        networkOpt,
        signerOpt,
        inputOpt,
        valueOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
        input: string,
        value: string,
        preventUi: boolean,
    }) {
        const account = await getAccount(terminal, args);
        const info = await account.getAccount();

        let giver: NetworkGiver | undefined = undefined;
        if (info.acc_type === AccountType.nonExist) {
            const networkGiverInfo = new NetworkRegistry().get(args.network).giver;
            giver = networkGiverInfo
                ? await NetworkGiver.get(account.client, networkGiverInfo)
                : undefined;
            if (!giver) {
                throw new Error(`Account ${await account.getAddress()} has no balance.\n` +
                    `You have to create a positive balance before deploying in two ways: \n` +
                    `sending some value to this address\n` +
                    `or setting up a giver for the network with \`tondev network giver\` command.`,
                );
            }
            giver.value = parseNumber(args.value) ?? giver.value;
        }
        const initFunctionName = args.function.toLowerCase() === "none" ? "" : (args.function || "constructor");
        const initFunction = account.contract.abi.functions?.find(x => x.name === initFunctionName);
        const initInput = await resolveInputs(
            terminal,
            "\nParameters of constructor:\n",
            initFunction?.inputs ?? [],
            args.input,
            args.preventUi,
        );
        terminal.log("\nDeploying...");
        await account.deploy({
            useGiver: giver,
            initFunctionName: initFunction?.name,
            initInput,
        });
        terminal.log(`Contract has deployed at address: ${await account.getAddress()}`);
        await giver?.account.free();
        await account.free();
        account.client.close();
        TonClient.default.close();
        process.exit(0);
    },
};


export const contractRunCommand: Command = {
    name: "run",
    alias: "r",
    title: "Run contract deployed on the network",
    args: [
        fileArg,
        functionArg,
        networkOpt,
        signerOpt,
        addressOpt,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
        input: string,
        preventUi: boolean,
    }) {
        const account = await getAccount(terminal, args);
        const {
            functionName,
            functionInput,
        } = await getRunParams(terminal, account, args);
        terminal.log("\nRunning...");
        const result = await account.run(functionName, functionInput);
        await logRunResult(terminal, result.decoded, result.transaction);
        await account.free();
        account.client.close();
        TonClient.default.close();
        process.exit(0);
    },
};


export const contractRunLocalCommand: Command = {
    name: "run-local",
    alias: "l",
    title: "Run contract locally on TVM",
    args: [
        fileArg,
        functionArg,
        networkOpt,
        signerOpt,
        addressOpt,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
        input: string,
        preventUi: boolean,
    }) {
        const account = await getAccount(terminal, args);
        const {
            functionName,
            functionInput,
        } = await getRunParams(terminal, account, args);
        const accountWithoutSigner = new Account(account.contract, {
            client: account.client,
            address: await account.getAddress(),
        });
        const result = await accountWithoutSigner.runLocal(functionName, functionInput);
        await logRunResult(terminal, result.decoded, result.transaction);
        await account.free();
        await accountWithoutSigner.free();
        account.client.close();
        TonClient.default.close();
        process.exit(0);
    },
};

export const contractRunExecutorCommand: Command = {
    name: "run-executor",
    alias: "e",
    title: "Emulate transaction executor locally on TVM",
    args: [
        fileArg,
        functionArg,
        networkOpt,
        signerOpt,
        addressOpt,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
        input: string,
        preventUi: boolean,
    }) {
        const account = await getAccount(terminal, args);
        const {
            functionName,
            functionInput,
        } = await getRunParams(terminal, account, args);
        const result = await account.runLocal(functionName, functionInput, {
            performAllChecks: true,
        });
        await logRunResult(terminal, result.decoded, result.transaction);
        await account.free();
        account.client.close();
        TonClient.default.close();
        process.exit(0);
    },
};


export const Contract: ToolController = {
    name: "contract",
    alias: "c",
    title: "Smart Contracts",
    commands: [
        contractInfoCommand,
        contractDeployCommand,
        contractRunCommand,
        contractRunLocalCommand,
        contractRunExecutorCommand,
    ],
};

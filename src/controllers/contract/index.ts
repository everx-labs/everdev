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
    logRunResult,
    resolveParams,
} from "./run";
import {NetworkGiver} from "../network/giver";
import {NetworkRegistry} from "../network/registry";
import {
    parseNumber,
    reduceBase64String,
} from "../../core/utils";

const fileArg: CommandArg = {
    isArg: true,
    name: "file",
    title: "ABI file",
    type: "file",
    nameRegExp: /\.abi$/i,
};

const infoFileArg: CommandArg = {
    ...fileArg,
    defaultValue: "",
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
    title: "Function parameters as name:value,...",
    description: "Array values must be specified as [item,...]. " +
        "Spaces are not allowed. If value contains spaces or special symbols \"[],:\" " +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
};

const dataOpt: CommandArg = {
    name: "data",
    alias: "d",
    title: "Deploying initial data as name:value,...",
    description:
        "This data is required to calculate the account address and to deploy contract.\n" +
        "Array values must be specified as [item,...]. " +
        "Spaces are not allowed. If value contains spaces or special symbols \"[],:\" " +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
};

const valueOpt: CommandArg = {
    name: "value",
    alias: "v",
    title: "Deploying balance value in nano tokens",
    type: "string",
    defaultValue: "",
};

const preventUiOpt: CommandArg = {
    name: "prevent-ui",
    alias: "p",
    title: "Prevent user interaction",
    description:
        "Useful in shell scripting e.g. on server or in some automating to disable " +
        "waiting for the user input.\n" +
        "Instead tondev will abort with error.\n" +
        "For example when some parameters are missing in command line " +
        "then ton dev will prompt user to input values for missing parameters " +
        "(or fails if prevent-ui option is specified).",
    type: "boolean",
    defaultValue: "false",
};

const DEFAULT_TOPUP_VALUE = 10_000_000_000;

export const contractInfoCommand: Command = {
    name: "info",
    alias: "i",
    title: "Prints contract summary",
    args: [
        infoFileArg,
        networkOpt,
        signerOpt,
        dataOpt,
        addressOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        signer: string,
        data: string,
        address: string,
    }) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified");
        }
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
            terminal.log("Account:   Doesn't exist");
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
        networkOpt,
        signerOpt,
        functionArg,
        inputOpt,
        dataOpt,
        valueOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        signer: string,
        function: string,
        input: string,
        data: string,
        value: string,
        preventUi: boolean,
    }) {
        let account = await getAccount(terminal, args);
        const info = await account.getAccount();
        if (info.acc_type === AccountType.active) {
            throw new Error(`Account ${await account.getAddress()} already deployed.`);
        }
        const network = new NetworkRegistry().get(args.network);
        const currentBalance = BigInt(info.balance ?? 0);
        const requiredBalance = parseNumber(args.value) ?? network.giver?.value ?? DEFAULT_TOPUP_VALUE;

        if (currentBalance < BigInt(requiredBalance)) {
            const giverInfo = new NetworkRegistry().get(args.network).giver;
            if (!giverInfo) {
                throw new Error(`Account ${await account.getAddress()} has low balance to deploy.\n` +
                    `You have to create an enough balance before deploying in two ways: \n` +
                    `sending some value to this address\n` +
                    `or setting up a giver for the network with \`tondev network giver\` command.`,
                );
            }
            const giver = await NetworkGiver.get(account.client, giverInfo);
            giver.value = requiredBalance;
            await giver.sendTo(await account.getAddress(), requiredBalance);
            await giver.account.free();
        }

        const dataParams = account.contract.abi.data ?? [];
        if (dataParams.length > 0) {
            const initData = await resolveParams(
                terminal,
                `\nDeploying initial data:\n`,
                dataParams,
                args.data ?? "",
                args.preventUi,
            );
            await account.free();
            account = new Account(account.contract, {
                client: account.client,
                address: await account.getAddress(),
                signer: account.signer,
                initData,
            });
        }

        const initFunctionName = args.function.toLowerCase() === "none" ? "" : (args.function || "constructor");
        const initFunction = account.contract.abi.functions?.find(x => x.name === initFunctionName);
        const initInput = await resolveParams(
            terminal,
            "\nParameters of constructor:\n",
            initFunction?.inputs ?? [],
            args.input,
            args.preventUi,
        );
        terminal.log("\nDeploying...");
        await account.deploy({
            initFunctionName: initFunction?.name,
            initInput,

        });
        terminal.log(`Contract has deployed at address: ${await account.getAddress()}`);
        await account.free();
        account.client.close();
        TonClient.default.close();
        process.exit(0);
    },
};


export const contractTopUpCommand: Command = {
    name: "topup",
    alias: "t",
    title: "Top up account from giver",
    args: [
        infoFileArg,
        addressOpt,
        networkOpt,
        signerOpt,
        dataOpt,
        valueOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        address: string,
        network: string,
        signer: string,
        data: string,
        value: string,
    }) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified");
        }
        const account = await getAccount(terminal, args);

        const network = new NetworkRegistry().get(args.network);
        const networkGiverInfo = network.giver;
        if (!networkGiverInfo) {
            throw new Error(
                `Missing giver for the network ${network.name}.\n` +
                `You have to set up a giver for this network with \`tondev network giver\` command.`,
            );
        }
        const giver = await NetworkGiver.get(account.client, networkGiverInfo);
        const value = parseNumber(args.value) ?? giver.value ?? 1000000000;
        giver.value = value;
        await giver.sendTo(await account.getAddress(), value);
        terminal.log(`${giver.value} were sent to address ${await account.getAddress()}`);
        await giver.account.free();
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
        networkOpt,
        signerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        signer: string,
        data: string,
        address: string,
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
        networkOpt,
        signerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        signer: string,
        data: string,
        address: string,
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
        networkOpt,
        signerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        signer: string,
        data: string,
        address: string,
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
        contractTopUpCommand,
        contractDeployCommand,
        contractRunCommand,
        contractRunLocalCommand,
        contractRunExecutorCommand,
    ],
};

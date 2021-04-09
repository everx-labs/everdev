import {
    Command,
    CommandArg,
    Terminal,
    ToolController,
} from "../../core";
import {
    Account,
    AccountOptions,
    AccountType,
    ContractPackage,
} from "@tonclient/appkit";
import fs from "fs";
import {
    AbiParam,
    DecodedMessageBody,
    DecodedOutput,
    MessageBodyType,
    signerNone,
    TonClient,
} from "@tonclient/core";
import {createSigner} from "../signer";
import {getSigner} from "../signer/registry";
import {NetworkRegistry} from "../net/registry";

const networkArg: CommandArg = {
    name: "network",
    alias: "n",
    type: "string",
    title: "Network name",
    defaultValue: "",
};

const signerArg: CommandArg = {
    name: "signer",
    alias: "s",
    title: "Signer key name",
    type: "string",
    defaultValue: "",
};

const addressArg: CommandArg = {
    name: "address",
    alias: "a",
    title: "Account address",
    type: "string",
    defaultValue: "",
};

function findExisting(paths: string[]): string | undefined {
    return paths.find(x => fs.existsSync(x));
}

function loadContract(filePath: string): ContractPackage {
    filePath = filePath.trim();
    const lowered = filePath.toLowerCase();
    let basePath;
    if (lowered.endsWith(".tvc") || lowered.endsWith(".abi")) {
        basePath = filePath.slice(0, -4);
    } else if (lowered.endsWith(".abi.json")) {
        basePath = filePath.slice(0, -9);
    } else {
        basePath = filePath;
    }
    const tvcPath = findExisting([`${basePath}.tvc`]);
    const abiPath = findExisting([`${basePath}.abi.json`, `${basePath}.abi`]);
    const tvc = tvcPath ? fs.readFileSync(tvcPath).toString("base64") : undefined;
    const abi = abiPath ? JSON.parse(fs.readFileSync(abiPath, "utf8")) : undefined;
    if (!abi) {
        throw new Error("ABI file missing.");
    }
    return {
        abi,
        tvc,
    };
}

async function getAccount(terminal: Terminal, args: {
    file: string,
    network: string,
    address: string,
    signer: string,
}): Promise<Account> {
    const network = new NetworkRegistry().get(args.network);
    const client = new TonClient({
        network: {
            endpoints: network.endpoints,
        },
    });
    const signerDef = args.signer.trim().toLowerCase() === "none" ? undefined : getSigner(args.signer);
    const signer = signerDef ? await createSigner(signerDef.name) : signerNone();
    const contract = loadContract(args.file);
    const options: AccountOptions = {
        signer,
        client,
    };
    if (args.address !== "") {
        options.address = args.address;
    }
    const account = new Account(contract, options);
    terminal.log("\nConfiguration\n");
    terminal.log(`  Network: ${network.name}`);
    terminal.log(`  Signer:  ${signerDef?.name ?? "None"}\n`);
    terminal.log(`Address: ${await account.getAddress()}`);
    return account;
}

export const contractInfoCommand: Command = {
    name: "info",
    title: "Prints contract summary",
    args: [
        networkArg,
        {
            isArg: true,
            name: "file",
            title: "TVC file",
            type: "file",
            nameRegExp: /\.tvc$/i,
        },
        signerArg,
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
        if (accType === AccountType.nonExist) {
            terminal.log("Account: Not exists");
        } else {
            terminal.log(`Account: ${parsed.acc_type_name}`);
            terminal.log(`Details: ${JSON.stringify(parsed, undefined, "    ")}`);
        }
        await account.free();
        account.client.close();
    },
};

function inputParam(terminal: Terminal, param: AbiParam): Promise<string> {
    terminal.write(`  ${param.name} (${param.type}): `);
    return new Promise((resolve) => {
        const standard_input = process.stdin;
        standard_input.setEncoding("utf-8");
        standard_input.once("data", function (data) {
            resolve(`${data}`.trim());
        });
    });
}


async function inputParams(terminal: Terminal, prompt: string, params: AbiParam[]): Promise<object> {
    const values: { [name: string]: any } = {};
    if (params.length > 0) {
        terminal.log(`\n${prompt}\n`);
        for (const param of params) {
            const value = await inputParam(terminal, param);
            values[param.name] = value;
        }
    }
    return values;
}

export const contractDeployCommand: Command = {
    name: "deploy",
    title: "Deploy contract to network",
    args: [
        networkArg,
        {
            isArg: true,
            name: "file",
            title: "TVC file",
            type: "file",
            nameRegExp: /\.tvc$/i,
        },
        signerArg,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
    }) {
        const account = await getAccount(terminal, args);
        const initFunction = account.contract.abi.functions?.find(x => x.name === "constructor");
        const initInput = await inputParams(terminal, "Enter constructor parameters", initFunction?.inputs ?? []);
        terminal.log("\nDeploying...");
        const giver = await Account.getGiverForClient(account.client);
        await account.deploy({
            useGiver: giver,
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

async function getRunParams(
    terminal: Terminal,
    account: Account,
    args: {
        function: string
    },
): Promise<{
    functionName: string,
    functionInput: object,
}> {
    let functionName = args.function.trim();
    if (functionName === "") {
        const functions = account.contract.abi.functions ?? [];
        terminal.log("\nAvailable functions:\n");
        functions.forEach((x, i) => terminal.log(`  ${i + 1}) ${x.name}`));
        terminal.log();
        functionName = functions[Number.parseInt(await inputParam(terminal, {
            name: "Select function",
            type: "number",
        })) - 1].name;
    }
    const func = account.contract.abi.functions?.find(x => x.name === functionName);
    if (!func) {
        throw new Error(`Function not found: ${functionName}`);
    }
    const functionInput = await inputParams(terminal, `\nEnter ${func.name} parameters:\n`, func.inputs);
    return {
        functionName,
        functionInput,
    };
}

async function logRunResult(
    terminal: Terminal,
    decoded: DecodedOutput | undefined,
    transaction: any,
): Promise<void> {
    const outMessages: DecodedMessageBody[] = (decoded?.out_messages as any) ?? [];
    const details = {
        transaction,
        output: decoded?.output,
        out_messages: outMessages.filter(x => x.body_type !== MessageBodyType.Output),
    };
    terminal.log();
    terminal.log(`Execution has finished with result: ${JSON.stringify(details, undefined, "    ")}`);
}

export const contractRunCommand: Command = {
    name: "run",
    title: "Run contract deployed on the network",
    args: [
        networkArg,
        {
            isArg: true,
            name: "file",
            title: "TVC file",
            type: "file",
            nameRegExp: /\.tvc$/i,
        },
        {
            isArg: true,
            name: "function",
            title: "Function name",
            type: "string",
            defaultValue: "",
        },
        signerArg,
        addressArg,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
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
    title: "Run contract locally on TVM",
    args: [
        networkArg,
        {
            isArg: true,
            name: "file",
            title: "TVC file",
            type: "file",
            nameRegExp: /\.tvc$/i,
        },
        {
            isArg: true,
            name: "function",
            title: "Function name",
            type: "string",
            defaultValue: "",
        },
        signerArg,
        addressArg,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
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
    title: "Emulate transaction executor locally on TVM",
    args: [
        networkArg,
        {
            isArg: true,
            name: "file",
            title: "TVC file",
            type: "file",
            nameRegExp: /\.tvc$/i,
        },
        {
            isArg: true,
            name: "function",
            title: "Function name",
            type: "string",
            defaultValue: "",
        },
        signerArg,
        addressArg,
    ],
    async run(terminal: Terminal, args: {
        file: string,
        network: string,
        address: string,
        signer: string,
        function: string,
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
    title: "Contract",
    commands: [
        contractInfoCommand,
        contractDeployCommand,
        contractRunCommand,
        contractRunLocalCommand,
        contractRunExecutorCommand,
    ],
};

import { Terminal } from "../../core";
import {
    AbiFunction,
    AbiParam,
    DecodedMessageBody,
    DecodedOutput,
    MessageBodyType,
    Signer,
} from "@tonclient/core";
import { Account } from "@tonclient/appkit";
import { ParamParser } from "./param-parser";
import { SignerRegistry } from "../signer/registry";

export async function resolveFunction(
    terminal: Terminal,
    account: Account,
    functionName: string,
    preventUi: boolean,
): Promise<AbiFunction> {
    const functions = account.contract.abi.functions ?? [];
    functionName = functionName.trim();
    while (functionName === "" && !preventUi) {
        terminal.log("\nAvailable functions:\n");
        functions.forEach((x, i) => terminal.log(`  ${i + 1}) ${x.name}`));
        terminal.log();

        const functionIndex = Number.parseInt(await inputParam(terminal, {
            name: "Select function",
            type: "number",
        })) - 1;
        if (functionIndex >= 0 && functionIndex < functions.length) {
            return functions[functionIndex];
        }
        terminal.log("Invalid function number. Try again.");
    }
    if (functionName === "") {
        throw new Error("Function name isn't specified");
    }
    const func = account.contract.abi.functions?.find(x => x.name === functionName);
    if (!func) {
        throw new Error(`Function not found: ${functionName}`);
    }
    return func;
}

function inputLine(terminal: Terminal, prompt: string): Promise<string> {
    terminal.write(`  ${prompt}: `);
    return new Promise((resolve) => {
        const standard_input = process.stdin;
        standard_input.setEncoding("utf-8");
        standard_input.once("data", function (data) {
            resolve(`${data}`.trim());
        });
    });
}

async function inputTuple(terminal: Terminal, param: AbiParam): Promise<any> {
    while (true) {
        const value = await inputLine(terminal, `${param.name} (${param.type})`)
        try {
            return JSON.parse(value) //ParamParser.scalar(param, `"${value}"`)
            return ParamParser.scalar(param, `"${value}"`)
        } catch (err) {
            terminal.log(err.toString())
        }
    }
}

async function inputScalar(terminal: Terminal, param: AbiParam): Promise<any> {
    while (true) {
        const value = await inputLine(terminal, `${param.name} (${param.type})`);
        try {
            return ParamParser.scalar(param, `"${value}"`);
        } catch (err: any) {
            terminal.log(err.toString());
        }
    }
}

async function inputArray(terminal: Terminal, param: AbiParam): Promise<any[]> {
    const item = JSON.parse(JSON.stringify(param)) as AbiParam;
    item.type = param.type.slice(0, -2);
    let count = Number(await inputLine(terminal, `Enter number of items in ${param.name}`));
    const items = [];
    let i = 1;
    while (i <= count) {
        item.name = `${param.name} ${i}`;
        items.push(await inputParam(terminal, item));
        i += 1;
    }
    return items;
}

async function inputParam(terminal: Terminal, param: AbiParam): Promise<any> {
    if (param.type.endsWith("[]")) {
        return inputArray(terminal, param);
    } else if ( param.type.endsWith("tuple")) {
        return inputTuple(terminal, param);
    } else {
        return inputScalar(terminal, param);
    }
}

export async function resolveParams(
    terminal: Terminal,
    prompt: string,
    params: AbiParam[],
    paramsString: string,
    preventUi: boolean,
): Promise<object> {
    if (paramsString.match(/{.+}/)) {
        let jsonArgs: any;
        try {
            jsonArgs = JSON.parse(paramsString);
        } catch (err: any) {
            throw new Error(`Malformed JSON object has been passed`);
        }
        terminal.log(`Skip ABI validation step because a JSON object has been passed as an argument.`);
        return jsonArgs
    }
    const values: { [name: string]: any } = ParamParser.components({
        name: "params",
        type: "tuple",
        components: params,
    }, paramsString);
    let hasUserInput = false;
    if (params.length > 0) {
        terminal.log(prompt);
    }
    for (const param of params) {
        if (param.name in values) {
            terminal.log(`  ${param.name} (${param.type}): ${JSON.stringify(values[param.name])}`);
        }
    }
    for (const param of params) {
        if (!(param.name in values)) {
            if (!hasUserInput) {
                if (preventUi) {
                    throw new Error(`Missing parameter "${param.name}".`);
                }
                hasUserInput = true;
            }
            values[param.name] = await inputParam(terminal, param);
        }
    }
    return values;
}

export async function getRunParams(
    terminal: Terminal,
    account: Account,
    args: {
        function: string,
        input: string,
        preventUi: boolean,
        signer: string,
        address: string,
        runSigner: string,
    },
): Promise<{
    functionName: string,
    functionInput: object,
    signer: Signer,
}> {
    const func = await resolveFunction(terminal, account, args.function, args.preventUi);
    const functionInput = await resolveParams(
        terminal,
        `\nParameters of ${func.name}:\n`,
        func.inputs,
        args.input,
        args.preventUi,
    );
    const signers = new SignerRegistry();
    const signer = args.runSigner.trim() !== ""
        ? await signers.resolveSigner(args.runSigner, { useNoneForEmptyName: false })
        : account.signer;
    return {
        functionName: func.name,
        functionInput,
        signer,
    };
}

export async function logRunResult(
    terminal: Terminal,
    decoded: DecodedOutput | undefined,
    transaction: any,
): Promise<void> {
    const outMessages: DecodedMessageBody[] = (decoded?.out_messages as any) ?? [];
    const details = {
        transaction,
        output: decoded?.output,
        out_messages: outMessages.filter(x => x?.body_type !== MessageBodyType.Output),
    };
    terminal.log();
    terminal.log(`Execution has finished with result: ${JSON.stringify(details, undefined, "    ")}`);
}

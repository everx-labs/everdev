import {Terminal} from "../../core";
import {
    AbiFunction,
    AbiParam,
    DecodedMessageBody,
    DecodedOutput,
    MessageBodyType,
} from "@tonclient/core";
import {Account} from "@tonclient/appkit";

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

function resolveParamValue(_param: AbiParam, value: string): any {
    return value;
}

export async function resolveInputs(
    terminal: Terminal,
    prompt: string,
    params: AbiParam[],
    inputString: string,
    preventUi: boolean,
): Promise<object> {
    const values: { [name: string]: any } = {};
    inputString
        .split(",")
        .map(x => x.trim())
        .filter(x => x !== "")
        .map(x => x.split("="))
        .forEach((nameValue) => {
            if (nameValue.length < 2) {
                throw new Error(`Missing value for parameter "${nameValue[0]}".`);
            }
            const [name, value] = nameValue;
            const param = params.find(x => x.name === name.trim().toLowerCase());
            if (!param) {
                throw new Error(`Parameter "${name}" not found.`);
            }
            if (param.name in values) {
                throw new Error(`Parameter "${name}" already defined.`);
            }
            values[param.name] = resolveParamValue(param, value);
        });
    let hasUserInput = false;
    for (const param of params) {
        if (!(param.name in values)) {
            if (!hasUserInput) {
                if (preventUi) {
                    throw new Error(`Missing parameter "${param.name}".`);
                }
                terminal.log(`\n${prompt}\n`);
            }
            while (true) {
                const value = await inputParam(terminal, param);
                try {
                    values[param.name] = resolveParamValue(param, value);
                    break;
                } catch (err) {
                    terminal.log(err.toString());
                }
            }
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
    },
): Promise<{
    functionName: string,
    functionInput: object,
}> {
    const func = await resolveFunction(terminal, account, args.function, args.preventUi);
    const functionInput = await resolveInputs(
        terminal
        , `\nEnter ${func.name} parameters:\n`,
        func.inputs,
        args.input,
        args.preventUi,
    );
    return {
        functionName: func.name,
        functionInput,
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
        out_messages: outMessages.filter(x => x.body_type !== MessageBodyType.Output),
    };
    terminal.log();
    terminal.log(`Execution has finished with result: ${JSON.stringify(details, undefined, "    ")}`);
}

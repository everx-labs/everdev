import { Clang } from "./clang";
import { Solidity } from "./solidity";
// import {TestSuite} from "./ts";
import { JsApps } from "./js";
import { SE } from "./se";
import { TONOS } from "./tonos-cli";
import { TestSuite4 } from "./ts4";
import { DeBrowser } from "./debrowser";
import {
    Command,
    matchName,
    Terminal,
    ToolController,
} from "../core";
import { SignerTool } from "./signer";
import { NetworkTool } from "./network";
import { Contract } from "./contract";
import { missingArgError } from "../cli";

export const controllers = [
    Clang,
    Solidity,
    SE,
    NetworkTool,
    SignerTool,
    Contract,
    JsApps,
    TONOS,
    TestSuite4,
    DeBrowser,
];

export function findControllerAndCommandByAlias(
    alias: string,
): { controller: ToolController, command: Command } | undefined {
    alias = alias.trim().toLowerCase();
    for (const controller of controllers) {
        for (const command of controller.commands) {
            if (controller.alias && command.alias) {
                if (`${controller.alias}${command.alias}` === alias) {
                    return {
                        controller,
                        command,
                    };
                }
            }
        }
    }
    return undefined;
}

export async function runCommand(terminal: Terminal, name: string, args: any): Promise<void> {
    const [controllerName, commandName] = name
        .toLowerCase()
        .split(" ")
        .map(x => x.trim())
        .filter(x => x !== "");
    const controller = controllers.find(x => matchName(x, controllerName));
    if (!controller) {
        throw new Error(`Controller ${controllerName} not found`);
    }
    const command = controller.commands.find(x => matchName(x, commandName));
    if (!command) {
        throw new Error(`Command ${commandName} not found in controller ${controllerName}`);
    }

    const resolvedArgs: any = Object.assign({}, args);
    let checkedArgs = Object.keys(resolvedArgs);

    for (const arg of command.args ?? []) {
        const name = arg.name
            .split("-")
            .map((x, i) => i > 0 ? (x.substr(0, 1).toUpperCase() + x.substr(1)) : x)
            .join("");
        if (resolvedArgs[name] === undefined) {
            if (arg.defaultValue !== undefined) {
                resolvedArgs[name] = arg.type === "boolean" ? arg.defaultValue === "true" : arg.defaultValue;
            } else if (arg.type === "folder") {
                resolvedArgs[name] = process.cwd();
            } else {
                throw await missingArgError(arg);
            }
        } else {
            // remove matched element from array 
            checkedArgs = checkedArgs.filter(k => k !== name);
        }
    }

    if (checkedArgs.length > 0) {
        const msg = [`Unknow option: ${checkedArgs[0]}`]
        if (checkedArgs[0].includes('-')) {
            msg.push(
                `You must convert parameters to camelcase, for example "output-dir" to "outputDir"`,
            )
        }
        throw Error(msg.join('\n'))
    }
    await command.run(terminal, resolvedArgs);
}

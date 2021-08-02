import {Clang} from "./clang";
import {Solidity} from "./solidity";
// import {TestSuite} from "./ts";
import {JsApps} from "./js";
import {SE} from "./se";
import {SENonDocker} from "./se-nd";
import {TONOS} from "./tonos-cli";
import {TestSuite4} from "./ts4";
import {
    Command,
    matchName,
    Terminal,
    ToolController,
} from "../core";
import {SignerTool} from "./signer";
import {NetworkTool} from "./network";
import {Contract} from "./contract";

export const controllers = [
    Clang,
    Solidity,
    SE,
    SENonDocker,
    NetworkTool,
    SignerTool,
    Contract,
    JsApps,
    TONOS,
    TestSuite4,
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
    await command.run(terminal, args);
}

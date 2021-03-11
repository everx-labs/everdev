import { Solidity } from "./solidity";
// import {TestSuite} from "./ts";
import { JsApps } from "./js";
import { SE } from "./se";
import { Terminal } from "../core";

export const controllers = [
    Solidity, JsApps, SE,
];

export async function runCommand(terminal: Terminal, name: string, args: any): Promise<void> {
    const [controllerName, commandName] = name
        .toLowerCase()
        .split(" ")
        .map(x => x.trim())
        .filter(x => x !== "");
    const controller = controllers.find(x => x.name === (controllerName || ""));
    if (!controller) {
        throw new Error(`Controller ${controllerName} not found`);
    }
    const command = controller.commands.find(x => x.name === (commandName || ""));
    if (!command) {
        throw new Error(`Command ${commandName} not found in controller ${controllerName}`);
    }
    await command.run(terminal, args);
}

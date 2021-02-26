import { Command, CommandArg, ToolController } from "../core";
import { controllers } from "../controllers";
import { consoleTerminal, formatTable } from "../core/utils";
import * as fs from "fs";
import * as path from "path";

enum ParseState {
    OptionOrArg,
    OptionValue,
}

type CommandLine = {
    args: string[];
    options: { [name: string]: any };
}

function parseCommandLine(programArgs: string[]): CommandLine {
    let state = ParseState.OptionOrArg;
    let option = "";
    const args: string[] = [];
    const options: { [name: string]: any } = {};

    for (const arg of programArgs) {
        const argOption: string | null =
            arg.startsWith("--") ? arg.substr(2) : (arg.startsWith("-") ? arg : null);
        switch (state) {
            case ParseState.OptionOrArg:
                if (option !== "") {
                    options[option] = "";
                }
                if (argOption) {
                    option = argOption;
                    state = ParseState.OptionValue;
                } else {
                    option = "";
                    args.push(arg);
                }
                break;
            case ParseState.OptionValue:
                options[option] = arg;
                option = "";
                state = ParseState.OptionOrArg;
                break;
        }
    }
    if (option !== "") {
        options[option] = "";
    }
    return {
        args,
        options,
    };
}

export function printCommandUsage(controller: ToolController, command: Command) {
    let usageArgs = "";
    const options: CommandArg[] = [];
    const args: CommandArg[] = [];
    for (const arg of command.args ?? []) {
        if (arg.isArg) {
            usageArgs += ` ${arg.name}`;
            args.push(arg);
        } else {
            options.push(arg);
        }
    }
    if (options.length > 0) {
        usageArgs += ` [options]`;
    }
    console.log(`Use: tondev ${controller.name} ${command.name}${usageArgs}`);
    if (args.length > 0) {
        console.log("Args:");
        console.log(formatTable(args.map(x => ["  ", x.name, x.title])));
    }
    console.log("Options:");
    console.log(`    --help, -h  Show command usage`);
    console.log(formatTable(options.map(x => ["  ", `--${x.name}`, x.title])));
    return;
}

export function printControllerUsage(controller: ToolController) {
    const commands: [string, Command][] = controller.commands
        .map(x => [`${controller.name} ${x.name}`, x]);
    console.log(formatTable(commands.map(x => ["  ", x[0], x[1].title])));
}

export function printUsage(controller?: ToolController, command?: Command) {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "package.json"), "utf8"));
    console.log(`TONDev Version: ${pkg.version}`);
    if (controller && command) {
        printCommandUsage(controller, command);
        return;
    }
    console.log(`Use: tondev ${controller?.name ?? "tool"} ${command?.name ?? "command"} args [options]`);
    console.log(`Options:`);
    console.log(`    --help, -h  Show command usage`);
    if (controller) {
        console.log("Commands:");
        printControllerUsage(controller);
        return;
    }
    for (const controller of controllers) {
        console.log(`\n${controller.title ?? controller.name} Commands:\n`);
        printControllerUsage(controller);
    }
}

function missingArgError(arg: CommandArg): Error {
    throw new Error(`Missing required ${arg.name}`);
}

function getArgValue(arg: CommandArg, commandLine: CommandLine): string | undefined {
    if (arg.isArg) {
        const value = commandLine.args.splice(0, 1)[0];
        if (value !== undefined) {
            return value;
        }
        if (arg.defaultValue !== undefined) {
            return arg.defaultValue;
        }
        throw missingArgError(arg);
    }
    let value = commandLine.options[arg.name];
    if (value !== undefined) {
        return value;
    }
    if (arg.defaultValue !== undefined) {
        return arg.defaultValue;
    }
    if (arg.type === "folder") {
        return process.cwd();
    }
    throw missingArgError(arg);
}

function extractNextArg(commandLine: CommandLine): string {
    return (commandLine.args.splice(0, 1)[0] ?? "").toLowerCase();
}

function getOption(commandLine: CommandLine, name: string, alias: string): string | undefined {
    if (commandLine.options[name] !== undefined) {
        return commandLine.options[name];
    }
    return commandLine.options[alias];
}

export async function run() {
    const commandLine = parseCommandLine(process.argv.slice(2));
    if (commandLine.args.length === 0) {
        printUsage();
        return;
    }
    const controllerName = extractNextArg(commandLine);
    const controller = controllers.find(x => x.name === controllerName);
    if (!controller) {
        throw new Error(`Unknown tool: ${controllerName}.`);
    }
    const commandName = extractNextArg(commandLine);
    const command = controller.commands.find(x => x.name === commandName);
    if (!command) {
        if (commandName) {
            throw new Error(`Unknown command: ${commandName}`);
        }
        printUsage(controller, command);
        return;
    }
    if (getOption(commandLine, "help", "-h") !== undefined) {
        printUsage(controller, command);
        return;
    }
    const args: { [name: string]: any } = {};
    for (const arg of command.args ?? []) {
        args[arg.name] = getArgValue(arg, commandLine);
    }
    await command.run(consoleTerminal, args);
}

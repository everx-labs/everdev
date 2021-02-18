import {Command, CommandArg} from "../core";
import {controllers} from "../controllers";
import {consoleTerminal} from "../core/utils";
import * as fs from "fs";
import * as path from "path";

enum ParseState {
    OptionOrArg,
    OptionValue,
    Arg,
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
        const argOption: string | null = arg.startsWith("-")
            ? arg.substr(1)
            : (arg.startsWith("--") ? arg.substr(2) : null);

        if (state === ParseState.OptionOrArg && argOption) {
            option = argOption;
            state = ParseState.OptionValue;
        } else if (state === ParseState.OptionOrArg) {
            args.push(arg);
            state = ParseState.Arg;
        } else if (state === ParseState.OptionValue) {
            options[option] = arg;
            state = ParseState.OptionOrArg;
        } else if (state === ParseState.Arg) {
            args.push(arg);
        }
    }
    return {
        args,
        options,
    };
}

export function printUsage() {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "package.json"), "utf8"));
    console.log("Use: tondev command args...");
    console.log(`Version: ${pkg.version}`);
    console.log("Commands:");
    const commands: [string, Command][] = [];
    for (const controller of controllers) {
        for (const command of controller.commands) {
            commands.push([`${controller.name} ${command.name}`, command])
        }
    }
    let colWidth = commands.reduce((w, x) => Math.max(w, x[0].length), 0);
    commands.forEach(x => {
        console.log(`    ${x[0].padEnd(colWidth)}  ${x[1].title}`);
    });
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
        throw new Error(`Unknown command: ${commandName}`);
    }
    const args: { [name: string]: any } = {};
    for (const arg of command.args ?? []) {
        args[arg.name] = getArgValue(arg, commandLine);
    }
    await command.run(consoleTerminal, args);
}

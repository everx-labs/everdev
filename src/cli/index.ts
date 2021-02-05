#!/usr/bin/env node
import {Command, CommandArg} from "../core";
import {controllers} from "../controllers";
import {consoleTerminal} from "../core/utils";

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

function getAllCommands(): Command[] {
    return controllers.flatMap(x => x.commands);
}

export function printUsage() {
    console.log("Use: tondev command args...\n");
    console.log("Commands:");
    const commands = getAllCommands();
    let colWidth = commands.reduce((w, x) => Math.max(w, x.name.length), 0);
    commands.forEach(command => {
        console.log(`    ${command.name.padEnd(colWidth)}  ${command.title}`);
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

async function run() {
    const commandLine = parseCommandLine(process.argv.slice(2));
    if (commandLine.args.length === 0) {
        printUsage();
        return;
    }
    const commandName = commandLine.args.splice(0, 1)[0];
    const command = getAllCommands().find(x => x.name === commandName);
    if (!command) {
        throw new Error(`Unknown command: ${commandName}`);
    }
    const args: { [name: string]: any } = {};
    for (const arg of command.args ?? []) {
        args[arg.name] = getArgValue(arg, commandLine);
    }
    await command.run(consoleTerminal, args);
}


(async () => {
    try {
        await run();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();


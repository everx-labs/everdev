import {
    Command,
    CommandArg,
    ToolController,
} from "../core";
import {controllers} from "../controllers";
import {
    consoleTerminal,
    formatTable,
} from "../core/utils";
import * as fs from "fs";
import * as path from "path";

function argIsOption(arg: CommandArg, name: string, alias: string): boolean {
    return !arg.isArg && (
        name !== "" && arg.name === name
        || alias !== "" && arg.alias === alias
    );
}

function findOptionArg(command: Command, name: string): CommandArg | undefined {
    const full = name.startsWith("--") ? name.substr(2).split("-").join("") : "";
    const alias = name.startsWith("-") ? name.substr(1) : "";
    return command.args?.find(arg => argIsOption(arg, full, alias));
}

class CommandLine {
    args: { help?: boolean, [name: string]: any } = {};
    controller: ToolController | undefined = undefined;
    command: Command | undefined = undefined;
    positional: CommandArg[] = [];
    unresolved = new Map<string, CommandArg>();
    pending: CommandArg | undefined = undefined;

    resolveValue(arg: CommandArg, value: string | undefined) {
        if (arg.type === "boolean" && value === undefined) {
            value = "true";
        }
        if (value === undefined) {
            throw new Error(`Missing value for ${arg.name}`);
        }
        let resolved: any;
        if (arg.type === "boolean") {
            resolved = value.toLowerCase() === "true";
        } else {
            resolved = value;
        }
        if (arg.getVariants !== undefined && !arg.getVariants().find(x => x.name === value)) {
            throw missingArgError(arg);
        }
        this.args[arg.name] = resolved;
        this.unresolved.delete(arg.name);
        const i = this.positional.indexOf(arg);
        if (i >= 0) {
            this.positional.splice(i, 1);
        }
        if (this.pending === arg) {
            this.pending = undefined;
        }
    }

    resolveDefault(arg: CommandArg) {
        if (arg.defaultValue !== undefined) {
            if (arg.type === "boolean") {
                this.args[arg.name] = arg.defaultValue === "true";
            } else {
                this.args[arg.name] = arg.defaultValue;
            }
        } else if (arg.type === "folder") {
            this.args[arg.name] = process.cwd();
        } else {
            throw missingArgError(arg);
        }
    }

    parseOptionName(name: string) {
        if (this.pending) {
            this.resolveValue(this.pending, undefined);
        }
        const optionName: string = name.toLowerCase();
        if (optionName === "--help" || optionName === "-h") {
            this.args.help = true;
        } else if (this.command) {
            this.pending = findOptionArg(this.command, optionName);
            if (!this.pending) {
                throw new Error(`Unknown option ${optionName}`);
            }
            if (this.pending.type === "boolean") {
                this.resolveValue(this.pending, undefined);
            }
        } else if (this.controller) {
            throw new Error(`Unexpected option ${optionName} before command name.`);
        } else {
            throw new Error(`Unexpected option ${optionName} before tool name.`);
        }
    }

    parse(programArgs: string[]) {
        for (const arg of programArgs) {
            if (arg.startsWith("-")) {
                this.parseOptionName(arg);
            } else if (this.pending) {
                this.resolveValue(this.pending, arg);
            } else if (this.controller && this.command) {
                if (this.positional.length === 0) {
                    throw new Error(`Unexpected argument ${arg}`);
                }
                this.resolveValue(this.positional[0], arg);
            } else if (this.controller) {
                this.command = this.controller.commands.find(x => x.name === arg.toLowerCase());
                if (!this.command) {
                    throw new Error(`Unknown command: ${arg}`);
                }
                for (const arg of this.command.args ?? []) {
                    this.unresolved.set(arg.name, arg);
                    if (arg.isArg) {
                        this.positional.push(arg);
                    }
                }
            } else {
                this.controller = controllers.find(x => x.name === arg.toLowerCase());
                if (!this.controller) {
                    throw new Error(`Unknown tool: ${arg}.`);
                }
            }
        }
        if (this.pending) {
            this.resolveValue(this.pending, undefined);
        }
        for (const arg of this.unresolved.values()) {
            this.resolveDefault(arg);
        }
    }
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
    console.log(formatTable([
        ["  ", "--help, -h", "Show command usage"],
        ...options.map(x => ["  ", `--${x.name}${x.alias ? ", -" + x.alias : ""}`, x.title]),
    ]));
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
    const variants: string = arg.getVariants
        ? "\n" +
        formatTable(
            [["Available variants:", ""], ...arg.getVariants().map(x => [x.name, x.description ?? ""])],
            {headerSeparator: true},
        )
        : "";
    throw new Error(`Missing required ${arg.name}${variants}`);
}

export async function run() {
    const parser = new CommandLine();
    parser.parse(process.argv.slice(2));
    const {
        controller,
        command,
        args,
    } = parser;
    if (!controller || !command) {
        printUsage(controller, command);
        return;
    }
    if (parser.args.help) {
        printUsage(controller, command);
        return;
    }
    await command.run(consoleTerminal, args);
}

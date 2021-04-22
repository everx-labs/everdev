import {
    Command,
    CommandArg,
    getArgVariants,
    matchName,
    ToolController,
} from "../core";
import {
    controllers,
    findControllerAndCommandByAlias,
} from "../controllers";
import {
    consoleTerminal,
    formatTable,
} from "../core/utils";
import {printUsage} from "./help";
import {printSummaryInfo} from "./summary-info";

function findOptionArg(command: Command, name: string): CommandArg | undefined {
    if (name.startsWith("--")) {
        name = name.substr(2).toLowerCase();
        return command.args?.find(x => !x.isArg && x.name === name);
    }
    if (name.startsWith("-")) {
        name = name.substr(1).toLowerCase();
        return command.args?.find(x => !x.isArg && x.alias === name);
    }
    return undefined;
}


class CommandLine {
    args: { help?: boolean, [name: string]: any } = {};
    controller: ToolController | undefined = undefined;
    command: Command | undefined = undefined;
    positional: CommandArg[] = [];
    unresolved = new Map<string, CommandArg>();
    pending: CommandArg | undefined = undefined;
    printSummaryInfo = false;

    setArgValue(arg: CommandArg, value: any) {
        const name = arg.name
            .split("-")
            .map((x, i) => i > 0 ? (x.substr(0, 1).toUpperCase() + x.substr(1)) : x)
            .join("");
        this.args[name] = value;
    }

    async resolveValue(arg: CommandArg, value: string | undefined) {
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
        const variants = await getArgVariants(arg);
        if (variants && !variants.find(x => x.value === value)) {
            throw await missingArgError(arg);
        }
        this.setArgValue(arg, resolved);
        this.unresolved.delete(arg.name);
        const i = this.positional.indexOf(arg);
        if (i >= 0) {
            this.positional.splice(i, 1);
        }
        if (this.pending === arg) {
            this.pending = undefined;
        }
    }

    async resolveDefault(arg: CommandArg) {
        if (arg.defaultValue !== undefined) {
            this.setArgValue(arg, arg.type === "boolean" ? arg.defaultValue === "true" : arg.defaultValue);
        } else if (arg.type === "folder") {
            this.setArgValue(arg, process.cwd());
        } else {
            throw await missingArgError(arg);
        }
    }

    async parseOptionName(name: string) {
        if (this.pending) {
            await this.resolveValue(this.pending, undefined);
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
                await this.resolveValue(this.pending, undefined);
            }
        } else if (this.controller) {
            throw new Error(`Unexpected option ${optionName} before command name.`);
        } else {
            throw new Error(`Unexpected option ${optionName} before tool name.`);
        }
    }

    setCommand(command: Command) {
        this.command = command;
        for (const arg of this.command.args ?? []) {
            this.unresolved.set(arg.name, arg);
            if (arg.isArg) {
                this.positional.push(arg);
            }
        }

    }

    async parse(programArgs: string[]) {
        for (let arg of programArgs) {
            if (arg.startsWith("-") && !this.pending) {
                await this.parseOptionName(arg);
            } else {
                arg = arg.trim();
                if (this.pending) {
                    await this.resolveValue(this.pending, arg);
                } else if (this.controller && this.command) {
                    if (this.positional.length === 0) {
                        throw new Error(`Unexpected argument ${arg}`);
                    }
                    await this.resolveValue(this.positional[0], arg);
                } else if (this.controller) {
                    const command = this.controller.commands.find(x => matchName(x, arg));
                    if (command) {
                        this.setCommand(command);
                    } else {
                        throw new Error(`Unknown command: ${arg}`);
                    }
                } else {
                    this.controller = controllers.find(x => matchName(x, arg));
                    if (!this.controller) {
                        const byAlias = findControllerAndCommandByAlias(arg);
                        if (byAlias) {
                            this.controller = byAlias.controller;
                            this.setCommand(byAlias.command);
                        } else if (arg.toLowerCase().trim() === "info") {
                            this.printSummaryInfo = true;
                            break;
                        } else {
                            throw new Error(`Unknown tool: ${arg}.`);
                        }
                    }
                }
            }
        }
        if (this.pending) {
            await this.resolveValue(this.pending, undefined);
        }
        if (this.args.help || this.printSummaryInfo) {
            return;
        }
        for (const arg of this.unresolved.values()) {
            await this.resolveDefault(arg);
        }
    }
}

async function missingArgError(arg: CommandArg): Promise<Error> {
    const variants = await getArgVariants(arg);
    const variantsString = variants
        ? "\n" +
        formatTable([
                ["Available variants:", ""],
                ...variants.map(x => [x.value, x.description ?? ""]),
            ],
            { headerSeparator: true },
        )
        : "";
    throw new Error(`Missing required ${arg.name}${variantsString}`);
}

export async function run() {
    const parser = new CommandLine();
    await parser.parse(process.argv.slice(2));
    if (parser.printSummaryInfo) {
        await printSummaryInfo();
        return;
    }
    const {
        controller,
        command,
        args,
    } = parser;
    if (!controller || !command) {
        await printUsage(controller, command);
        return;
    }
    if (parser.args.help) {
        await printUsage(controller, command);
        return;
    }
    await command.run(consoleTerminal, args);
}

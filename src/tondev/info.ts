import {controllers} from "../controllers";
import {
    Command,
    Terminal,
    ToolController,
} from "../core";

function findInfoCommand(controller: ToolController, name: string): { command: Command, args: any } | undefined {
    if (controller.name === "contract" && name === "info") {
        return undefined;
    }
    const command = controller.commands.find(x => x.name == name);
    if (!command) {
        return undefined;
    }
    const args: any = {};
    for (const arg of command.args ?? []) {
        if (arg.defaultValue === undefined) {
            return undefined;
        }
        args[arg.name] = arg.defaultValue;
    }
    return {
        command,
        args,
    };
}

export async function printSummaryInfo(terminal: Terminal) {
    for (const controller of controllers) {
        const info = findInfoCommand(controller, "info") ??
            findInfoCommand(controller, "list") ??
            findInfoCommand(controller, "version");
        if (info) {
            terminal.log();
            terminal.log(controller.title);
            terminal.log();
            try {
                await info.command.run(terminal, info.args);
            } catch (error) {
                terminal.writeError(`${error}`);
            }
        }
    }
    terminal.log();
}

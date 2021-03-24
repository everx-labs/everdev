import {
    Command,
    CommandArg,
    getArgVariants,
    ToolController,
} from "../core";
import {formatTable} from "../core/utils";
import fs from "fs";
import path from "path";
import {controllers} from "../controllers";

async function printCommandUsage(controller: ToolController, command: Command) {
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
    const optionsTable = [["  ", "--help, -h", "Show command usage"]];
    for (const option of options) {
        optionsTable.push([
            "  ",
            `--${option.name}${option.alias ? ", -" + option.alias : ""}`,
            option.title ?? "",
        ]);
        const variants = await getArgVariants(option);
        if (variants) {
            formatTable(variants.map(x => [x.value, x.description])).split("\n").forEach(line => {
                optionsTable.push(["", "", line]);
            });
        }
    }
    console.log(formatTable(optionsTable));
}

function printControllerUsage(controller: ToolController) {
    const commands: [string, Command][] = controller.commands
        .map(x => [`${controller.name} ${x.name}`, x]);
    console.log(formatTable(commands.map(x => ["  ", x[0], x[1].title])));
}

export async function printUsage(controller?: ToolController, command?: Command) {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "package.json"), "utf8"));
    console.log(`TONDev Version: ${pkg.version}`);
    if (controller && command) {
        await printCommandUsage(controller, command);
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

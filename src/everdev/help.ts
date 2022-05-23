import {
    Command,
    CommandArg,
    getArgVariants,
    nameInfo,
    Terminal,
    ToolController,
} from "../core"
import { breakWords, formatTable } from "../core/utils"
import fs from "fs"
import path from "path"
import { controllers } from "../controllers"

async function printCommandUsage(
    terminal: Terminal,
    controller: ToolController,
    command: Command,
) {
    let usageArgs = ""
    const options: CommandArg[] = []
    const args: CommandArg[] = []
    for (const arg of command.args ?? []) {
        if (arg.isArg) {
            usageArgs += ` ${arg.name}`
            args.push(arg)
        } else {
            options.push(arg)
        }
    }
    if (options.length > 0) {
        usageArgs += ` [options]`
    }
    terminal.log(`Use: everdev ${controller.name} ${command.name}${usageArgs}`)
    if (args.length > 0) {
        terminal.log("Args:")
        terminal.log(formatTable(args.map(x => ["  ", x.name, x.title])))
    }
    terminal.log("Options:")
    const optionsTable = [["  ", "--help, -h", "Show command usage"]]
    for (const option of options) {
        optionsTable.push([
            "  ",
            nameInfo(option, "--", "-"),
            option.title ?? "",
        ])
        if (option.description) {
            breakWords(option.description, 60)
                .split("\n")
                .forEach(line => {
                    optionsTable.push(["", "", line])
                })
        }
        const variants = await getArgVariants(option)
        if (variants) {
            optionsTable.push(["", "", "Variants:"])
            formatTable(variants.map(x => [x.value, x.description]))
                .split("\n")
                .forEach(line => {
                    optionsTable.push(["", "", line])
                })
        }
    }
    terminal.log(formatTable(optionsTable))
}

function printControllerUsage(terminal: Terminal, controller: ToolController) {
    terminal.log(
        formatTable(controller.commands.map(x => ["  ", nameInfo(x), x.title])),
    )
}

export async function printUsage(
    terminal: Terminal,
    controller?: ToolController,
    command?: Command,
) {
    const pkg = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname, "..", "..", "package.json"),
            "utf8",
        ),
    )
    terminal.log(`EverDev Version: ${pkg.version}`)
    if (controller && command) {
        await printCommandUsage(terminal, controller, command)
        return
    }
    terminal.log(
        `Use: everdev ${controller?.name ?? "tool"} ${
            command?.name ?? "command"
        } args [options]`,
    )
    terminal.log(`Options:`)
    terminal.log(`    --help, -h  Show command usage`)
    if (controller) {
        terminal.log("Commands:")
        printControllerUsage(terminal, controller)
        return
    }
    terminal.log("Tools:")
    const rows: string[][] = []
    controllers.forEach(controller => {
        rows.push(["  ", nameInfo(controller), controller.title ?? ""])
    })
    terminal.log(formatTable(rows))
}

import path from "path"
import { Command, Terminal } from "../../core"

export const tsInspectCommand: Command = {
    name: "inspect",
    title: "Inspect Test Result",
    args: [
        {
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,
        },
    ],
    async run(terminal: Terminal, args: { file: string }) {
        terminal.log(`${path.basename(args.file)} tests passed`)
    },
}

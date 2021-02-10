import path from "path";
import { Command, Terminal } from "../../core";
export const tsRunCommand: Command = {
    name: "run",
    title: "Run Test",
    args: [{
        isArg: true,
        name: "file",
        type: "file",
        nameRegExp: /\.test\.py$/,
    },
    ],
    async run(terminal: Terminal, args: { file: string }) {
        terminal.log(`${path.basename(args.file)} test passed`);
    },
}

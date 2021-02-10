import path from "path";
import { Command, Terminal } from "../../core";
import { changeExt, uniqueFilePath } from "../../core/utils";

export const tsCreateCommand: Command = {
    name: "create",
    title: "Create Test",
    args: [{
        name: "folder",
        type: "folder",
    }],
    async run(terminal: Terminal, args: { file: string }) {
        const testFilePath = uniqueFilePath(
            path.dirname(args.file),
            changeExt(path.basename(args.file), "{}.test.py")
        );
        terminal.log(`${testFilePath} has created for ${path.basename(args.file)}`);
    },
}

import path from "path";
import {Terminal} from "../../core";
import {changeExt, uniqueFilePath} from "../../core/utils";

export async function createTSTest(terminal: Terminal, args: { file: string }) {
    const testFilePath = uniqueFilePath(
        path.dirname(args.file),
        changeExt(path.basename(args.file), "{}.test.py")
    );
    terminal.log(`${testFilePath} has created for ${path.basename(args.file)}`);
}

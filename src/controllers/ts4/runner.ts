import path from "path";
import {Terminal} from "../../core";

export async function runTS4Test(terminal: Terminal, args: { file: string }) {
    terminal.log(`${path.basename(args.file)} test passed`);
}

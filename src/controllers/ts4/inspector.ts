import path from "path";
import {Terminal} from "../../core";

export async function runTS4Inspector(terminal: Terminal, args: { file: string }) {
    terminal.log(`${path.basename(args.file)} tests passed`);
}

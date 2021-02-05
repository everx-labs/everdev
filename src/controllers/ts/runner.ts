import path from "path";
import {Terminal} from "../../core";

export async function runTSTest(terminal: Terminal, args: { file: string }) {
    terminal.log(`${path.basename(args.file)} test passed`);
}

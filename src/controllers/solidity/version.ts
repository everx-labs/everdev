import { solc } from "./installer";
import { Command, Terminal } from "../../core";

async function solcVersion(terminal: Terminal): Promise<string> {
    const out = await solc(terminal, process.cwd(), ["--version"]);
    return out.match(/Version:\s*([0-9.]+)/)?.[1] ?? "";
}

export const solidityVersionCommand: Command = {
    name: "version",
    title: "Show Solidity Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await solcVersion(terminal));
    },
};
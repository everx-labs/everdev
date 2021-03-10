import {
    solidityInfo,
} from "./installer";
import {
    Command,
    Terminal,
} from "../../core";

export const solidityVersionCommand: Command = {
    name: "version",
    title: "Show Solidity Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await solidityInfo(terminal);
    },
};

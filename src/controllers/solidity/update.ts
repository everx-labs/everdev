import { solidityUpdate } from "./installer";
import { Command, Terminal } from "../../core";

export const solidityUpdateCommand: Command = {
    name: "update",
    title: "Update Solidity Compiler",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        solidityUpdate(terminal);
    },
};
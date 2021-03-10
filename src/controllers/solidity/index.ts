import { solidityCreateCommand } from "./create";
import { solidityCompileCommand } from "./compile";
import { ToolController } from "../../core";
import { solidityVersionCommand } from "./version";
import {
    soliditySetCommand,
    solidityUpdateCommand,
} from "./update";

export const Solidity: ToolController = {
    name: "sol",
    title: "Solidity Compiler",
    commands: [
        solidityCreateCommand,
        solidityCompileCommand,
        solidityVersionCommand,
        soliditySetCommand,
        solidityUpdateCommand
    ],
};

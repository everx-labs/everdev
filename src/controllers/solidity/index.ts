import { solidityCreateCommand } from "./create";
import { solidityCompileCommand } from "./compile";
import { ToolController } from "../../core";

export const Solidity: ToolController = {
    name: "sol",
    title: "Solidity Compiler",
    commands: [solidityCreateCommand, solidityCompileCommand],
};

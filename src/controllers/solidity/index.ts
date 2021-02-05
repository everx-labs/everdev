import {createSolidityContract} from "./codeFactory";
import {compileSolidity} from "./compiler";
import {ToolController} from "../../core";

export const Solidity: ToolController = {
    name: "sol",
    title: "Solidity Compiler",
    commands: [{
        name: "create",
        title: "Create Solidity contract",
        args: [{
            isArg: true,
            name: "name",
            title: "Contract Name",
            type: "string",
            defaultValue: "Contract",
        }, {
            name: "folder",
            type: "folder",
        }],
        run: createSolidityContract,
    }, {
        name: "compile",
        title: "Compile Solidity contract",
        args: [{
            isArg: true,
            name: "file",
            type: "file",
            title: "Source file",
            nameRegExp: /\\.sol$/,
        },
        ],
        run: compileSolidity,
    }],
};

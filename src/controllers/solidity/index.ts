import {createSolidityContract} from "./codeFactory";
import {compileSolidity} from "./compiler";
import {ToolController} from "../../core";

export const Solidity: ToolController = {
    commands: [{
        name: "create-sol",
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
        name: "compile-sol",
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

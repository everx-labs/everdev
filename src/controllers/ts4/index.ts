import {createTS4Test} from "./codeFactory";
import {runTS4Test} from "./runner";
import {runTS4Inspector} from "./inspector";
import {ToolController} from "../../core";

export const TS4: ToolController = {
    commands: [{
        name: "create-ts4-test",
        title: "Create TS4 Test",
        args: [{
            name: "folder",
            type: "folder",
        }],
        run: createTS4Test,
    }, {
        name: "run-ts4-test",
        title: "Run TS4 Test",
        args: [{
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,
        },
        ],
        run: runTS4Test,
    }, {
        name: "run-ts4-inspector",
        title: "Run TS4 Inspector",
        args: [{
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,

        }],
        run: runTS4Inspector,
    }],
};

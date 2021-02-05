import {createTSTest} from "./codeFactory";
import {runTSTest} from "./runner";
import {runTSInspector} from "./inspector";
import {ToolController} from "../../core";

export const TestSuite: ToolController = {
    name: "ts",
    title: "Smart Contract Test Suite",
    commands: [{
        name: "create",
        title: "Create Test",
        args: [{
            name: "folder",
            type: "folder",
        }],
        run: createTSTest,
    }, {
        name: "run",
        title: "Run Test",
        args: [{
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,
        },
        ],
        run: runTSTest,
    }, {
        name: "inspect",
        title: "Inspect Test Result",
        args: [{
            isArg: true,
            name: "file",
            type: "file",
            nameRegExp: /\.test\.py$/,

        }],
        run: runTSInspector,
    }],
};

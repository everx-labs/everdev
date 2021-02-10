import {tsCreateCommand} from "./create";
import {tsRunCommand} from "./run";
import {tsInspectCommand} from "./inspect";
import {ToolController} from "../../core";

export const TestSuite: ToolController = {
    name: "ts",
    title: "Smart Contract Test Suite",
    commands: [tsCreateCommand, tsRunCommand, tsInspectCommand],
};

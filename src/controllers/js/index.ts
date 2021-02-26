import {jsCreateCommand} from "./create";
import {ToolController} from "../../core";

export const JsApps: ToolController = {
    name: "js",
    title: "JS Apps",
    commands: [jsCreateCommand],
};

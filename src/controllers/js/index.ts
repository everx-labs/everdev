import {jsCreateCommand} from "./create";
import {ToolController} from "../../core";

export const JsApps: ToolController = {
    name: "js",
    title: "JS TON Applications",
    commands: [jsCreateCommand],
};

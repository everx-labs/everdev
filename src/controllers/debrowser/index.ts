import {ToolController} from "../../core";
import {versionCommand} from "./command/version";
import {startCommand} from "./command/start";
import {stopCommand} from "./command/stop";


export const DeBrowser: ToolController = {
    name: "debrowser",
    title: "ExtraTON Debot Browser",
    commands: [
        versionCommand,
        startCommand,
        stopCommand,
    ],
};

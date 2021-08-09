import { ToolController } from "../../core";
import {
    tonsectlUpdateCommand,
    tonsectlSetCommand,
    tonsectlVersionCommand,
    tonsectlStartCommand,
    tonsectlinfoCommand,
    tonsectlStopCommand,
    tonsectlResetCommand,

} from "./commands";

export const TONSECTL: ToolController = {
    name: "se-nd",
    title: "TONSECTL",
    commands: [
        tonsectlinfoCommand,
        tonsectlVersionCommand,
        tonsectlUpdateCommand,
        tonsectlSetCommand,
        tonsectlStartCommand,
        tonsectlStopCommand,
        tonsectlResetCommand,


    ],
};
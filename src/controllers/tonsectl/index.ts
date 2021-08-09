import { ToolController } from "../../core";
import {
    tonsectlUpdateCommand,
    tonsectlSetCommand,
    tonsectlVersionCommand,
    tonsectlApiCommand,
    tonsectlInitCommand,
    tonsectlStartCommand,
    tonsectlinfoCommand,
    tonsectlStopCommand,
    tonsectlResetCommand,

} from "./commands";

export const TONSECTL: ToolController = {
    name: "se-nd",
    title: "TONSECTL",
    commands: [
        tonsectlSetCommand,
        tonsectlUpdateCommand,
        tonsectlVersionCommand,
        tonsectlApiCommand,
        tonsectlInitCommand,
        tonsectlVersionCommand,
        tonsectlStartCommand,
        tonsectlinfoCommand,
        tonsectlStopCommand,
        tonsectlResetCommand,


    ],
};
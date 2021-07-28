import { ToolController } from "../../core";
import {
    tonsectlUpdateCommand,
    tonsectlSetCommand,
    tonsectlInstallCommand,
    tonsectlVersionCommand,
    tonsectlApiCommand,
    tonsectlInitCommand,
    tonsectlStartCommand,
    tonsectlStatusCommand,
    tonsectlStopCommand,
    tonsectlResetCommand,

} from "./commands";

export const TONSECTL: ToolController = {
    name: "tonsectl",
    title: "TONSECTL",
    commands: [
        tonsectlSetCommand,
        tonsectlUpdateCommand,
        tonsectlVersionCommand,
        tonsectlInstallCommand,
        tonsectlApiCommand,
        tonsectlInitCommand,
        tonsectlVersionCommand,
        tonsectlStartCommand,
        tonsectlStatusCommand,
        tonsectlStopCommand,
        tonsectlResetCommand,


    ],
};
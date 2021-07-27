import { ToolController } from "../../core";
import {
    tonsectlInstallCommand,
    tonsectlApiCommand,
    tonsectlInitCommand,
    tonsectlVersionCommand,
    tonsectlStartCommand,
    tonsectlStatusCommand,
    tonsectlStopCommand,
    tonsectlResetCommand,
} from "./commands";

export const TONSECTL: ToolController = {
    name: "tonsectl",
    title: "TONSECTL",
    commands: [
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
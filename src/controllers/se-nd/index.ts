import { ToolController } from "../../core";
import {
    seInfoCommand,
    seVersionCommand,
    seUpdateCommand,
    seSetCommand,
    seStartCommand,
    seStopCommand,
    seResetCommand,    
    seRestartCommand
} from "./commands";

export const SENonDocker: ToolController = {
    name: "se-nd",
    title: "TON OS SE Non-Docker",
    commands: [
        seInfoCommand,
        seVersionCommand,
        seUpdateCommand,
        seSetCommand,
        seStartCommand,
        seStopCommand,
        seResetCommand,
        seRestartCommand
    ],
};

import { ToolController } from "../../core";
import {
    seInfoCommand,
    seVersionCommand,
    seUpdateCommand,
    seSetCommand,
    seResetCommand,
    seStartCommand,
    seStopCommand
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
    ],
};

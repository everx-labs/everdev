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

export const SE: ToolController = {
    name: "se",
    title: "SE",
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

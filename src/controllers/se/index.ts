import { ToolController } from "../../core"
import {
    seInfoCommand,
    seVersionCommand,
    seUpdateCommand,
    seSetCommand,
    seResetCommand,
    seStartCommand,
    seStopCommand,
    seDeleteCommand,
} from "./commands"

export const SE: ToolController = {
    name: "se",
    title: "EVER OS SE",
    commands: [
        seInfoCommand,
        seVersionCommand,
        seUpdateCommand,
        seSetCommand,
        seStartCommand,
        seStopCommand,
        seResetCommand,
        seDeleteCommand,
    ],
}

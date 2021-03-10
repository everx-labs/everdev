import { jsCreateCommand } from "./create";
import { jsInstallCommand } from "./installDemo";
import { jsUninstallCommand } from "./uninstallDemo";
import { ToolController } from "../../core";

export const JsApps: ToolController = {
    name: "js",
    title: "JS Apps",
    commands: [jsCreateCommand, jsInstallCommand, jsUninstallCommand],
};

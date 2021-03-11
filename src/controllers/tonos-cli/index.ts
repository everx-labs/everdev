import { ToolController } from "../../core";
import { tonosInstallCommand, tonosSetCommand, tonosVersionCommand, tonosUpdateCommand } from "./commands";
export const TONOS: ToolController = {
    name: "tonos-cli",
    title: "TON OS CLI",
    commands: [tonosInstallCommand, tonosSetCommand, tonosVersionCommand, tonosUpdateCommand],
};

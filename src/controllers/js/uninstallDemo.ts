import { Command, Terminal } from "../../core";
import { getVariants, demoUninstall } from "./installer";

export const jsUninstallCommand: Command = {
    name: "uninstall",
    title: "Uninstall TON demo App",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
            getVariants,
        },
        {
            name: "folder",
            type: "folder",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        const ok: boolean = await demoUninstall(terminal, args.name, args.folder);

        if (ok) {
            terminal.log("Application uninstalled");
        } else {
            terminal.log("Application is not installed");
        }
    },
};

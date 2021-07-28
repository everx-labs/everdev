import { getAvailableVersions } from "../installer";
import { Command, Terminal } from "../../../core";

export const versionCommand: Command = {
    name: "version",
    title: "Show DeBrowser Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(`Available Versions: ${(await getAvailableVersions()).join(", ")}`);
    },
};

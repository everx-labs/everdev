import { getAvailableVersions } from "../installer"
import { Command, Terminal } from "../../../core"

export const versionCommand: Command = {
    name: "version",
    title: "Show DeBrowser Versions",
    async run(terminal: Terminal): Promise<void> {
        terminal.log(
            `Available Versions: ${(await getAvailableVersions()).join(", ")}`,
        )
    },
}

import path from "path";
import fs from "fs-extra";
import { Terminal, tondevHome } from "../../core";
import { getVersionList, downloadFromBinaries, executableName, formatTable } from "../../core/utils";

function tonosHome() {
    return path.resolve(tondevHome(), "tonos-cli");
}

export function cliPath() {
    return path.resolve(tonosHome(), executableName("tonos-cli"));
}

export async function installVersion(terminal: Terminal, version?: string) {
    if (version === undefined || version.toLocaleLowerCase() === "latest") {
        const list = await getVersionList("tonos-cli");
        version = list[list.length - 1]; // no sorting, just getting the last one
    }
    terminal.log(`Installing TON OS CLI, ver: ${version}`);
    const ver_ = version.replace(/\./g, "_"); // 0.8.1 -> 0_8_1

    await downloadFromBinaries(terminal, cliPath(), `tonos-cli-${ver_}-{p}`, {
        executable: true,
        globally: true,
        version,
        ext: "zip",
    });
    terminal.log("TON OS CLI has been installed.");
}
export async function tonosEnsureInstalled(terminal: Terminal, ver?: string) {
    if (!fs.existsSync(cliPath())) {
        return installVersion(terminal, ver);
    }
}

export async function tonosInfo(terminal: Terminal): Promise<void> {
    const version = {
        current: await fs
            .readFile(`${tonosHome()}/package.json`, { encoding: "utf-8" })
            .then(content => content.match(/version": "([0-9.]+)"/)?.[1])
            .catch(() => "Not found"),
        available: await getVersionList("tonos-cli"),
    };
    terminal.log(
        formatTable(
            [
                ["Version", "Available"],
                [version.current, version.available.join(", ")],
            ],
            { headerSeparator: true }
        )
    );
}

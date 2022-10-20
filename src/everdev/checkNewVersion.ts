import * as path from "path"

import { everdevHome } from "../core/index"
import {
    compareVersions,
    touch,
    writeTextFile,
    readTextFileSyncOnce,
    getLatestFromNmp,
} from "../core/utils"

const LAST_RUN_FILE = ".lastrun"
const LATEST_VERSION_FILE = ".latest"

/*
 * Checks if this is the first run in the last 24 hours
 * and touches the LAST_RUN_FILE
 */
function isFirstRun(): boolean {
    const lastrunFile = path.resolve(everdevHome(), LAST_RUN_FILE)
    const lastrunTS: Date | undefined = touch(lastrunFile)
    return !lastrunTS || lastrunTS.getTime() < Date.now() - 24 * 3600 * 1000
}

export async function createLatestVerFile(pkgName: string): Promise<void> {
    if (isFirstRun()) {
        const version: string = await getLatestFromNmp(pkgName)
        writeTextFile(path.resolve(everdevHome(), LATEST_VERSION_FILE), version)
    }
}

export function getUpdateIsAvailableMsg(
    pkgName: string,
    pkgVer: string,
): string {
    const latestVer: string = readTextFileSyncOnce(
        path.resolve(everdevHome(), LATEST_VERSION_FILE),
    )
    if (latestVer && compareVersions(latestVer, pkgVer) > 0) {
        const sep = "********************************************"
        return [
            "",
            sep,
            `A new version of ${pkgName} ${latestVer} is available!`,
            sep,
            `Installed version is ${pkgVer}`,
            `Update it with "npm update -g ${pkgName}", or use precompiled binaries:`,
            `https://docs.everos.dev/everdev/#install`,
            "",
        ].join("\n")
    } else {
        return ""
    }
}

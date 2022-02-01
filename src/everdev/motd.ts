import * as path from "path";

import { everdevHome } from "../core/index";
import { run, StringTerminal, compareVersions, touch} from '../core/utils'

/*
 * Checks if this is the first run in the last 24 hours
 * and touches the `.lastrun` file
 */
function isFirstRun(): boolean {
    const lastrunFile = path.resolve(everdevHome(), ".lastrun");
    const lastrunTS: Date | undefined = touch(lastrunFile);
    return !lastrunTS || lastrunTS.getTime() < Date.now() - 24 * 3600 * 1000;
}

export async function motd(pkgName: string, pkgVer: string): Promise<string> {
    return isFirstRun()
        ? run('npm', ['view', pkgName, 'dist-tags.latest'], {}, new StringTerminal()).then(
              (result: string) => {
                  const sep = '********************************************'
                  const thatVer = result.trim();
                  return compareVersions(thatVer, pkgVer) > 0
                      ? [
                            '',
                            sep,
                            'MESSAGE OF THE DAY',
                            sep,
                            `A new version of ${pkgName} ${thatVer} is available!`,
                            `Installed version is ${pkgVer}`,
                            `Update it with "npm update ${pkgName}"`,
                            '',
                        ].join('\n')
                      : ''
              },
          )
        : ''
}

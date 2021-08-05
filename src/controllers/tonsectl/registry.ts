import path from "path";
import fs from "fs";

import {
    Terminal,
    // Terminal,
    tondevHome,
} from "../../core";
import https from "https";
import {

// //     compareVersionsDescending,
//     httpsGetJson,
    writeJsonFile,
} from "../../core/utils";


const TOOL_FOLDER_NAME = "tonsectl";



function tonsectlHome() {
    return path.resolve(tondevHome(), TOOL_FOLDER_NAME);
}


export type tonsectlRegistryItem = {
    /**
     * Instance name
     */
    version: SESource,
}


export enum SESourceType {
    TONSECTL_VERSION = "tonosectl-version",
}

export type SESource = {
    type: SESourceType.TONSECTL_VERSION,
    version: string,
};

export function seSourceVersion(version: string): SESource {
    return {
        type: SESourceType.TONSECTL_VERSION,
        version,
    };
}

function registryPath(): string {
    return path.resolve(tonsectlHome(), "info.json");
}
function registryPathReleases(): string {
    return path.resolve(tonsectlHome(), "releases.json");
}


export class TONSECTLRegistry {
    async getVersions(): Promise<{}> {
        var versions_list = [];
        const url = `https://api.github.com/repos/INTONNATION/tonos-se-installers/releases`;
        await this.httpsGetJsonGithub(url)
        const response = JSON.parse(fs.readFileSync(registryPathReleases(), "utf8"));

        interface release_name {
            name: string
        }

        let obj: { response: release_name[] } = response;
        for (var i = 0; i < obj.response.length; i++) {
            var singleRelease = obj.response[i];
            var name = singleRelease.name;
            versions_list.push(name);
        }
        return versions_list.join("| |");
    }

    private async httpsGetJsonGithub(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const tryUrl = (url: string) => {
                var options = {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'user-agent': 'node.js'
                    }
                };
                https
                    .get(url, options, function (res) {
                        let body = "";

                        res.on("data", function (chunk) {
                            body += chunk;
                        });

                        res.on("end", function () {
                            const response = JSON.parse(body);
                            writeJsonFile(registryPathReleases(), {response})
                            resolve(body);
                        });
                    })
                    .on("error", error => {
                        reject(error);
                    });
            };
            tryUrl(url);
        });
    }

    async getVersion(): Promise<string[]> {
        const version = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
        return version.version;
    }

    async setupConfig(terminal: Terminal, version: string): Promise<void> {
        try {
            writeJsonFile(registryPath(), {
                version,
            });
        } catch (err) {
            terminal.writeError(err);
        }
    }

    async getLatestVersion(): Promise<{}> {
        const url = `https://api.github.com/repos/INTONNATION/tonos-se-installers/releases`;
        await this.httpsGetJsonGithub(url)
        const response = JSON.parse(fs.readFileSync(registryPathReleases(), "utf8"));
        interface latest {
            name: string
        }
        let obj: { response: latest[] } = response;
        const latest_release = obj.response[0].name
        return latest_release
    }
}

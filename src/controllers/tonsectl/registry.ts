import path from "path";
import fs from "fs";
import os from "os";

import {
    Terminal,
    tondevHome,
} from "../../core";
import https from "https";
import {
    writeJsonFile,
} from "../../core/utils";
import request from "request";


const TOOL_FOLDER_NAME = "tonsectl";
const TOOL_BiNARY_NAME = "tonsectl";
const DEFAULT_PORT = "80";

export function tonsectlHome() {
    return path.resolve(tondevHome(), TOOL_FOLDER_NAME);
}
export function tonsectlHomeBinary() {
    return path.resolve(tonsectlHome(), TOOL_BiNARY_NAME,);
}

export async function downloadBinaryFromGithub(terminal: Terminal, srcUrl: string, dstPath: string) {
    terminal.write(`Downloading from ${srcUrl}`);
    if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath, { recursive: true });
    }
    terminal.write("\n");
    const file = fs.createWriteStream(tonsectlHomeBinary());
    await new Promise((resolve, reject) => {
        request({
            uri: srcUrl,
        })
            .pipe(file)
            .on('finish', async () => {
                console.log(`The tonsectl is finished downloading.`);
                resolve(file);
            })
            .on('error', (error: any) => {
                reject(error);
            });
    })
        .catch((error) => {
            console.log(`Something happened: ${error}`);
        });
    if (os.platform() !== "win32") {
            fs.readdirSync(dstPath)
                .map(filename => path.resolve(dstPath, filename))
                .filter(filename => !fs.lstatSync(filename).isDirectory())
                .forEach(filename => fs.chmodSync(filename, 0o755));
        } else {
            fs.chmodSync(dstPath, 0o755);
        }
        await new Promise(resolve => setTimeout(resolve, 100));

};

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

    async getVersion(terminal: Terminal): Promise<string[]> {
        if (!fs.existsSync(tonsectlHome())) {
            fs.mkdirSync(tonsectlHome(), { recursive: true });
        }
        if (!fs.existsSync(registryPath())) {
            const filecontent =""
            fs.writeFile(registryPath(),filecontent,(err) => {
                if (err) throw err;
            });
            const version = await this.getLatestVersion();
            await this.setupConfig(terminal,String(version))
        }
        const version = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
        return version.version;
    }

    async getPort(): Promise<string[]> {
        const version = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
        return version.port;
    }


    async setupConfig(terminal: Terminal, version: string, port = DEFAULT_PORT): Promise<void> {
        try {
            writeJsonFile(registryPath(), {
                version,
                port,
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


    async getOS() {
        const p = os.platform();
        if (p === "linux") {
            return "linux"
        } else if (p === "darwin") {
            return "darwin"}
        else {
            return "windows.exe"}
        }
}

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import {spawn, SpawnOptionsWithoutStdio} from "child_process";
import * as http from "http";
import * as zlib from "zlib";
import {Terminal} from "./index";

export function executableName(name: string): string {
    return `${name}${os.platform() === "win32" ? ".exe" : ""}`;
}

export function changeExt(path: string, newExt: string): string {
    return path.replace(/\.[^/.]+$/, newExt);
}

function downloadAndGunzip(dest: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = http.get(url, response => {
            if (response.statusCode !== 200) {
                reject({
                    message: `Download from ${url} failed with ${response.statusCode}: ${response.statusMessage}`,
                });
                return;
            }
            let file: fs.WriteStream | null = fs.createWriteStream(dest, {flags: "w"});
            let opened = false;
            const failed = (err: Error) => {
                if (file) {
                    file.close();
                    file = null;

                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };

            const unzip = zlib.createGunzip();
            unzip.pipe(file);


            response.pipe(unzip);


            request.on("error", err => {
                failed(err);
            });

            file.on("finish", () => {
                if (opened && file) {
                    resolve();
                }
            });

            file.on("open", () => {
                opened = true;
            });

            file.on("error", err => {
                if ((err as any).code === "EEXIST" && file) {
                    file.close();
                    reject("File already exists");
                } else {
                    failed(err);
                }
            });
        });
    });

}

export async function downloadFromBinaries(
    terminal: Terminal,
    dstPath: string,
    src: string,
    options?: { executable?: boolean },
) {
    const srcUrl = `http://sdkbinaries.tonlabs.io/${src}.gz`;
    terminal.write(`Downloading from ${srcUrl} to ${dstPath} ...`);
    const dstDir = path.dirname(dstPath);
    if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, {recursive: true});
    }
    await downloadAndGunzip(dstPath, srcUrl);
    if (options?.executable && os.platform() !== "win32") {
        fs.chmodSync(dstPath, 0o755);
    }
    terminal.write("\n");
}

export function run(name: string, args: string[], options: SpawnOptionsWithoutStdio, log: (message: any) => void): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const isWindows = os.platform() === "win32";
            const spawned = isWindows
                ? spawn("cmd.exe", ["/c", name].concat(args), {
                    env: process.env,
                    ...options,
                })
                : spawn(name, args, {
                    env: process.env,
                    ...options,
                });
            const errors: string[] = [];
            const output: string[] = [];

            spawned.stdout.on("data", function (data) {
                const text = data.toString();
                output.push(text);
                log(text);
            });

            spawned.stderr.on("data", (data) => {
                errors.push(data);
                process.stderr.write(data.toString());
            });

            spawned.on("error", (err) => {
                reject(err);
            });

            spawned.on("close", (code) => {
                if (code === 0) {
                    resolve(output.join(""));
                } else {
                    reject(errors.join(""));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function uniqueFilePath(folderPath: string, namePattern: string): string {
    let index = 1;
    while (true) {
        const filePath = path.resolve(folderPath, namePattern.replace("{}", index.toString()));
        if (!fs.existsSync(filePath)) {
            return filePath;
        }
    }
}

export const consoleTerminal: Terminal = {
    write(text: string) {
        process.stdout.write(text);
    },
    log(...args) {
        console.log(...args);
    },
};

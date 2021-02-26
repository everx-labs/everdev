import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import * as http from "http";
import * as https from "https";
import * as zlib from "zlib";
import { Terminal } from "./index";

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
            let file: fs.WriteStream | null = fs.createWriteStream(dest, { flags: "w" });
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
    src = src.replace("{p}", os.platform());
    const srcUrl = `http://sdkbinaries.tonlabs.io/${src}.gz`;
    terminal.write(`Downloading from ${srcUrl} to ${dstPath} ...`);
    const dstDir = path.dirname(dstPath);
    if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
    }
    await downloadAndGunzip(dstPath, srcUrl);
    if (options?.executable && os.platform() !== "win32") {
        fs.chmodSync(dstPath, 0o755);
    }
    terminal.write("\n");
}

export function run(name: string, args: string[], options: SpawnOptionsWithoutStdio, terminal: Terminal): Promise<string> {
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
                terminal.log(text);
            });

            spawned.stderr.on("data", (data) => {
                const text = data.toString();
                errors.push(text);
                terminal.writeError(text);
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
    let index = 0;
    while (true) {
        const filePath = path.resolve(folderPath, namePattern.replace("{}", index === 0 ? "" : index.toString()));
        if (!fs.existsSync(filePath)) {
            return filePath;
        }
        index += 1;
    }
}

export const consoleTerminal: Terminal = {
    write(text: string) {
        process.stdout.write(text);
    },
    writeError(text: string) {
        process.stderr.write(text);
    },
    log(...args) {
        console.log(...args);
    },
};

export const nullTerminal: Terminal = {
    write(_text: string) {
    },
    writeError(_text: string) {
    },
    log(..._args) {
    },
};

export function stringTerminal(): Terminal & { output: string, error: string } {
    return {
        output: "",
        error: "",
        write(text: string) {
            this.output += text;
        },
        writeError(text: string) {
            this.error += text;
        },
        log(...args: any[]) {
            this.write(`${args.map(x => `${x}`).join(" ")}\n`);
        },
    };
}

export function versionToNumber(s: string): number {
    if (s.toLowerCase() === "latest") {
        return 1_000_000_000;
    }
    const parts = `${s || ''}`.split('.').map(x => Number.parseInt(x)).slice(0, 3);
    while (parts.length < 3) {
        parts.push(0);
    }
    return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
}

let _progressLine: string = '';

export function progressLine(terminal: Terminal, line: string) {
    terminal.write(`\r${line}`);
    const extra = _progressLine.length - line.length;
    if (extra > 0) {
        terminal.write(' '.repeat(extra) + '\b'.repeat(extra));
    }
    _progressLine = line;
}

export function progress(terminal: Terminal, info: string) {
    progressLine(terminal, `${info}...`);
}

export function progressDone(terminal: Terminal) {
    terminal.log(' ✓');
    _progressLine = '';
}


export function httpsGetJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const tryUrl = (url: string) => {
            https.get(url, function (res) {
                let body = '';

                res.on('data', function (chunk) {
                    body += chunk;
                });

                res.on('end', function () {
                    if (res.statusCode === 301) {
                        const redirectUrl = res.headers['location'];
                        if (redirectUrl) {
                            tryUrl(redirectUrl);
                        } else {
                            reject(new Error("Redirect response has no `location` header."));
                        }
                        return;
                    }
                    const response = JSON.parse(body);
                    resolve(response);
                });
            }).on('error', (error) => {
                reject(error);
            });
        };
        tryUrl(url);
    })
}

function toIdentifier(s: string): string {
    let identifier = "";
    for (let i = 0; i < s.length; i += 1) {
        const c = s[i];
        const isLetter = c.toLowerCase() !== c.toUpperCase();
        const isDigit = !isLetter && "0123456789".includes(c);
        if (isLetter || isDigit) {
            identifier += c;
        }
    }
    return identifier;
}

export function userIdentifier(): string {
    return toIdentifier(os.userInfo().username).toLowerCase();
}

function toString(value: any): string {
    return value === null || value === undefined ? "" : value.toString();
}

export function formatTable(rows: any[][], options?: { headerSeparator?: boolean }): string {
    const widths: number[] = [];
    const updateWidth = (value: any, i: number) => {
        const width = toString(value).length;
        while (widths.length <= i) {
            widths.push(0);
        }
        widths[i] = Math.max(widths[i], width);
    };
    rows.forEach(x => x.forEach(updateWidth));
    const formatValue = (value: any, i: number) => toString(value).padEnd(widths[i]);
    const formatRow = (row: any[]) => row.map(formatValue).join("  ").trimEnd();
    const lines = rows.map(formatRow);
    if (options?.headerSeparator) {
        const separator = formatRow(widths.map(x => "-".repeat(x)));
        lines.splice(1, 0, separator);
    }
    return lines.join("\n");
}

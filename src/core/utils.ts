import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import {
    spawn,
    SpawnOptionsWithoutStdio,
} from "child_process";
import * as https from "https";
import * as zlib from "zlib";
import * as unzip from "unzip-stream";
import request from "request";
import { ContractPackage } from "@tonclient/appkit";
import mv from 'mv'
import { Terminal, everdevHome } from './index'

/*
 * Touches file and returns its previous modification time
 */
export function touch(file: string): Date | undefined {
    let mtime;
    try {
        mtime = fs.statSync(file).mtime;
    } catch (_) {}
    const time = new Date();
    try {
        fs.utimesSync(file, time, time);
    } catch (err) {
        fs.closeSync(fs.openSync(file, "w"));
    }
    return mtime;
}


export function executableName(name: string): string {
    return `${name}${os.platform() === "win32" ? ".exe" : ""}`;
}

export function changeExt(path: string, newExt: string): string {
    return path.replace(/\.[^/.]+$/, newExt);
}

export function ellipsisString(xs: string[]): string {
    return (xs.length < 10 ? xs : [...xs.slice(0, 10), '...']).join(', ')
}

export async function loadBinaryVersions(name: string): Promise<string[]> {
    const info = await httpsGetJson(`https://binaries.tonlabs.io/${name}.json`);
    const versions = info[name].sort(compareVersions).reverse();
    return versions
}

export function formatTokens(nanoTokens: string | number | bigint): string {
    const token = BigInt(1000000000);
    const bigNano = BigInt(nanoTokens);
    const tokens = Number(bigNano / token) + Number(bigNano % token) / Number(token);
    const tokensString = tokens < 1 ? tokens.toString() : `≈ ${Math.round(tokens)}`;
    return `${tokensString} tokens (${bigNano} nano)`;
}

export function writeTextFile(p: string, s: string) {
    const folderPath = path.dirname(p);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(p, s);
}

export function writeJsonFile(p: string, v: unknown) {
    writeTextFile(p, JSON.stringify(v, undefined, "    "));
}

async function installGlobally(dstPath: string, version: string, terminal: Terminal): Promise<void> {
    const binDir = path.dirname(dstPath);
    const [name, ext] = path.basename(dstPath).split(".");
    try {
        writeJsonFile(`${binDir}/package.json`, {
            name: name, // ex: tonos-cli
            version,
            bin: `./${name}${ext ? "." + ext : ""}`,
        });
        await run("npm", ["install", "-g"], { cwd: binDir }, terminal);
    } catch (err: any) {
        terminal.writeError(err);
        throw Error(`An error occurred while trying to install ${name} globally.
Make sure you can execute 'npm i <package> -g' without using sudo and try again`,
        );
    }
}
/*
 * This function downloads and unzip files into tmp/subdirectory,
 * then moves them into dstDir and removes tmp/subdirectory
 */
function downloadAndUnzip(dstDir: string, url: string, terminal: Terminal): Promise<void> {
    const tmpDir = path.resolve(everdevHome(), 'tmp', Date.now().toString(16));
    return new Promise<void>((resolve, reject) => {
        request(url)
            .on("data", _ => {
                terminal.write(".");
            })
            .on("error", reject) // http protocol errors
            .pipe(
                unzip
                    .Extract({ path: tmpDir })
                    .on("error", reject) // unzip errors
                    .on("close", () => {
                        fs.readdir(tmpDir, (err, files) => {
                            if (err) {
                                reject(err);
                            } else {
                                // Move all unzipped files from temp to destination
                                Promise.all(
                                    files.map((file) =>
                                        mvFileAsync(
                                            path.resolve(tmpDir, file),
                                            path.resolve(dstDir, file),
                                        ),
                                    ),
                                )
                                    .then(()=> resolve())
                                    .catch(reject)
                            }
                        })
                    }),
            )
    }).finally(() => {
       fs.rmdir(tmpDir, () => {}); // Remove temp directory
    })
}

/*
 * This function is a replacement for `fs.rename`, which throws the error: EXDEV: cross-device link not permitted
 */
export function mvFileAsync(from: string, to: string): Promise<void> {
    return new Promise((res, rej) => {
        mv(from, to, { mkdirp: true, clobber: true }, (err: any) => {
            err ? rej(err) : res();
        })
    })
}

export async function downloadFromGithub(terminal: Terminal, srcUrl: string, dstPath: string) {
    terminal.write(`Downloading from ${srcUrl}`);
    if (!fs.existsSync(dstPath)) {
        fs.mkdirSync(dstPath, { recursive: true });
    }
    await downloadAndUnzip(dstPath, srcUrl, terminal);
    terminal.write("\n");
}

function downloadAndGunzip(dest: string, url: string, terminal: Terminal): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(
                    new Error(
                        `Download from ${url} failed with ${response.statusCode}: ${response.statusMessage}`,
                    ),
                );
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

            response.on("data", _ => {
                terminal.write(".");
            });

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
    options?: {
        executable?: boolean,
        adjustedPath?: string,
        globally?: boolean,
        version?: string,
    },
) {
    src = src.replace("{p}", os.platform());
    const srcExt = path.extname(src).toLowerCase();
    const srcUrl = `https://binaries.tonlabs.io/${src}`;
    terminal.write(`Downloading from ${srcUrl}`);
    const dstDir = path.dirname(dstPath);
    if (!fs.existsSync(dstDir)) {
        fs.mkdirSync(dstDir, { recursive: true });
    }
    if (srcExt === ".zip") {
        await downloadAndUnzip(dstDir, srcUrl, terminal);
    } else if (srcExt === ".gz") {
        await downloadAndGunzip(dstPath, srcUrl, terminal);
        if (path.extname(dstPath) === ".tar") {
            await run("tar", ["xvf", dstPath], { cwd: path.dirname(dstPath) }, terminal);
            fs.unlink(dstPath, () => {
            });
        }
    } else {
        throw Error(`Unexpected binary file extension: ${srcExt}`);
    }
    if (options?.executable && os.platform() !== "win32") {
        if (options?.adjustedPath) {
            const dir = path.dirname(options.adjustedPath);
            fs.readdirSync(dir)
                .map(filename => path.resolve(dir, filename))
                .filter(filename => !fs.lstatSync(filename).isDirectory())
                .forEach(filename => fs.chmodSync(filename, 0o755));
        } else {
            fs.chmodSync(dstPath, 0o755);
        }
        // Without pause on Fedora 32 Linux always leads to an error: spawn ETXTBSY
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (options?.globally) {
        if (!options.version) {
            throw Error("Version required to install package");
        }
        await installGlobally(dstPath, options.version, terminal).catch(err => {
            fs.unlink(dstPath, () => {
            });
            throw err;
        });
    }
    terminal.write("\n");
}

export function run(
    name: string,
    args: string[],
    options: SpawnOptionsWithoutStdio,
    terminal: Terminal,
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const { cwd } = options;
            if (cwd && !fs.existsSync(cwd)) {
                throw Error(`Directory not exists: ${cwd}`);
            }
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
            const output: string[] = [];

            spawned.stdout.on("data", function (data) {
                const text = data.toString();
                output.push(text);
                terminal.log(text);
            });

            spawned.stderr.on("data", data => {
                const text = data.toString();
                terminal.writeError(text);
            });

            spawned.on("error", err => {
                reject(err);
            });

            spawned.on("close", code => {
                if (code === 0) {
                    resolve(output.join(""));
                } else {
                    reject(`${name} failed`);
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
        const filePath = path.resolve(
            folderPath,
            namePattern.replace("{}", index === 0 ? "" : index.toString()),
        );
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

export class StringTerminal implements Terminal {
    stdout: string = "";
    stderr: string = "";

    log(...args: any[]): void {
        this.stdout += args.map(x => `${x}`).join(" ");
        this.stdout += "\r\n";
    }

    write(text: string): void {
        this.stdout += text;
    }

    writeError(text: string): void {
        this.stderr += text;
    }

}

export function versionToNumber(s: string): number {
    if (s.toLowerCase() === "latest") {
        return 1_000_000_000;
    }
    const parts = `${s || ""}`
        .split(".")
        .map(x => Number.parseInt(x))
        .slice(0, 3);
    while (parts.length < 3) {
        parts.push(0);
    }
    return parts[0] * 1000000 + parts[1] * 1000 + parts[2];
}

export function compareVersions(a: string, b: string): number {
    const an = versionToNumber(a);
    const bn = versionToNumber(b);
    return an < bn ? -1 : (an === bn ? 0 : 1);
}

export function compareVersionsDescending(a: string, b: string): number {
    const an = versionToNumber(a);
    const bn = versionToNumber(b);
    return an > bn ? -1 : (an === bn ? 0 : 1);
}

let _progressLine: string = "";

export function progressLine(terminal: Terminal, line: string) {
    terminal.write(`\r${line}`);
    const extra = _progressLine.length - line.length;
    if (extra > 0) {
        terminal.write(" ".repeat(extra) + "\b".repeat(extra));
    }
    _progressLine = line;
}

export function progress(terminal: Terminal, info: string) {
    progressLine(terminal, `${info}...`);
}

export function progressDone(terminal: Terminal) {
    terminal.log(" ✓");
    _progressLine = "";
}

export function httpsGetJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const tryUrl = (url: string) => {
            https
                .get(url, function (res) {
                    let body = "";

                    res.on("data", function (chunk) {
                        body += chunk;
                    });

                    res.on("end", function () {
                        if (res.statusCode === 301) {
                            const redirectUrl = res.headers["location"];
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
                })
                .on("error", error => {
                    reject(error);
                });
        };
        tryUrl(url);
    });
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

export function formatTable(table: any[][], options?: {
    headerSeparator?: boolean,
    multilineSeparator?: boolean,
    multilineIndent?: string,
}): string {
    const headerSeparator = options?.headerSeparator ?? false;
    const multilineSeparator = options?.multilineSeparator ?? false;
    const multilineIndent = options?.multilineIndent ?? "  ";
    const rows: string[][][] = table.map(row => row.map(cell => toString(cell).split("\n")));
    const widths: number[] = [];
    const isEmpty: boolean[] = [];
    const updateWidth = (cell: string[], i: number, rowIndex: number) => {
        while (widths.length <= i) {
            widths.push(0);
            isEmpty.push(true);
        }
        for (const line of cell) {
            const width = line.length;
            widths[i] = Math.max(widths[i], width);
            const isHeader = headerSeparator && rowIndex === 0;
            if (!isHeader && (width > 0)) {
                isEmpty[i] = false;
            }
        }
    };
    rows.forEach((row, ri) => row.forEach((cell, vi) => updateWidth(cell, vi, ri)));
    const formatValue = (value: string, ci: number) => value.padEnd(widths[ci]);
    const formatRowLine = (rowLine: string[]) => rowLine.map(formatValue).filter((_, i) => !isEmpty[i]).join("  ").trimEnd();
    const formatCellLine = (cell: string[], line: number) => {
        if (line >= cell.length) {
            return "";
        }
        return `${line > 0 ? multilineIndent : ""}${cell[line]}`;
    };
    const lines: string[] = [];
    const hasMultilines = rows.find(r => r.find(c => c.length > 0)) !== undefined;
    const firstDataRowIndex = headerSeparator ? 1 : 0;

    rows.forEach((row, rowIndex) => {
        for (let line = 0; row.find(x => line < x.length); line += 1) {
            if (multilineSeparator && hasMultilines && rowIndex > firstDataRowIndex && line === 0) {
                lines.push("");
            }
            lines.push(formatRowLine(row.map(x => formatCellLine(x, line))));
        }
    });
    if (headerSeparator) {
        const separator = formatRowLine(widths.map(x => "-".repeat(x)));
        lines.splice(1, 0, separator);
    }
    return lines.join("\n");
}

export function parseNumber(s: string | undefined | null): number | undefined {
    if (s === null || s === undefined || s === "") {
        return undefined;
    }
    const n = Number(s);
    if (Number.isNaN(n)) {
        throw Error(`Invalid number: ${s}`);
    }
    return n;
}

export function parseNanoTokens(s: string | undefined | null): number | undefined {
    if (s === null || s === undefined || s === "") {
        return undefined;
    }
    const nanos = s.endsWith("T") || s.endsWith("t")
        ? `${s.slice(0, s.length - 1)}000000000`
        : s;
    const nanoTokens = Number(nanos);
    if (Number.isNaN(nanoTokens)) {
        throw Error(`Invalid token value: ${s}`);
    }
    return nanoTokens;
}

export function reduceBase64String(s: string | undefined): string | undefined {
    if (s === undefined) {
        return undefined;
    }
    if (s.length < 80) {
        return s;
    }
    const bytes = Buffer.from(s, "base64");
    return `${s.slice(0, 30)} ... ${s.slice(-30)} (${bytes.length} bytes)`;
}

export function breakWords(s: string, maxLen: number = 80): string {
    let result = "";
    for (const sourceLine of s.split("\n")) {
        const words = sourceLine.split(" ");
        let line = "";
        words.forEach((w) => {
            if (line.length + w.length > maxLen) {
                if (result !== "") {
                    result += "\n";
                }
                result += line;
                line = "";
            }
            if (line !== "") {
                line += " ";
            }
            line += w;
        });
        if (line !== "") {
            if (result !== "") {
                result += "\n";
            }
            result += line;
        }
    }
    return result;
}

function findExisting(paths: string[]): string | undefined {
    return paths.find(x => fs.existsSync(x));
}

export type ResolvedContractPackage = {
    package: ContractPackage,
    abiPath: string,
    tvcPath?: string,
};

export function resolveContract(filePath: string): ResolvedContractPackage {
    filePath = filePath.trim();
    const lowered = filePath.toLowerCase();
    let basePath;
    if (lowered.endsWith(".tvc") || lowered.endsWith(".abi") || lowered.endsWith(".sol")) {
        basePath = filePath.slice(0, -4);
    } else if (lowered.endsWith(".abi.json")) {
        basePath = filePath.slice(0, -9);
    } else {
        basePath = filePath;
    }
    const tvcPath = findExisting([`${basePath}.tvc`]);
    const abiPath = findExisting([`${basePath}.abi.json`, `${basePath}.abi`]) ?? "";
    const tvc = tvcPath ? fs.readFileSync(tvcPath).toString("base64") : undefined;
    const abi = abiPath !== "" ? JSON.parse(fs.readFileSync(abiPath, "utf8")) : undefined;
    if (!abi) {
        throw new Error("ABI file missing.");
    }
    return {
        package: {
            abi,
            tvc,
        },
        abiPath,
        tvcPath,
    };
}

export function isHex(s: string): boolean {
    for (let i = 0; i < s.length; i += 1) {
        if (!"0123456789ABCDEFabcdef".includes(s[i])) {
            return false;
        }
    }
    return true;
}

export function resolvePath(s: string): string {
    return s.startsWith("~/")
        ? `${os.homedir()}${s.substr(1)}`
        : path.resolve(process.cwd(), s);
}

export function readTextFileSyncOnce(filename: string): string {
    try {
        if (fs.existsSync(filename)) {
            const data = fs.readFileSync(filename, 'utf8');
            fs.unlinkSync(filename);
            return data;
        } else {
            return '';
        }
    } catch (err) {
        return '';
    }
}

export async function getLatestFromNmp(pkgName: string): Promise<string> {
    const latestVer: string = await run(
        'npm',
        ['view', pkgName, 'dist-tags.latest'],
        {},
        new StringTerminal(),
    )
    return latestVer.trim();
}


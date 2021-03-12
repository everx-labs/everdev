import path from "path";
import fs from "fs-extra";
import {
    Terminal,
    tondevHome,
} from "../../core";
import {
    downloadFromGithub,
    httpsGetJson,
} from "../../core/utils";

const demoBranch = "master";
const demoInfoURL = `https://raw.githubusercontent.com/tonlabs/sdk-samples/${demoBranch}/demo.json`;
const demoArchiveURL = `https://github.com/tonlabs/sdk-samples/archive/${demoBranch}.zip`;
const demoFolder = `sdk-samples-${demoBranch}`;

function jsHome() {
    return path.resolve(tondevHome(), "js");
}

function demoHome() {
    return path.resolve(jsHome(), demoFolder);
}

export function getInfo(): DemoInfo {
    return JSON.parse(fs.readFileSync(path.resolve(demoHome(), "demo.json")).toString());
}

export async function loadInfo(): Promise<DemoInfo> {
    return httpsGetJson(demoInfoURL);
}

export async function ensureDemoInstalled(terminal: Terminal) {
    if (fs.pathExistsSync(demoHome())) {
        const info = getInfo();
        const remoteInfo = await loadInfo();
        if (info.version === remoteInfo.version) {
            return;
        }
        fs.rmdirSync(demoHome(), {recursive: true});
    }
    if (!fs.pathExistsSync(jsHome())) {
        fs.mkdirSync(jsHome(), {recursive: true});
    }
    terminal.log("Downloading demo repository...");
    await downloadFromGithub(terminal, demoArchiveURL, jsHome());
}

export type DemoApp = {
    name: string,
    path: string,
    description: string,
}

export type DemoInfo = {
    version: string,
    applications: DemoApp[],
}

export async function downloadDemo(terminal: Terminal, name: string, folder: string) {
    await ensureDemoInstalled(terminal);
    const info = getInfo();
    const app = info.applications.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!app) {
        throw new Error(`Demo "${name} not found.`);
    }
    const dstPath = path.resolve(folder, name);
    if (fs.existsSync(dstPath)) {
        terminal.log(`This demo already downloaded in: ${dstPath}`);
        return;
    }
    fs.copySync(path.resolve(demoHome(), app.path), dstPath);
    terminal.log(`
Demo ${name} is downloaded into ${dstPath}
Check README.md or run application:
$ cd ${path.relative(".", dstPath)}
$ npm i
$ npm start
`,
    );

}

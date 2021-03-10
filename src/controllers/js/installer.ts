import path from "path";
import fs from "fs-extra";
import { Terminal, tondevHome } from "../../core";
import { downloadFromGithub, formatTable } from "../../core/utils";

const repos: { url: string; root: string }[] = [
    {
        url: "https://github.com/tonlabs/sdk-samples/archive/master.zip",

        // Github makes this name when zipping files, so we should just write it here correctly
        root: "sdk-samples-master",
    },
];

export function getVariants() {
    return [
        {
            name: "simple-app",
            description: "This is the simplest app ever",
            repository: 0,
            relPath: "v1/web-pack/simple-app",
        },
        {
            name: "subscription",
            description: "Sometimes it's better to wait for a push than to poll",
            repository: 0,
            relPath: "v1/node-js/core-api/subscription",
        },
        {
            name: "query",
            description: "Try our queries",
            repository: 0,
            relPath: "v1/node-js/core-api/query",
        },
    ];
}
function getVariant(name: string) {
    const app = getVariants().find(x => x.name === name);
    // app !== undefined, but the compliler does't know that
    if (!app) throw `An error occured while checking if "${name}" is installed`;
    return app;
}

export async function demoEnsureInstalled(terminal: Terminal, name: string, folder: string) {
    const app = getVariant(name);

    // Check if App is installed in the current folder
    const { url: repoUrl, root: repoRoot } = repos[app.repository];
    /*
    appFolder = '/home/tondev/sdk-samples-master/v1/node-js/core-api'
                |            |                  |                   |
                |   folder   |     repoRoot     |     app.relPath   |
    */
    const appFolder = path.resolve(folder, repoRoot, app.relPath);
    console.log({ appFolder });

    if (!fs.existsSync(appFolder)) {
        const _appFolder = path.resolve(tondevHome(), repoRoot, app.relPath);
        console.log({ _appFolder });

        // Check if App exists in .tondev
        if (!fs.existsSync(_appFolder)) {
            terminal.log("Cloning SDK samples respository...");
            await downloadFromGithub(terminal, repoUrl, tondevHome());
        }
        fs.copySync(_appFolder, appFolder);
    }
    return appFolder;
}
export async function demoUninstall(terminal: Terminal, name: string, folder: string) {
    const app = getVariant(name);

    // Check if App is installed in the current folder
    const { root: repoRoot } = repos[app.repository];
    /*
    appFolder = '/home/tondev/sdk-samples-master/v1/node-js/core-api'
                |            |                  |                   |
                |   folder   |     repoRoot     |     app.relPath   |
    */
    const paths = [
        path.resolve(folder, repoRoot, app.relPath),
        path.resolve(tondevHome(), repoRoot, app.relPath),
    ];

    let ok = false;
    const table = paths.map(folder => {
        if (fs.existsSync(folder)) {
            fs.rmdirSync(folder, { recursive: true });
            ok = true;
            return [folder, "Removed"];
        } else {
            return [folder, "Not found"];
        }
    });

    terminal.log(formatTable(table));
    return ok;
}

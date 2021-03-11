import {
    Command,
    Terminal,
    ToolController,
} from "../../core";
import path from "path";
import fs from "fs";
import {BaseApp} from "./snippets";
import {
    downloadDemo,
    ensureDemoInstalled,
    getInfo,
} from "./installer";
import {formatTable} from "../../core/utils";

export const jsCreateCommand: Command = {
    name: "create",
    title: "Create FreeTON JS App",
    args: [{
        isArg: true,
        name: "name",
        type: "string",
    }, {
        name: "folder",
        type: "folder",
    }],
    async run(terminal: Terminal, args: { name: string, folder: string }) {
        const appFolderPath = path.resolve(args.folder, args.name);
        fs.mkdirSync(appFolderPath, {recursive: true});
        fs.writeFileSync(path.resolve(appFolderPath, "index.js"), BaseApp.index);
        fs.writeFileSync(path.resolve(appFolderPath, "package.json"), BaseApp.package);
        terminal.log(`App created in ${appFolderPath}`);
    },
};

export const jsDemoCommand: Command = {
    name: "demo",
    title: "Download FreeTON Demo",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
            defaultValue: "",
        },
        {
            name: "folder",
            type: "folder",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        if (args.name === "") {
            await ensureDemoInstalled(terminal);
            const table = [
                ["Demo", "Description"],
                ...(await getInfo()).applications.map(x => [x.name, x.description]),
            ];
            terminal.log(formatTable(table, {headerSeparator: true}));
        } else {
            await downloadDemo(terminal, args.name, args.folder);
        }
    },
};

export const JsApps: ToolController = {
    name: "js",
    title: "JS Apps",
    commands: [
        jsCreateCommand,
        jsDemoCommand],
};

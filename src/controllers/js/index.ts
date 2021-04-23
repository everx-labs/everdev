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
    loadInfo,
} from "./installer";
import {formatTable} from "../../core/utils";
import {jsWrapCommand} from "./wrap";

export const jsCreateCommand: Command = {
    name: "create",
    alias: "c",
    title: "Create FreeTON JS App",
    args: [{
        isArg: true,
        name: "name",
        type: "string",
    }, {
        name: "folder",
        type: "folder",
        title: "Target folder (current default)",
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
            title: "Target folder (current default)",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        if (args.name === "") {
            const table = [
                ["Demo", "Description"],
                ...(await loadInfo()).applications.map(x => [x.name, x.description]),
            ];
            terminal.log(formatTable(table, {headerSeparator: true}));
        } else {
            await downloadDemo(terminal, args.name, args.folder);
        }
    },
};

export const JsApps: ToolController = {
    name: "js",
    alias: "j",
    title: "JavaScript Code Generators",
    commands: [
        jsCreateCommand,
        jsDemoCommand,
        jsWrapCommand,
    ],
};

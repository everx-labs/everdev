import path from "path";
import { Command, Terminal } from "../../core";
import { getVariants, demoEnsureInstalled } from "./installer";

export const jsInstallCommand: Command = {
    name: "install",
    title: "Install TON demo App",
    args: [
        {
            isArg: true,
            name: "name",
            type: "string",
            getVariants,
        },
        {
            name: "folder",
            type: "folder",
        },
    ],
    async run(terminal: Terminal, args: { name: string; folder: string }) {
        const appPath = await demoEnsureInstalled(terminal, args.name, args.folder);

        [
            `Application is installed in ${appPath}`,
            ``,
            "Check README.md or run application:",
            `$ cd ${path.relative(".", appPath)}`,
            `$ npm i`,
            `$ npm start`,
        ].map(x => terminal.log(x));
    },
};

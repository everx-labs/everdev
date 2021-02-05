import * as fs from "fs";
import path from "path";
import {Terminal} from "../../core";

const indexJs = `
const {TONClient} = require("@tonclient/core");
const {libNode} = require("@tonclient/lib-node");

TONClient.useBinaryLibrary(libNode);

(async () => {
    try {
        await main(new TONClient({ 
            network: { 
                server_address: "http://localhost:8080" 
            }
        }));
    } catch (err) {
        console.error(err);
    }
})();

async function main(client) {
    console.log((await client.client.version()).version);
}

`;

const packageJson = `
{
    "dependencies": {
        "@tonclient/core": "^1",
        "@tonclient/lib-node": "^1"
    }
}
`;

export async function createJsApp(terminal: Terminal, args: { name: string, folder: string }) {
    const appFolderPath = path.resolve(args.folder, args.name);
    fs.mkdirSync(appFolderPath, {recursive: true});
    fs.writeFileSync(path.resolve(appFolderPath, "index.js"), indexJs);
    fs.writeFileSync(path.resolve(appFolderPath, "package.json"), packageJson);
    terminal.log(`App created in ${appFolderPath}`);
}

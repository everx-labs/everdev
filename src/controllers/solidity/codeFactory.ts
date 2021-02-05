import * as fs from "fs";
import path from "path";
import {Terminal} from "../../core";
import {uniqueFilePath} from "../../core/utils";

const contractSol = `
contract Contract {
}
`;

export async function createSolidityContract(terminal: Terminal, args: { folder: string }) {
    const filePath = uniqueFilePath(args.folder, "contract{}.sol");
    fs.writeFileSync(filePath, contractSol);
    terminal.log(`Solidity contract ${path.basename(filePath)} created.`);
}

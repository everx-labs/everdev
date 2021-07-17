import { Terminal } from "../../core";
import {
    Account,
    AccountOptions,
    ContractPackage,
} from "@tonclient/appkit";
import { NetworkRegistry } from "../network/registry";
import {
    TonClient,
} from "@tonclient/core";
import fs from "fs";
import {
    SignerRegistry,
} from "../signer/registry";
import { ParamParser } from "./param-parser";

function findExisting(paths: string[]): string | undefined {
    return paths.find(x => fs.existsSync(x));
}

function loadContract(filePath: string): ContractPackage {
    filePath = filePath.trim();
    const lowered = filePath.toLowerCase();
    let basePath;
    if (lowered.endsWith(".tvc") || lowered.endsWith(".abi")) {
        basePath = filePath.slice(0, -4);
    } else if (lowered.endsWith(".abi.json")) {
        basePath = filePath.slice(0, -9);
    } else {
        basePath = filePath;
    }
    const tvcPath = findExisting([`${basePath}.tvc`]);
    const abiPath = findExisting([`${basePath}.abi.json`, `${basePath}.abi`]);
    const tvc = tvcPath ? fs.readFileSync(tvcPath).toString("base64") : undefined;
    const abi = abiPath ? JSON.parse(fs.readFileSync(abiPath, "utf8")) : undefined;
    if (!abi) {
        throw new Error("ABI file missing.");
    }
    return {
        abi,
        tvc,
    };
}

export async function getAccount(terminal: Terminal, args: {
    file: string,
    network: string,
    signer: string,
    data: string,
    address?: string,
}): Promise<Account> {
    const address = args.address ?? "";
    const network = new NetworkRegistry().get(args.network);
    const client = new TonClient({
        network: {
            endpoints: network.endpoints,
        },
    });
    const contract = args.file !== "" ? loadContract(args.file) : { abi: {} };
    const signers = new SignerRegistry();
    const signerItem = await signers.resolveItem(args.signer, {
        useNoneForEmptyName: address !== "",
    });
    const options: AccountOptions = {
        signer: await signers.createSigner(signerItem),
        client,
    };
    const abiData = contract.abi.data ?? [];
    if (abiData.length > 0 && args.data !== "") {
        options.initData = ParamParser.components({
            name: "data",
            type: "tuple",
            components: abiData,
        }, args.data);
    }
    if (address !== "") {
        options.address = address;
    }
    const account = new Account(contract, options);
    terminal.log("\nConfiguration\n");
    terminal.log(`  Network: ${network.name} (${NetworkRegistry.getEndpointsSummary(network)})`);
    terminal.log(`  Signer:  ${signerItem ? `${signerItem.name} (public ${signerItem.keys.public})` : "None"}\n`);
    if (address === "" && abiData.length > 0 && !options.initData) {
        terminal.log(`Address:   Can't calculate address: additional deploying data required.`);
    } else {
        terminal.log(`Address:   ${await account.getAddress()}${address === "" ? " (calculated from TVC and signer public)" : ""}`);
    }
    return account;
}



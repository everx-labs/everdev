import {Terminal} from "../../core";
import {
    Account,
    AccountOptions,
    ContractPackage,
} from "@tonclient/appkit";
import {NetworkRegistry} from "../network/registry";
import {
    signerNone,
    TonClient,
} from "@tonclient/core";
import {createSigner} from "../signer";
import fs from "fs";
import {SignerRegistry} from "../signer/registry";

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
    address: string,
    signer: string,
}): Promise<Account> {
    const network = new NetworkRegistry().get(args.network);
    const client = new TonClient({
        network: {
            endpoints: network.endpoints,
        },
    });
    const infoByAddressMode = args.file === "" && args.address !== "";
    const signerItem = infoByAddressMode || args.signer.trim().toLowerCase() === "none"
        ? undefined
        : new SignerRegistry().get(args.signer);
    const signer = signerItem ? await createSigner(signerItem.name) : signerNone();
    const contract =
        infoByAddressMode
            ? { abi: {} }
            : loadContract(args.file);
    const options: AccountOptions = {
        signer,
        client,
    };
    if (args.address !== "") {
        options.address = args.address;
    }
    const account = new Account(contract, options);
    terminal.log("\nConfiguration\n");
    terminal.log(`  Network: ${network.name} (${NetworkRegistry.getEndpointsSummary(network)})`);
    terminal.log(`  Signer:  ${signerItem ? `${signerItem.name} (public ${signerItem.keys.public})` : "None"}\n`);
    terminal.log(`Address:   ${await account.getAddress()}${args.address === "" ? " (calculated from TVC and signer public)" : ""}`);
    return account;
}



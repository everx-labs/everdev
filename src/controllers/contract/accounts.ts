import { Terminal } from "../../core"
import { Account, AccountOptions } from "@tonclient/appkit"
import { NetworkRegistry } from "../network/registry"
import { TonClient } from "@tonclient/core"
import { SignerRegistry } from "../signer/registry"
import { ParamParser } from "./param-parser"
import { resolveContract } from "../../core/utils"

export async function getAccount(
    terminal: Terminal,
    args: {
        file: string
        network: string
        signer: string
        data: string
        address?: string
    },
): Promise<Account> {
    const address = args.address ?? ""
    const network = new NetworkRegistry().get(args.network)
    const client = new TonClient({
        network: {
            endpoints: network.endpoints,
        },
    })
    const contract =
        args.file !== ""
            ? resolveContract(args.file)
            : { package: { abi: {} }, abiPath: "" }
    const signers = new SignerRegistry()
    const signerItem = await signers.resolveItem(args.signer, {
        useNoneForEmptyName: address !== "",
    })
    const options: AccountOptions = {
        signer: await signers.createSigner(signerItem),
        client,
    }
    const abiData = contract.package.abi.data ?? []
    if (abiData.length > 0 && args.data !== "") {
        options.initData = ParamParser.components(
            {
                name: "data",
                type: "tuple",
                components: abiData,
            },
            args.data,
        )
    }
    if (address !== "") {
        options.address = address
    }
    const account = new Account(contract.package, options)
    terminal.log("\nConfiguration\n")
    terminal.log(
        `  Network: ${network.name} (${NetworkRegistry.getEndpointsSummary(
            network,
        )})`,
    )
    terminal.log(
        `  Signer:  ${
            signerItem
                ? `${signerItem.name} (public ${signerItem.keys.public})`
                : "None"
        }\n`,
    )
    if (address === "" && abiData.length > 0 && !options.initData) {
        terminal.log(
            `Address:   Can't calculate address: additional deploying data required.`,
        )
    } else {
        terminal.log(
            `Address:   ${await account.getAddress()}${
                address === "" ? " (calculated from TVC and signer public)" : ""
            }`,
        )
    }
    return account
}

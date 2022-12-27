import { Account, ContractPackage } from "@eversdk/appkit"
import { TonClient, AbiContract } from "@eversdk/core"

import path from "path"
import fs from "fs"
import {
    getParsedAccount,
    ParsedAccount,
} from "../controllers/contract/accounts"

export type KnownContract = {
    name: string
} & ContractPackage

export async function knownContractFromAddress(
    client: TonClient,
    name: string,
    address: string,
): Promise<KnownContract> {
    const info = await getParsedAccount(
        await new Account(
            { abi: {} },
            {
                client,
                address,
            },
        ),
    )
    const codeHash = info.code_hash
    if (!codeHash) {
        throw new Error(`${name} ${address} has no code deployed.`)
    }
    return knownContractFromCodeHash(codeHash, name, address)
}

export function knownContractByName(name: KnownContractName): KnownContract {
    if (!(name in KnownContracts)) {
        throw new Error(`Unknown contract type ${name}.`)
    }
    return KnownContracts[name]
}

export function knownContractFromCodeHash(
    codeHash: string,
    name: string,
    address?: string,
): KnownContract {
    const contract = contracts[codeHash]
    if (!contract) {
        if (address) {
            throw new Error(
                `${name} ${address} has unknown code hash ${codeHash}.`,
            )
        }
        throw new Error(`Unknown code hash ${codeHash} for ${name}.`)
    }
    return contract
}

function contractsFile(name: string): string {
    return path.resolve(__dirname, "..", "..", "contracts", name)
}

export function loadAbi(name: string): AbiContract {
    return JSON.parse(
        fs.readFileSync(contractsFile(`${name}.abi.json`), "utf8"),
    )
}

export const KnownContracts: { [name: string]: KnownContract } = {
    GiverV1: {
        name: "GiverV1",
        abi: loadAbi("GiverV1"),
    },
    GiverV2: {
        name: "GiverV2",
        abi: loadAbi("GiverV2"),
    },
    GiverV3: {
        name: "GiverV3",
        abi: loadAbi("GiverV3"),
    },
    SetcodeMultisigWallet: {
        name: "SetcodeMultisigWallet",
        abi: loadAbi("SetcodeMultisigWallet"),
    },
    SafeMultisigWallet: {
        name: "SafeMultisigWallet",
        abi: loadAbi("SafeMultisigWallet"),
    },
}

export type KnownContractName = keyof typeof KnownContracts

const contracts: { [codeHash: string]: KnownContract } = {
    "4e92716de61d456e58f16e4e867e3e93a7548321eace86301b51c8b80ca6239b":
        KnownContracts.GiverV2,
    ccbfc821853aa641af3813ebd477e26818b51e4ca23e5f6d34509215aa7123d9:
        KnownContracts.GiverV2,
    e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208:
        KnownContracts.SetcodeMultisigWallet,
    "207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82":
        KnownContracts.SetcodeMultisigWallet,
    "80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105":
        KnownContracts.SafeMultisigWallet,
}

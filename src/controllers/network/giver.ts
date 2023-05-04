import { Account, AccountGiver } from "@eversdk/appkit"
import { Signer, TonClient } from "@eversdk/core"
import {
    KnownContract,
    knownContractAddress,
    knownContractByName,
    knownContractFromAddress,
    KnownContractName,
    KnownContracts,
} from "../../core/known-contracts"
import { NetworkGiverInfo } from "./registry"
import { SE_DEFAULT_GIVER_SIGNER, SignerRegistry } from "../signer/registry"
import { formatTokens } from "../../core/utils"

async function giverV2Send(
    giver: Account,
    address: string,
    value: number,
): Promise<void> {
    await giver.run("sendTransaction", {
        dest: address,
        value: value,
        bounce: false,
    })
}

async function giverV1Send(
    giver: Account,
    address: string,
    value: number,
): Promise<void> {
    await giver.run("sendGrams", {
        dest: address,
        amount: value,
    })
}

async function multisigSend(
    giver: Account,
    address: string,
    value: number,
): Promise<void> {
    await giver.run("sendTransaction", {
        dest: address,
        value: value,
        bounce: false,
        flags: 1,
        payload: "",
    })
}

export class NetworkGiver implements AccountGiver {
    account: Account
    value: number | undefined
    name: string | undefined

    constructor(
        public contract: KnownContract,
        client: TonClient,
        public address: string,
        signer: Signer,
        public info: NetworkGiverInfo,
        private send: (
            giver: Account,
            address: string,
            value: number,
        ) => Promise<void>,
    ) {
        this.value = info.value
        this.name = info.name
        this.account = new Account(contract, {
            client,
            address,
            signer,
        })
    }

    static async create(
        client: TonClient,
        info: NetworkGiverInfo,
    ): Promise<NetworkGiver> {
        const signerName = info.signer ?? SE_DEFAULT_GIVER_SIGNER.name
        const signer = await new SignerRegistry().resolveSigner(signerName, {
            useNoneForEmptyName: true,
        })
        const knownName = info.name as KnownContractName
        const address =
            info.address !== ""
                ? info.address
                : await knownContractAddress(client, knownName, signer)
        let contract: KnownContract
        let send: (
            giver: Account,
            address: string,
            value: number,
        ) => Promise<void>

        if (info.name !== undefined && info.name !== "auto") {
            contract = await knownContractByName(knownName)
        } else {
            contract = await knownContractFromAddress(client, "Giver", address)
        }

        if (contract === KnownContracts.GiverV1) {
            send = giverV1Send
        } else if (contract === KnownContracts.GiverV2) {
            send = giverV2Send
        } else if (contract === KnownContracts.GiverV3) {
            send = giverV2Send
        } else if (contract === KnownContracts.SetcodeMultisigWallet) {
            send = multisigSend
        } else if (contract === KnownContracts.MsigV2) {
            send = multisigSend
        } else if (contract === KnownContracts.SafeMultisigWallet) {
            send = multisigSend
        } else {
            throw new Error(
                `Contract ${contract.name} can't be used as a giver.`,
            )
        }
        return new NetworkGiver(contract, client, address, signer, info, send)
    }

    async sendTo(address: string, value: number): Promise<void> {
        const valueToSend = this.value ?? value
        try {
            await this.send(this.account, address, valueToSend)
        } catch (error: any) {
            const message = `Giver can't send ${formatTokens(
                valueToSend,
            )} to the ${address}`
            const giver = `Contract: ${this.info.name}\nAddress:  ${this.address}\nSigner:   ${this.info.signer}`
            throw new Error(
                `${message}: ${error.message}\n\nPlease check giver configuration:\n${giver}`,
            )
        }
    }
}

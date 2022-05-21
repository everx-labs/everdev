import {
    Account,
    AccountGiver,
} from "@tonclient/appkit";
import {
    abiContract,
    KeyPair,
    Signer,
    signerKeys,
    TonClient,
} from "@tonclient/core";
import {
    KnownContract,
    knownContractByName,
    knownContractFromAddress,
    KnownContracts,
} from "../../core/known-contracts";
import { NetworkGiverInfo } from "./registry";
import { SignerRegistry } from "../signer/registry";
import { formatTokens } from "../../core/utils";

async function giverV2Send(giver: Account, address: string, value: number): Promise<void> {
    await giver.run("sendTransaction", {
        "dest": address,
        "value": value,
        "bounce": false,
    });
}

async function giverV1Send(giver: Account, address: string, value: number): Promise<void> {
    await giver.run("sendGrams", {
        "dest": address,
        "amount": value,
        "bounce": false,
    });
}

async function multisigSend(giver: Account, address: string, value: number): Promise<void> {
    await giver.run("sendTransaction", {
        "dest": address,
        "value": value,
        "bounce": false,
        "flags": 1,
        "payload": "",
    });
}

const seGiverKeys: KeyPair = {
    "public": "2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16",
    "secret": "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
};
const seGiverKeysTvc = "te6ccgECGgEAA9sAAgE0BgEBAcACAgPPIAUDAQHeBAAD0CAAQdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIm/wD0pCAiwAGS9KDhiu1TWDD0oQkHAQr0pCD0oQgAAAIBIAwKAfz/fyHtRNAg10nCAZ/T/9MA9AX4an/4Yfhm+GKOG/QFbfhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLTAAGOEoECANcYIPkBWPhCIPhl+RDyqN4j+EL4RSBukjBw3rry4GUh0z/THzQx+CMhAb7yuSH5ACD4SoEBAPQOIJEx3rMLAE7y4Gb4ACH4SiIBVQHIyz9ZgQEA9EP4aiMEXwTTHwHwAfhHbpLyPN4CASASDQIBWBEOAQm46Jj8UA8B/vhBbo4S7UTQ0//TAPQF+Gp/+GH4Zvhi3tFwbW8C+EqBAQD0hpUB1ws/f5NwcHDikSCONyMjI28CbyLIIs8L/yHPCz8xMQFvIiGkA1mAIPRDbwI0IvhKgQEA9HyVAdcLP3+TcHBw4gI1MzHoXwPIghB3RMfighCAAAAAsc8LHyEQAKJvIgLLH/QAyIJYYAAAAAAAAAAAAAAAAM8LZoEDmCLPMQG5lnHPQCHPF5Vxz0EhzeIgyXH7AFswwP+OEvhCyMv/+EbPCwD4SgH0AMntVN5/+GcAxbkWq+f/CC3Rxt2omgQa6ThAM/p/+mAegL8NT/8MPwzfDFHDfoCtvw1OADAIHoHeV7rhf/8MTh8Mbh8Mz/8MPFvfCNJeRnJuPwzcXwAaPwhZGX//CNnhYB8JQD6AGT2qj/8M8AIBIBUTAde7Fe+TX4QW6OEu1E0NP/0wD0Bfhqf/hh+Gb4Yt76QNcNf5XU0dDTf9/XDACV1NHQ0gDf0SIiInPIcc8LASLPCgBzz0AkzxYj+gKAac9Acs9AIMki+wBfBfhKgQEA9IaVAdcLP3+TcHBw4pEggUAJKOLfgjIgG7n/hKIwEhAYEBAPRbMDH4at4i+EqBAQD0fJUB1ws/f5NwcHDiAjUzMehfA18D+ELIy//4Rs8LAPhKAfQAye1Uf/hnAgEgFxYAx7jkYYdfCC3Rwl2omhp/+mAegL8NT/8MPwzfDFvamj8IXwikDdJGDhvXXlwMvwAfCFkZf/8I2eFgHwlAPoAZPaqfAeQfYIQaHaPdqn4ARh8IWRl//wjZ4WAfCUA+gBk9qo//DPACAtoZGAAtr4QsjL//hGzwsA+EoB9ADJ7VT4D/IAgAdacCHHAJ0i0HPXIdcLAMABkJDi4CHXDR+S8jzhUxHAAJDgwQMighD////9vLGS8jzgAfAB+EdukvI83o";

export class NetworkGiver implements AccountGiver {
    account: Account;
    value: number | undefined;
    name: string | undefined;

    constructor(
        public contract: KnownContract,
        client: TonClient,
        public address: string,
        signer: Signer,
        public info: NetworkGiverInfo,
        private send: (giver: Account, address: string, value: number) => Promise<void>,
    ) {
        this.value = info.value;
        this.name = info.name;
        this.account = new Account(contract, {
            client,
            address,
            signer,
        });
    }

    static async create(
        client: TonClient,
        info: NetworkGiverInfo,
    ): Promise<NetworkGiver> {
        const signerName = (info.signer || new SignerRegistry().default) ?? "";
        const signer = signerName !== ""
            ? await new SignerRegistry().resolveSigner(signerName, { useNoneForEmptyName: true })
            : signerKeys(seGiverKeys);
        const address = info.address !== ""
            ? info.address
            : (await client.abi.encode_message({
                abi: abiContract(KnownContracts.GiverV2.abi),
                deploy_set: {
                    tvc: seGiverKeysTvc,
                },
                signer,
            })).address;
        let contract: KnownContract;
        let send: (giver: Account, address: string, value: number) => Promise<void>;

        if (info.name !== undefined && info.name !== "auto") {
            contract = await knownContractByName(info.name);
        } else {
            contract = await knownContractFromAddress(client, "Giver", address);
        }

        if (contract === KnownContracts.GiverV1) {
            send = giverV1Send;
        } else if (contract === KnownContracts.GiverV2) {
            send = giverV2Send;
        } else if (contract === KnownContracts.GiverV3) {
            send = giverV2Send;
        } else if (contract === KnownContracts.SetcodeMultisigWallet) {
            send = multisigSend;
        } else if (contract === KnownContracts.SafeMultisigWallet) {
            send = multisigSend;
        } else {
            throw new Error(`Contract ${contract.name} can't be used as a giver.`);
        }
        return new NetworkGiver(contract,
            client,
            address,
            signer,
            info,
            send,
        );
    }

    async sendTo(address: string, value: number): Promise<void> {
        const valueToSend = this.value ?? value;
        try {
            await this.send(this.account, address, valueToSend);
        } catch (error: any) {
            const message = `Giver can't send ${formatTokens(valueToSend)} to the ${address}`;
            const giver = `Contract: ${this.info.name}\nAddress:  ${this.address}\nSigner:   ${this.info.signer}`;
            throw new Error(`${message}: ${error.message}\n\nPlease check giver configuration:\n${giver}`);
        }
    }
}

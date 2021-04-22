import {
    Account,
    ContractPackage,
} from "@tonclient/appkit";
import {TonClient} from "@tonclient/core";

export type KnownContract = {
    name: string,
} & ContractPackage;

export async function knownContractFromAddress(client: TonClient, address: string): Promise<KnownContract> {
    const info = await new Account({ abi: {} }, {
        client,
        address,
    }).getAccount();
    const codeHash = info.code_hash;
    if (!codeHash) {
        throw new Error(`Account ${address} has no code deployed.`);
    }
    return knownContractFromCodeHash(codeHash, address);
}

export function knownContractFromCodeHash(codeHash: string, address?: string): KnownContract {
    const contract = contracts[codeHash];
    if (!contract) {
        if (address) {
            throw new Error(`Account ${address} has unknown code hash ${codeHash}.`);
        }
        throw new Error(`Unknown code hash ${codeHash}.`);
    }
    return contract;
}

export const KnownContracts = {
    GiverV2: {
        name: "GiverV2",
        abi: {
            "ABI version": 2,
            header: ["time", "expire"],
            functions: [
                {
                    name: "sendTransaction",
                    inputs: [
                        {
                            "name": "dest",
                            "type": "address",
                        },
                        {
                            "name": "value",
                            "type": "uint128",
                        },
                        {
                            "name": "bounce",
                            "type": "bool",
                        },
                    ],
                    outputs: [],
                },
                {
                    name: "getMessages",
                    inputs: [],
                    outputs: [
                        {
                            components: [
                                {
                                    name: "hash",
                                    type: "uint256",
                                },
                                {
                                    name: "expireAt",
                                    type: "uint64",
                                },
                            ],
                            name: "messages",
                            type: "tuple[]",
                        },
                    ],
                },
                {
                    name: "upgrade",
                    inputs: [
                        {
                            name: "newcode",
                            type: "cell",
                        },
                    ],
                    outputs: [],
                },
                {
                    name: "constructor",
                    inputs: [],
                    outputs: [],
                },
            ],
            data: [],
            events: [],
        },
    },
    SetcodeMultisigWallet: {
        name: "SetcodeMultisigWallet",
        abi: {
            "ABI version": 2,
            "header": [
                "pubkey",
                "time",
                "expire",
            ],
            "functions": [
                {
                    "name": "constructor",
                    "inputs": [
                        {
                            "name": "owners",
                            "type": "uint256[]",
                        },
                        {
                            "name": "reqConfirms",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "acceptTransfer",
                    "inputs": [
                        {
                            "name": "payload",
                            "type": "bytes",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "sendTransaction",
                    "inputs": [
                        {
                            "name": "dest",
                            "type": "address",
                        },
                        {
                            "name": "value",
                            "type": "uint128",
                        },
                        {
                            "name": "bounce",
                            "type": "bool",
                        },
                        {
                            "name": "flags",
                            "type": "uint8",
                        },
                        {
                            "name": "payload",
                            "type": "cell",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "submitTransaction",
                    "inputs": [
                        {
                            "name": "dest",
                            "type": "address",
                        },
                        {
                            "name": "value",
                            "type": "uint128",
                        },
                        {
                            "name": "bounce",
                            "type": "bool",
                        },
                        {
                            "name": "allBalance",
                            "type": "bool",
                        },
                        {
                            "name": "payload",
                            "type": "cell",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "transId",
                            "type": "uint64",
                        },
                    ],
                },
                {
                    "name": "confirmTransaction",
                    "inputs": [
                        {
                            "name": "transactionId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "isConfirmed",
                    "inputs": [
                        {
                            "name": "mask",
                            "type": "uint32",
                        },
                        {
                            "name": "index",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "confirmed",
                            "type": "bool",
                        },
                    ],
                },
                {
                    "name": "getParameters",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "maxQueuedTransactions",
                            "type": "uint8",
                        },
                        {
                            "name": "maxCustodianCount",
                            "type": "uint8",
                        },
                        {
                            "name": "expirationTime",
                            "type": "uint64",
                        },
                        {
                            "name": "minValue",
                            "type": "uint128",
                        },
                        {
                            "name": "requiredTxnConfirms",
                            "type": "uint8",
                        },
                        {
                            "name": "requiredUpdConfirms",
                            "type": "uint8",
                        },
                    ],
                },
                {
                    "name": "getTransaction",
                    "inputs": [
                        {
                            "name": "transactionId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [
                        {
                            "components": [
                                {
                                    "name": "id",
                                    "type": "uint64",
                                },
                                {
                                    "name": "confirmationsMask",
                                    "type": "uint32",
                                },
                                {
                                    "name": "signsRequired",
                                    "type": "uint8",
                                },
                                {
                                    "name": "signsReceived",
                                    "type": "uint8",
                                },
                                {
                                    "name": "creator",
                                    "type": "uint256",
                                },
                                {
                                    "name": "index",
                                    "type": "uint8",
                                },
                                {
                                    "name": "dest",
                                    "type": "address",
                                },
                                {
                                    "name": "value",
                                    "type": "uint128",
                                },
                                {
                                    "name": "sendFlags",
                                    "type": "uint16",
                                },
                                {
                                    "name": "payload",
                                    "type": "cell",
                                },
                                {
                                    "name": "bounce",
                                    "type": "bool",
                                },
                            ],
                            "name": "trans",
                            "type": "tuple",
                        },
                    ],
                },
                {
                    "name": "getTransactions",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [
                                {
                                    "name": "id",
                                    "type": "uint64",
                                },
                                {
                                    "name": "confirmationsMask",
                                    "type": "uint32",
                                },
                                {
                                    "name": "signsRequired",
                                    "type": "uint8",
                                },
                                {
                                    "name": "signsReceived",
                                    "type": "uint8",
                                },
                                {
                                    "name": "creator",
                                    "type": "uint256",
                                },
                                {
                                    "name": "index",
                                    "type": "uint8",
                                },
                                {
                                    "name": "dest",
                                    "type": "address",
                                },
                                {
                                    "name": "value",
                                    "type": "uint128",
                                },
                                {
                                    "name": "sendFlags",
                                    "type": "uint16",
                                },
                                {
                                    "name": "payload",
                                    "type": "cell",
                                },
                                {
                                    "name": "bounce",
                                    "type": "bool",
                                },
                            ],
                            "name": "transactions",
                            "type": "tuple[]",
                        },
                    ],
                },
                {
                    "name": "getTransactionIds",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "ids",
                            "type": "uint64[]",
                        },
                    ],
                },
                {
                    "name": "getCustodians",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [
                                {
                                    "name": "index",
                                    "type": "uint8",
                                },
                                {
                                    "name": "pubkey",
                                    "type": "uint256",
                                },
                            ],
                            "name": "custodians",
                            "type": "tuple[]",
                        },
                    ],
                },
                {
                    "name": "submitUpdate",
                    "inputs": [
                        {
                            "name": "codeHash",
                            "type": "uint256",
                        },
                        {
                            "name": "owners",
                            "type": "uint256[]",
                        },
                        {
                            "name": "reqConfirms",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                    ],
                },
                {
                    "name": "confirmUpdate",
                    "inputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "executeUpdate",
                    "inputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                        {
                            "name": "code",
                            "type": "cell",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "getUpdateRequests",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [
                                {
                                    "name": "id",
                                    "type": "uint64",
                                },
                                {
                                    "name": "index",
                                    "type": "uint8",
                                },
                                {
                                    "name": "signs",
                                    "type": "uint8",
                                },
                                {
                                    "name": "confirmationsMask",
                                    "type": "uint32",
                                },
                                {
                                    "name": "creator",
                                    "type": "uint256",
                                },
                                {
                                    "name": "codeHash",
                                    "type": "uint256",
                                },
                                {
                                    "name": "custodians",
                                    "type": "uint256[]",
                                },
                                {
                                    "name": "reqConfirms",
                                    "type": "uint8",
                                },
                            ],
                            "name": "updates",
                            "type": "tuple[]",
                        },
                    ],
                },
            ],
            "data": [],
            "events": [
                {
                    "name": "TransferAccepted",
                    "inputs": [
                        {
                            "name": "payload",
                            "type": "bytes",
                        },
                    ],
                    "outputs": [],
                },
            ],
        }
        ,
    },
    SafeMultisigWallet: {
        name: "SafeMultisigWallet",
        abi: {
            "ABI version": 2,
            "header": ["pubkey", "time", "expire"],
            "functions": [
                {
                    "name": "constructor",
                    "inputs": [
                        {
                            "name": "owners",
                            "type": "uint256[]",
                        },
                        {
                            "name": "reqConfirms",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "acceptTransfer",
                    "inputs": [
                        {
                            "name": "payload",
                            "type": "bytes",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "sendTransaction",
                    "inputs": [
                        {
                            "name": "dest",
                            "type": "address",
                        },
                        {
                            "name": "value",
                            "type": "uint128",
                        },
                        {
                            "name": "bounce",
                            "type": "bool",
                        },
                        {
                            "name": "flags",
                            "type": "uint8",
                        },
                        {
                            "name": "payload",
                            "type": "cell",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "submitTransaction",
                    "inputs": [
                        {
                            "name": "dest",
                            "type": "address",
                        },
                        {
                            "name": "value",
                            "type": "uint128",
                        },
                        {
                            "name": "bounce",
                            "type": "bool",
                        },
                        {
                            "name": "allBalance",
                            "type": "bool",
                        },
                        {
                            "name": "payload",
                            "type": "cell",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "transId",
                            "type": "uint64",
                        },
                    ],
                },
                {
                    "name": "confirmTransaction",
                    "inputs": [
                        {
                            "name": "transactionId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "isConfirmed",
                    "inputs": [
                        {
                            "name": "mask",
                            "type": "uint32",
                        },
                        {
                            "name": "index",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "confirmed",
                            "type": "bool",
                        },
                    ],
                },
                {
                    "name": "getParameters",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "maxQueuedTransactions",
                            "type": "uint8",
                        },
                        {
                            "name": "maxCustodianCount",
                            "type": "uint8",
                        },
                        {
                            "name": "expirationTime",
                            "type": "uint64",
                        },
                        {
                            "name": "minValue",
                            "type": "uint128",
                        },
                        {
                            "name": "requiredTxnConfirms",
                            "type": "uint8",
                        },
                        {
                            "name": "requiredUpdConfirms",
                            "type": "uint8",
                        },
                    ],
                },
                {
                    "name": "getTransaction",
                    "inputs": [
                        {
                            "name": "transactionId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [
                        {
                            "components": [{
                                "name": "id",
                                "type": "uint64",
                            }, {
                                "name": "confirmationsMask",
                                "type": "uint32",
                            }, {
                                "name": "signsRequired",
                                "type": "uint8",
                            }, {
                                "name": "signsReceived",
                                "type": "uint8",
                            }, {
                                "name": "creator",
                                "type": "uint256",
                            }, {
                                "name": "index",
                                "type": "uint8",
                            }, {
                                "name": "dest",
                                "type": "address",
                            }, {
                                "name": "value",
                                "type": "uint128",
                            }, {
                                "name": "sendFlags",
                                "type": "uint16",
                            }, {
                                "name": "payload",
                                "type": "cell",
                            }, {
                                "name": "bounce",
                                "type": "bool",
                            }],
                            "name": "trans",
                            "type": "tuple",
                        },
                    ],
                },
                {
                    "name": "getTransactions",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [{
                                "name": "id",
                                "type": "uint64",
                            }, {
                                "name": "confirmationsMask",
                                "type": "uint32",
                            }, {
                                "name": "signsRequired",
                                "type": "uint8",
                            }, {
                                "name": "signsReceived",
                                "type": "uint8",
                            }, {
                                "name": "creator",
                                "type": "uint256",
                            }, {
                                "name": "index",
                                "type": "uint8",
                            }, {
                                "name": "dest",
                                "type": "address",
                            }, {
                                "name": "value",
                                "type": "uint128",
                            }, {
                                "name": "sendFlags",
                                "type": "uint16",
                            }, {
                                "name": "payload",
                                "type": "cell",
                            }, {
                                "name": "bounce",
                                "type": "bool",
                            }],
                            "name": "transactions",
                            "type": "tuple[]",
                        },
                    ],
                },
                {
                    "name": "getTransactionIds",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "ids",
                            "type": "uint64[]",
                        },
                    ],
                },
                {
                    "name": "getCustodians",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [{
                                "name": "index",
                                "type": "uint8",
                            }, {
                                "name": "pubkey",
                                "type": "uint256",
                            }],
                            "name": "custodians",
                            "type": "tuple[]",
                        },
                    ],
                },
                {
                    "name": "submitUpdate",
                    "inputs": [
                        {
                            "name": "codeHash",
                            "type": "uint256",
                        },
                        {
                            "name": "owners",
                            "type": "uint256[]",
                        },
                        {
                            "name": "reqConfirms",
                            "type": "uint8",
                        },
                    ],
                    "outputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                    ],
                },
                {
                    "name": "confirmUpdate",
                    "inputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "executeUpdate",
                    "inputs": [
                        {
                            "name": "updateId",
                            "type": "uint64",
                        },
                        {
                            "name": "code",
                            "type": "cell",
                        },
                    ],
                    "outputs": [],
                },
                {
                    "name": "getUpdateRequests",
                    "inputs": [],
                    "outputs": [
                        {
                            "components": [{
                                "name": "id",
                                "type": "uint64",
                            }, {
                                "name": "index",
                                "type": "uint8",
                            }, {
                                "name": "signs",
                                "type": "uint8",
                            }, {
                                "name": "confirmationsMask",
                                "type": "uint32",
                            }, {
                                "name": "creator",
                                "type": "uint256",
                            }, {
                                "name": "codeHash",
                                "type": "uint256",
                            }, {
                                "name": "custodians",
                                "type": "uint256[]",
                            }, {
                                "name": "reqConfirms",
                                "type": "uint8",
                            }],
                            "name": "updates",
                            "type": "tuple[]",
                        },
                    ],
                },
            ],
            "data": [],
            "events": [
                {
                    "name": "TransferAccepted",
                    "inputs": [
                        {
                            "name": "payload",
                            "type": "bytes",
                        },
                    ],
                    "outputs": [],
                },
            ],
        },
    },
};

const contracts: { [codeHash: string]: KnownContract } = {
    "4e92716de61d456e58f16e4e867e3e93a7548321eace86301b51c8b80ca6239b": KnownContracts.GiverV2,
    "ccbfc821853aa641af3813ebd477e26818b51e4ca23e5f6d34509215aa7123d9": KnownContracts.GiverV2,
    "e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208": KnownContracts.SetcodeMultisigWallet,
    "207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82": KnownContracts.SetcodeMultisigWallet,
    "80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105": KnownContracts.SafeMultisigWallet,
};


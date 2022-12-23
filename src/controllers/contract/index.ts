import { Command, CommandArg, Terminal, ToolController } from "../../core"
import {
    resolveContract,
    resolveTvcAsBase64,
} from "../../core/solFileResolvers"
import { Account, AccountType } from "@eversdk/appkit"
import { TonClient } from "@eversdk/core"
import { getAccount } from "./accounts"
import { getRunParams, logRunResult, resolveParams } from "./run"
import { NetworkGiver } from "../network/giver"
import { NetworkRegistry } from "../network/registry"
import {
    formatTokens,
    parseNanoTokens,
    reduceBase64String,
} from "../../core/utils"

const abiFileArg: CommandArg = {
    isArg: true,
    name: "file",
    title: "ABI file",
    type: "file",
    nameRegExp: /\.abi$/i,
}

const tvcFileArg: CommandArg = {
    isArg: true,
    name: "file",
    title: "TVC file",
    type: "file",
    nameRegExp: /\.tvc$/i,
}

const infoFileArg: CommandArg = {
    ...abiFileArg,
    defaultValue: "",
}

const networkOpt: CommandArg = {
    name: "network",
    alias: "n",
    type: "string",
    title: "Network name",
    defaultValue: "",
}

const signerOpt: CommandArg = {
    name: "signer",
    alias: "s",
    title: "Signer key name",
    type: "string",
    defaultValue: "",
}

const runSignerOpt: CommandArg = {
    name: "run-signer",
    title: "Signer key name",
    description:
        "This signer will be used to sing message. " +
        "If run signer is not specified then contract's signer is used",
    type: "string",
    defaultValue: "",
}

const addressOpt: CommandArg = {
    name: "address",
    alias: "a",
    title: "Account address",
    type: "string",
    defaultValue: "",
}

const functionArg: CommandArg = {
    isArg: true,
    name: "function",
    title: "Function name",
    type: "string",
    defaultValue: "",
}

const inputOpt: CommandArg = {
    name: "input",
    alias: "i",
    title: "Function parameters as name:value,...",
    description:
        "Array values must be specified as [item,...]. " +
        'Spaces are not allowed. If value contains spaces or special symbols "[],:" ' +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
}

const dataOpt: CommandArg = {
    name: "data",
    alias: "d",
    title: "Deploying initial data as name:value,...",
    description:
        "This data is required to calculate the account address and to deploy contract.\n" +
        "Array values must be specified as [item,...]. " +
        'Spaces are not allowed. If value contains spaces or special symbols "[],:" ' +
        "it must be enclosed in \"\" or ''",
    type: "string",
    defaultValue: "",
}

const valueOpt: CommandArg = {
    name: "value",
    alias: "v",
    title: "Deploying balance value in nano tokens",
    type: "string",
    defaultValue: "",
}

const preventUiOpt: CommandArg = {
    name: "prevent-ui",
    alias: "p",
    title: "Prevent user interaction",
    description:
        "Useful in shell scripting e.g. on server or in some automating to disable " +
        "waiting for the user input.\n" +
        "Instead everdev will abort with error.\n" +
        "For example when some parameters are missing in command line " +
        "then everdev will prompt user to input values for missing parameters " +
        "(or fails if prevent-ui option is specified).",
    type: "boolean",
    defaultValue: "false",
}

export const contractInfoCommand: Command = {
    name: "info",
    alias: "i",
    title: "Prints contract summary",
    args: [infoFileArg, networkOpt, signerOpt, dataOpt, addressOpt],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            data: string
            address: string
        },
    ) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified")
        }
        const account = await getAccount(terminal, args)
        const parsed = await account.getAccount()
        const accType = parsed.acc_type as AccountType
        if (account.contract.tvc) {
            const boc = account.client.boc
            const codeHash = (
                await boc.get_boc_hash({
                    boc: (
                        await boc.get_code_from_tvc({
                            tvc: account.contract.tvc,
                        })
                    ).code,
                })
            ).hash
            terminal.log(`Code Hash: ${codeHash} (from TVC file)`)
        }
        if (accType === AccountType.nonExist) {
            terminal.log("Account:   Doesn't exist")
        } else {
            terminal.log(`Account:   ${parsed.acc_type_name}`)
            terminal.log(`Balance:   ${formatTokens(parsed.balance)}`)
            parsed.boc = reduceBase64String(parsed.boc)
            parsed.code = reduceBase64String(parsed.code)
            parsed.data = reduceBase64String(parsed.data)

            terminal.log(
                `Details:   ${JSON.stringify(parsed, undefined, "    ")}`,
            )
        }
        await account.free()
        account.client.close()
    },
}

export const contractDeployCommand: Command = {
    name: "deploy",
    alias: "d",
    title: "Deploy contract to network",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        functionArg,
        inputOpt,
        dataOpt,
        valueOpt,
        preventUiOpt,
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            function: string
            input: string
            data: string
            value: string
            preventUi: boolean
        },
    ) {
        let account = await getAccount(terminal, args)
        const info = await account.getAccount()
        let accountAddress = await account.getAddress()

        const dataParams = account.contract.abi.data ?? []
        if (dataParams.length > 0) {
            const initData = await resolveParams(
                terminal,
                `\nDeploying initial data:\n`,
                dataParams,
                args.data ?? "",
                args.preventUi,
            )
            await account.free()
            account = new Account(account.contract, {
                client: account.client,
                signer: account.signer,
                initData,
            })

            accountAddress = await account.getAddress()
        }

        if (info.acc_type === AccountType.active) {
            throw new Error(`Account ${accountAddress} already deployed.`)
        }
        const { giver: giverInfo, name: networkName } =
            new NetworkRegistry().get(args.network)
        const topUpValue = parseNanoTokens(args.value)

        // Prepare an informative message in case of insufficient balance for deployment
        const howtoTopupMesssage = () =>
            giverInfo?.signer
                ? `You can use \`everdev contract deploy <file> -v <value>\` command to top it up`
                : `You have to provide enough balance before deploying in two ways: \n` +
                  ` - sending some value to this address or\n` +
                  ` - setting up a giver for the network with \`everdev network giver\` command.`

        if (topUpValue) {
            if (giverInfo) {
                const giver = await NetworkGiver.create(
                    account.client,
                    giverInfo,
                )
                giver.value = topUpValue
                await giver.sendTo(accountAddress, topUpValue)
                await giver.account.free()
            } else {
                throw new Error(
                    `A top-up was requested, but giver is not configured for the network ${networkName}\n` +
                        `You have to set up a giver for this network with \`everdev network giver\` command.`,
                )
            }
        } else {
            if (info.acc_type === AccountType.nonExist) {
                throw new Error(
                    `Account  ${accountAddress}  doesn't exist.\n${howtoTopupMesssage()}`,
                )
            }
        }

        const initFunctionName =
            args.function.toLowerCase() === "none"
                ? ""
                : args.function || "constructor"
        const initFunction = account.contract.abi.functions?.find(
            x => x.name === initFunctionName,
        )
        const initInput = await resolveParams(
            terminal,
            "\nParameters of constructor:\n",
            initFunction?.inputs ?? [],
            args.input,
            args.preventUi,
        )
        terminal.log("\nDeploying...")

        try {
            await account.deploy({
                initFunctionName: initFunction?.name,
                initInput,
            })
        } catch (err: any) {
            const isLowBalance =
                [407, 409].includes(
                    err?.data?.local_error?.code,
                ) /* low balance on real network */ ||
                ([407, 409].includes(err.code) &&
                    err.data?.local_error ===
                        undefined) /* low balance on node se */

            throw isLowBalance
                ? new Error(
                      `Account ${accountAddress} has low balance to deploy.\n` +
                          (topUpValue
                              ? `You sent amount which is too small`
                              : howtoTopupMesssage()),
                  )
                : err
        }

        terminal.log(`Contract is deployed at address: ${accountAddress}`)
        await account.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractTopUpCommand: Command = {
    name: "topup",
    alias: "t",
    title: "Top up account from giver",
    args: [infoFileArg, addressOpt, networkOpt, signerOpt, dataOpt, valueOpt],
    async run(
        terminal: Terminal,
        args: {
            file: string
            address: string
            network: string
            signer: string
            data: string
            value: string
        },
    ) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified")
        }
        const account = await getAccount(terminal, args)

        const network = new NetworkRegistry().get(args.network)
        const networkGiverInfo = network.giver
        if (!networkGiverInfo) {
            throw new Error(
                `Missing giver for the network ${network.name}.\n` +
                    `You have to set up a giver for this network with \`everdev network giver\` command.`,
            )
        }
        const giver = await NetworkGiver.create(
            account.client,
            networkGiverInfo,
        )
        const value = parseNanoTokens(args.value) ?? giver.value
        if (!value) {
            throw new Error(
                `Missing top-up value.\n` +
                    `You must specify a value with the option \`-v\` or\n` +
                    `set the default value for the giver with \`everdev network giver\` command.`,
            )
        }
        giver.value = value
        await giver.sendTo(await account.getAddress(), value)
        terminal.log(
            `${formatTokens(
                giver.value,
            )} were sent to address ${await account.getAddress()}`,
        )
        await giver.account.free()
        await account.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractRunCommand: Command = {
    name: "run",
    alias: "r",
    title: "Run contract deployed on the network",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            runSigner: string
            data: string
            address: string
            function: string
            input: string
            preventUi: boolean
        },
    ) {
        const account = await getAccount(terminal, args)
        const info = await account.getAccount()
        if (info.acc_type !== AccountType.active) {
            throw new Error(
                `Account ${await account.getAddress()} not deployed or frozen`,
            )
        }
        const { functionName, functionInput, signer } = await getRunParams(
            terminal,
            account,
            args,
        )
        terminal.log("\nRunning...")
        const result = await account.run(functionName, functionInput, {
            signer,
        })
        await logRunResult(terminal, result.decoded, result.transaction)
        await account.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractRunLocalCommand: Command = {
    name: "run-local",
    alias: "l",
    title: "Run contract locally on TVM",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            runSigner: string
            data: string
            address: string
            function: string
            input: string
            preventUi: boolean
        },
    ) {
        const account = await getAccount(terminal, args)

        await guardAccountIsActive(account)

        const { functionName, functionInput } = await getRunParams(
            terminal,
            account,
            args,
        )
        const accountWithoutSigner = new Account(account.contract, {
            client: account.client,
            address: await account.getAddress(),
        })
        const result = await accountWithoutSigner.runLocal(
            functionName,
            functionInput,
            {},
        )
        await logRunResult(terminal, result.decoded, result.transaction)
        await account.free()
        await accountWithoutSigner.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractRunExecutorCommand: Command = {
    name: "run-executor",
    alias: "e",
    title: "Emulate transaction executor locally on TVM",
    args: [
        abiFileArg,
        networkOpt,
        signerOpt,
        runSignerOpt,
        dataOpt,
        addressOpt,
        functionArg,
        inputOpt,
        preventUiOpt,
    ],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            runSigner: string
            data: string
            address: string
            function: string
            input: string
            preventUi: boolean
        },
    ) {
        const account = await getAccount(terminal, args)
        const { functionName, functionInput } = await getRunParams(
            terminal,
            account,
            args,
        )
        const result = await account.runLocal(functionName, functionInput, {
            performAllChecks: true,
        })
        await logRunResult(terminal, result.decoded, result.transaction)
        await account.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractDecodeAccountDataCommand: Command = {
    name: "decode-data",
    alias: "dd",
    title: "Decode data from a contract deployed on the network",
    args: [abiFileArg, networkOpt, addressOpt],
    async run(
        terminal: Terminal,
        args: {
            file: string
            network: string
            signer: string
            data: string
            address: string
        },
    ) {
        if (args.file === "" && args.address === "") {
            throw new Error("File argument or address option must be specified")
        }
        const { abi } = resolveContract(args.file).package
        if (abi.version === undefined || abi.version < "2.1") {
            throw new Error("This feature requires ABI 2.1 or higher")
        }
        const account = await getAccount(terminal, { ...args, signer: "" })
        await guardAccountIsActive(account)
        const { data } = await account.getAccount()
        const decoded = await account.client.abi.decode_account_data({
            abi: {
                type: "Contract",
                value: abi,
            },
            data,
        })
        terminal.log(
            `Decoded account data: ${JSON.stringify(decoded, undefined, 4)}`,
        )
        await account.free()
        account.client.close()
        TonClient.default.close()
    },
}

export const contractDecodeTvcCommand: Command = {
    name: "decode-tvc",
    alias: "dt",
    title: "Decode tvc into code, data, libraries and special options",
    args: [tvcFileArg],
    async run(
        terminal: Terminal,
        args: {
            file: string
        },
    ) {
        const decoded = await TonClient.default.boc.decode_tvc({
            tvc: resolveTvcAsBase64(args.file),
        })
        terminal.log(`Decoded TVC: ${JSON.stringify(decoded, undefined, 4)}`)
    },
}

const guardAccountIsActive = async (acc: Account) => {
    const { active, uninit, frozen } = AccountType
    const { acc_type: accType } = await acc.getAccount()
    if (accType === active) {
        return
    }
    const status =
        accType === uninit
            ? "is not initialized"
            : accType === frozen
            ? "is frozen"
            : "does not exist"
    throw Error(`Account ${await acc.getAddress()} ${status}`)
}

export const Contract: ToolController = {
    name: "contract",
    alias: "c",
    title: "Smart Contracts",
    commands: [
        contractInfoCommand,
        contractDecodeAccountDataCommand,
        contractDecodeTvcCommand,
        contractTopUpCommand,
        contractDeployCommand,
        contractRunCommand,
        contractRunLocalCommand,
        contractRunExecutorCommand,
    ],
}

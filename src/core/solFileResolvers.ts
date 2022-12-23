import fs from "fs"
import { ContractPackage } from "@eversdk/appkit"
import { findExisting } from "./utils"
import { SOLIDITY_FILE } from "../controllers/solidity"

type ResolvedContractPackage = {
    package: ContractPackage
    abiPath: string
    tvcPath?: string
}

export function resolveContract(filePath: string): ResolvedContractPackage {
    filePath = filePath.trim()
    const lowered = filePath.toLowerCase()
    let basePath
    if (
        lowered.endsWith(".tvc") ||
        lowered.endsWith(".abi") ||
        SOLIDITY_FILE.nameRegEx.test(lowered)
    ) {
        basePath = filePath.slice(0, -4)
    } else if (lowered.endsWith(".abi.json")) {
        basePath = filePath.slice(0, -9)
    } else {
        basePath = filePath
    }
    const tvcPath = findExisting([`${basePath}.tvc`])
    const abiPath =
        findExisting([`${basePath}.abi.json`, `${basePath}.abi`]) ?? ""
    const tvc = tvcPath
        ? fs.readFileSync(tvcPath).toString("base64")
        : undefined
    const abi =
        abiPath !== ""
            ? JSON.parse(fs.readFileSync(abiPath, "utf8"))
            : undefined
    if (!abi) {
        throw new Error("ABI file missing.")
    }
    return {
        package: {
            abi,
            tvc,
        },
        abiPath,
        tvcPath,
    }
}

export function resolveTvcAsBase64(filePath: string): string {
    const tvcPath = findExisting([filePath, `${filePath}.tvc`])
    if (tvcPath) {
        return fs.readFileSync(tvcPath).toString("base64")
    } else {
        throw Error(`File ${filePath} not exists`)
    }
}

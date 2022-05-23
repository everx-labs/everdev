import { everdevInit, everdevDone, everdevHome, writeTextFile } from ".."
import path from "path"
import fs from "fs"
import os from "os"

jest.setTimeout(100000)

test("init", () => {})

export function tempFolder(): string {
    const temp = path.resolve(everdevHome(), "_temp")
    if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp, { recursive: true })
    }
    return temp
}

export function writeTempText(name: string, text: string): string {
    const filePath = path.resolve(tempFolder(), name)
    writeTextFile(filePath, text)
    return filePath
}

export function copyToTemp(source: string): string {
    const filePath = path.resolve(tempFolder(), path.basename(source))
    fs.copyFileSync(source, filePath)
    return filePath
}

export function writeTempJson(name: string, json: unknown): string {
    return writeTempText(name, JSON.stringify(json, undefined, "    "))
}

export function deleteFiles(files: string[]) {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    })
}

export function initTests() {
    const home = path.resolve(os.homedir(), ".everdev_test")
    everdevInit({
        home,
    })
    deleteFolderRecursive(path.resolve(home, "_temp"))
    deleteFiles([
        path.resolve(home, "signer", "registry.json"),
        path.resolve(home, "network", "registry.json"),
        path.resolve(home, "se", "config.json"),
        path.resolve(home, ".lastrun"),
        path.resolve(home, ".latest"),
    ])
}

export function doneTests() {
    everdevDone()
}

export function deleteFolderRecursive(directoryPath: string) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach(file => {
            const curPath = path.join(directoryPath, file)
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(directoryPath)
    }
}

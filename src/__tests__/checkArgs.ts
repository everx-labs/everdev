import fs from "fs"
import path from "path"

import { doneTests, initTests, deleteFolderRecursive } from "./init"
import { StringTerminal, consoleTerminal, runCommand } from ".."

const outPath = path.resolve(__dirname, "..", "..", `${Date.now()}-tmp`)

beforeAll(initTests)
afterAll(doneTests)
beforeEach(() => deleteFolderRecursive(outPath))
afterEach(() => deleteFolderRecursive(outPath))

test("Should create HelloWallet.tvc in user defined output directory", async () => {
    await runCommand(consoleTerminal, "sol update", {})

    const solPath = path.resolve(
        __dirname,
        "..",
        "..",
        "contracts",
        "HelloWallet.sol",
    )

    const terminal = new StringTerminal()
    await runCommand(terminal, "sol compile", {
        file: solPath,
        outputDir: outPath,
    })
    expect(terminal.stderr.trim()).toEqual("")

    const tvcFile = path.resolve(outPath, "HelloWallet.tvc")
    expect(fs.existsSync(tvcFile)).toBeTruthy()
})

test("Should warn user to use options in camelCase", async () => {
    const solPath = path.resolve(
        __dirname,
        "..",
        "..",
        "contracts",
        "HelloWallet.sol",
    )
    const terminal = new StringTerminal()
    try {
        await runCommand(terminal, "sol compile", {
            file: solPath,
            "hello-world": "hi!",
        })
        throw Error("This function didn't throw")
    } catch (err: any) {
        expect(err.message).toMatch(/Unknow option: hello-world/)
    }
})

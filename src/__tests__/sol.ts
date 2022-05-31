import { copyToTemp, doneTests, initTests } from "./init"
import { consoleTerminal, runCommand, StringTerminal } from ".."
import path from "path"
import fs from "fs"

beforeAll(initTests)
afterAll(doneTests)

test("Hide linker output", async () => {
    await runCommand(consoleTerminal, "sol update", {})
    const terminal = new StringTerminal()
    const solPath = copyToTemp(
        path.resolve(__dirname, "..", "..", "contracts", "HelloWallet.sol"),
    )
    await runCommand(terminal, "sol compile", {
        file: solPath,
    })
    expect(terminal.stdout.trim()).toEqual("")
})

test("AST of all source files in a JSON", async () => {
    await runCommand(consoleTerminal, "sol update", {})
    const terminal = new StringTerminal()
    const solPath = path.resolve(
        __dirname,
        "..",
        "..",
        "contracts",
        "HelloWallet.sol",
    )
    const astPath = path.resolve(__dirname, "..", "..", "HelloWallet.ast.json")
    await runCommand(terminal, "sol ast --format json", {
        file: solPath,
    })
    const ast = fs.readFileSync(astPath, "utf-8")
    expect(ast.length).toBeGreaterThan(0)
    expect(typeof JSON.parse(ast)).toEqual("object")
})

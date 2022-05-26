import { CommandLine } from "../cli"
import { doneTests, initTests } from "./init"
import {
    Solidity,
    solidityCompileCommand,
    solidityCreateCommand,
} from "../controllers/solidity"

beforeAll(initTests)
afterAll(doneTests)

test("Shoud throw", async () => {
    const parser = new CommandLine()
    try {
        await parser.parse(["nono"])
    } catch (err) {
        expect(err.message).toMatch(/Unknown tool/)
    }
})

test("everdev --help", async () => {
    const parser = new CommandLine()
    await parser.parse(["--help"])
    expect(parser.args.help).toBe(true)
})

test("everdev sol", async () => {
    const parser = new CommandLine()
    await parser.parse(["sol"])
    const { controller, command, args } = parser
    expect(controller).toEqual(Solidity)
    expect(command).toBeUndefined()
    expect(args).toEqual({})
})

test("everdev sol compile, should throw", async () => {
    const parser = new CommandLine()
    try {
        await parser.parse(["sol", "compile"])
    } catch (err) {
        expect(err.message).toMatch(/Missing required file/)
    }
})

test("everdev sol compile a.sol", async () => {
    const parser = new CommandLine()
    await parser.parse(["sol", "compile", "a.sol"])
    const { controller, command, args } = parser
    expect(controller).toEqual(Solidity)
    expect(command).toEqual(solidityCompileCommand)
    expect(args).toEqual({
        code: false,
        file: "a.sol",
        outputDir: "",
    })
})

test("everdev sol compile a.sol b.sol --output-dir somedir", async () => {
    const parser = new CommandLine()
    await parser.parse([
        "sol",
        "compile",
        "a.sol",
        "b.sol",
        "--output-dir",
        "somedir",
    ])
    const { controller, command, args } = parser
    expect(controller).toEqual(Solidity)
    expect(command).toEqual(solidityCompileCommand)
    expect(args).toEqual({
        code: false,
        file: "a.sol b.sol",
        outputDir: "somedir",
    })
})

test("everdev create a.sol", async () => {
    const parser = new CommandLine()
    await parser.parse(["sol", "create", "a.sol"])
    const { controller, command, args } = parser
    expect(controller).toEqual(Solidity)
    expect(command).toEqual(solidityCreateCommand)
    expect(args).toEqual({
        name: "a.sol",
        folder: "/home/tiger/everdev",
    })
})

test("everdev create a.sol b.sol, should throw", async () => {
    const parser = new CommandLine()
    try {
        await parser.parse(["sol", "create", "a.sol", "b.sol"])
        const { controller, command, args } = parser
        throw Error("Shouldn't resolve!")
    } catch (err) {
        expect(err.message).toMatch(/Unexpected argument/)
    }
})

import { CommandLine } from "../cli"
import { doneTests, initTests } from "./init"
import {
    Solidity,
    solidityCompileCommand,
    solidityCreateCommand,
} from "../controllers/solidity"

import { NetworkTool, networkGiverCommand } from "../controllers/network"
beforeAll(initTests)
afterAll(doneTests)

test("Should throw", async () => {
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
        includePath: "node_modules",
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
        includePath: "node_modules",
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
        folder: process.cwd(),
    })
})

test("everdev create a.sol b.sol, should throw", async () => {
    const parser = new CommandLine()
    try {
        await parser.parse(["sol", "create", "a.sol", "b.sol"])
        throw Error("Shouldn't resolve!")
    } catch (err) {
        expect(err.message).toMatch(/Unexpected argument/)
    }
})

test("everdev network add giver with address in negative workchain", async () => {
    const parser = new CommandLine()
    await parser.parse([
        "network",
        "giver",
        "networkName",
        "-2:1111111111111111111111111111111111111111111111111111111111111111",
        "-s",
        "seGiver",
        "-t",
        "GiverV1",
    ])
    const { controller, command, args } = parser
    expect(controller).toEqual(NetworkTool)
    expect(command).toEqual(networkGiverCommand)
    expect(args).toEqual({
        name: "networkName",
        address:
            "-2:1111111111111111111111111111111111111111111111111111111111111111",
        signer: "seGiver",
        type: "GiverV1",
        value: "",
    })
})

test("everdev network add giver with address in positive workchain", async () => {
    const parser = new CommandLine()
    await parser.parse([
        "network",
        "giver",
        "networkName",
        "0:1111111111111111111111111111111111111111111111111111111111111111",
        "-s",
        "seGiver",
        "-t",
        "GiverV1",
    ])
    const { controller, command, args } = parser
    expect(controller).toEqual(NetworkTool)
    expect(command).toEqual(networkGiverCommand)
    expect(args).toEqual({
        name: "networkName",
        address:
            "0:1111111111111111111111111111111111111111111111111111111111111111",
        signer: "seGiver",
        type: "GiverV1",
        value: "",
    })
})

test("everdev network add giver with malformed address in negative workchain", async () => {
    const parser = new CommandLine()
    try {
        await parser.parse([
            "network",
            "giver",
            "networkName",
            "-1w:123",
            "-s",
            "seGiver",
            "-t",
            "GiverV1",
        ])
        throw Error("Shouldn't resolve!")
    } catch (err) {
        expect(err.message).toMatch(/Unknown option/)
    }
})

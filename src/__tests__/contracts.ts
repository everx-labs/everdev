import { doneTests, initTests } from "./init"
import path from "path"
import { ParamParser } from "../controllers/contract/param-parser"

beforeAll(initTests)
afterAll(doneTests)

function dataPath(name: string): string {
    return path.resolve(__dirname, "..", "..", "src", "__tests__", "data", name)
}

test("Contract alone args file", async () => {
    const file = dataPath("contracts-input-alone.json")
    const abi = { name: "a", type: "string[]" }
    const args = ParamParser.components(abi, `@${file}`)
    expect(args).toEqual([1, 2, 3])
})

test("Contract multi args file", async () => {
    const file = dataPath("contracts-input.json")
    const abi = { name: "a", type: "string[]" }
    const args = ParamParser.components(abi, `@${file}@test1`)
    expect(args).toEqual({ a: [1, 2, 3] })
    const args2 = ParamParser.components(abi, `@${file}@test2`)
    expect(args2).toEqual({ b: [1, 2, 3] })
    const args3 = ParamParser.components(abi, `@${file}@test2.b`)
    expect(args3).toEqual([1, 2, 3])
})

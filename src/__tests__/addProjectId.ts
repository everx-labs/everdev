import { transformEndpoint } from "../controllers/contract/accounts"
import { doneTests, initTests } from "./init"

beforeAll(initTests)
afterAll(doneTests)

test("Transform different endpoints. Add projectId", async () => {
    const endpoints = [
        "eri01.net.everos.dev",
        "https://eri01.net.everos.dev/",
        "eri01.net.everos.dev/",
        "https://eri01.net.everos.dev/graphql/",
        "eri01.net.everos.dev/graphql",
    ]
    const result = endpoints.map(transformEndpoint("myId"))
    expect(result[0]).toEqual("eri01.net.everos.dev/myId")
    expect(result[1]).toEqual("https://eri01.net.everos.dev/myId")
    expect(result[2]).toEqual("eri01.net.everos.dev/myId")
    expect(result[3]).toEqual("https://eri01.net.everos.dev/myId")
    expect(result[4]).toEqual("eri01.net.everos.dev/myId")
})
test("Transform different endpoints. Add void projectId", async () => {
    const endpoints = [
        "eri01.net.everos.dev",
        "https://eri01.net.everos.dev/",
        "eri01.net.everos.dev/",
        "https://eri01.net.everos.dev/graphql/",
        "eri01.net.everos.dev/graphql",
    ]
    const result = endpoints.map(transformEndpoint(undefined))
    expect(result[0]).toEqual("eri01.net.everos.dev")
    expect(result[1]).toEqual("https://eri01.net.everos.dev")
    expect(result[2]).toEqual("eri01.net.everos.dev")
    expect(result[3]).toEqual("https://eri01.net.everos.dev")
    expect(result[4]).toEqual("eri01.net.everos.dev")
})

import { doneTests, initTests, writeTempJson } from "./init"
import { consoleTerminal } from ".."
import { signerAddCommand } from "../controllers/signer"
import { SignerRegistry } from "../controllers/signer/registry"
import { TonClient } from "@eversdk/core"

beforeAll(initTests)
afterAll(doneTests)

test("Add signer with secret key", async () => {
    const keys = await TonClient.default.crypto.generate_random_sign_keys()
    await signerAddCommand.run(consoleTerminal, {
        name: "from_secret_key",
        secret: keys.secret,
    })
    expect(new SignerRegistry().get("from_secret_key").keys).toEqual(keys)
})

test("Add signer with keys file", async () => {
    const keys = await TonClient.default.crypto.generate_random_sign_keys()
    const keysPath = writeTempJson("keys.json", keys)
    await signerAddCommand.run(consoleTerminal, {
        name: "from_keys_file",
        secret: keysPath,
    })
    expect(new SignerRegistry().get("from_keys_file").keys).toEqual(keys)
})

test("Add signer with the same name should throw", async () => {
    const keys = await TonClient.default.crypto.generate_random_sign_keys()
    const keysPath = writeTempJson("keys.json", keys)
    expect(() =>
        signerAddCommand.run(consoleTerminal, {
            name: "from_keys_file",
            secret: keysPath,
        }),
    ).rejects.toThrow(/Signer with name "from_keys_file" already exists/)
})

test("Add signer with the same name and 'force' option", async () => {
    const keys = await TonClient.default.crypto.generate_random_sign_keys()
    const keysPath = writeTempJson("keys.json", keys)
    await signerAddCommand.run(consoleTerminal, {
        name: "from_keys_file",
        secret: keysPath,
        force: true,
    })
    expect(new SignerRegistry().get("from_keys_file").keys).toEqual(keys)
})

test("Add invalid keys from file", async () => {
    const keysPath = writeTempJson("keys.json", {
        public: "a1855789cdab95ba2776450aa0215f6a1f9442770e30d17c1d3589a3ef08d66b",
        secret: "0af4fb5e63d53211cb112512sb",
    })
    expect(() =>
        signerAddCommand.run(consoleTerminal, {
            name: "from_keys_file",
            secret: keysPath,
        }),
    ).rejects.toThrow(/Invalid keys file/)
})

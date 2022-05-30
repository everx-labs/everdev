import { doneTests, initTests, writeTempJson } from "./init"
import { consoleTerminal } from ".."
import { signerAddCommand } from "../controllers/signer"
import { SignerRegistry } from "../controllers/signer/registry"
import { TonClient } from "@tonclient/core"

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

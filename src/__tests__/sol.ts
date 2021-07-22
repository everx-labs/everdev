import {
    copyToTemp,
    doneTests,
    initTests,
} from "./init";
import {
    consoleTerminal,
    runCommand,
    StringTerminal,
} from "..";
import path from "path";

beforeAll(initTests);
afterAll(doneTests);

test("Hide linker output", async () => {
    await runCommand(consoleTerminal, "sol update", {});
    const terminal = new StringTerminal();
    const solPath = copyToTemp(path.resolve(__dirname, "..", "..", "contracts", "HelloWallet.sol"));
    await runCommand(terminal, "sol compile", {
        file: solPath,
    });
    expect(terminal.stdout.trim()).toEqual("");
});


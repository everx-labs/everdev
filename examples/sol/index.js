const { consoleTerminal, runCommand } = require("tondev");
const path = require("path");

async function main() {
    await runCommand(consoleTerminal, "sol compile", {
        file: path.resolve(__dirname, "Hello.sol")
    });
}

main();

const { consoleTerminal, runCommand } = require("everdev");
const path = require("path");

async function main() {
    await runCommand(consoleTerminal, "sol compile", {
        file: path.resolve(__dirname, "Hello.sol")
    });
}

main();

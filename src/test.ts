import { runCommand } from "./controllers";
import { consoleTerminal } from "./core/utils";
import path from "path";
import { tondevInit } from "./core";

export {controllers, runCommand} from "./controllers/index";

(async () => {
    tondevInit()
    await runCommand(consoleTerminal, "js wrap", {
        file: path.resolve(__dirname, "..", "contracts", "SafeMultisigWallet.abi.json"),
    });
})();


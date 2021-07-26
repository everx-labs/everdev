import {
    doneTests,
    initTests,
} from "./init";
import { runCommand } from "../controllers";
import { consoleTerminal } from "../core/utils";

beforeAll(initTests);
afterAll(doneTests);

test("Use custom docker image", async () => {
    await runCommand(consoleTerminal, "se set", {
        instance: "se1",
        image: "tonlabs/local-node:0.28.1",
    });
});

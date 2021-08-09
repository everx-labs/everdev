#!/usr/bin/env node

const { consoleTerminal } = require("./dist");
const cli = require("./dist/cli/index");
const { tondevInit, tondevDone } = require("./dist/core");

(async () => {
    try {
        tondevInit()
        await cli.run(consoleTerminal);
        tondevDone();
    } catch (err) {
        if (!(err instanceof Error)) {
            const {data, code} = err;
            err = new Error(err.message);
            err.code = code;
            err.data = data;
        }
        console.error(`${err}`);
        process.exit(1);
    }
})();

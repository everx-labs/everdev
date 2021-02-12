#!/usr/bin/env node

const cli = require("./dist/cli/index");

(async () => {
    try {
        await cli.run();
    } catch (err) {
        console.error(err.toString());
        process.exit(1);
    }
})();

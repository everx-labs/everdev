#!/usr/bin/env node

const cli = require("./dist/cli/index");

(async () => {
    try {
        await cli.run();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();

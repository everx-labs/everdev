# Use in JS applications

You can easily use everdev as a regular npm package in your JS applications.

Just add dependency into you `package.json`:

```shell
npm i -s everdev
```

And then run any command from everdev:

```js
const { consoleTerminal, runCommand } = require("everdev");
const path = require("path");

async function main() {
    await runCommand(consoleTerminal, "sol compile", {
        file: path.resolve(__dirname, "Hello.sol")
    });
}

main();
```

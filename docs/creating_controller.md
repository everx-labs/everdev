# Creating Controller

Currently all controllers must be implemented inside of the `tondev` package.

To create new controller:

- Clone `git@github.com:tonlabs/tondev.git`.
- Create and checkout branch for new controller.
- Create folder under `src/controllers`.
- Implement controller code.
- Include new controller in file `src/controllers/index.js`.
- Create pool request.

## What controller should and what shouldn't to do

Controller should:

- Exposes functionality to the user as a list of commands.
- Installs the required tool components on demand (on first usage).
- Starts and stops the tool components that acts like a demons.
- Defines three commands to control the tool version:
  - `version` to show the currently installed tool version;
  - `update` to update tool to the latest available version;
  - `use` to select the specified tool version as the current version.

Controller shouldn't:

- Implements tool functionality itself. Controller is a connector between the user and the existing development tool.
- Implements user interaction itself. All user interaction must be implemented exactly in the terms of tondev extensibility.

## Implementing Controller

Create folder for new controller:

```shell
mkdir src/controllers/foo
cd src/controllers/foo
```

Create `index.ts` with controller definition:

```ts
import { ToolController } from "../../core";
import { versionCommand } from "./version";
import { updateCommand } from "./update";
import { runCommand } from "./run";

export const Foo: ToolController = {
    name: "foo",
    title: "Foo Tool",
    commands: [
        versionCommand,
        updateCommand,
        runCommand,
    ],
};
```

Create `installer.ts` to implement all code related to the tool installation:

```ts
import path from "path";
import fs from "fs";
import { Terminal, tondevHome } from "../../core";

function fooHome() {
    return path.resolve(tondevHome(), "foo");
}

async function ensureInstalled(terminal: Terminal) {
}

export async function getVersion(): Promise<string> {
    return "1.0.0";
}

export async function updateVersion(terminal: Terminal) {
    if (fs.existsSync(fooHome())) {
        fs.rmdirSync(fooHome(), { recursive: true });
    }
    ensureInstalled(terminal);
}

export async function runFoo(terminal: Terminal, workDir: string, args: string[]): Promise<void> {
    ensureInstalled(terminal);
    terminal.log("Foo succeeded");
};
```

Create `version.ts` command handler:

```ts
import { getVersion } from "./installer";
import { Command, Terminal } from "../../core";

export const versionCommand: Command = {
    name: "version",
    title: "Show Foo Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await getVersion());
    },
};
```

Create `update.ts` command handler:

```ts
import { updateVersion } from "./installer";
import { Command, Terminal } from "../../core";

export const versionCommand: Command = {
    name: "update",
    title: "Update Foo Version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await updateVersion(terminal);
    },
};
```

Create `run.ts` command handler:

```ts
import { runFoo } from "./installer";
import { Command, Terminal } from "../../core";

export const runCommand: Command = {
    name: "run",
    title: "Run Foo",
    async run(terminal: Terminal, args: {}): Promise<void> {
        await runFoo(terminal, args);
    },
};
```

## Controller API Reference

You can find API reference in form of TSDoc in `src/core/index.ts`.

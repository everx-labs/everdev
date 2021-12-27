# Content Table

- [Content Table](#content-table)
- [Creating Controller](#creating-controller)
  - [What a controller should and what it shouldn't to do](#what-a-controller-should-and-what-it-shouldnt-to-do)
  - [How to implement a Controller](#how-to-implement-a-controller)
  - [Controller API Reference](#controller-api-reference)

# Creating Controller

Currently all the controllers must be implemented inside of the `everdev` package.

To create a new controller:

- Clone `git@github.com:tonlabs/everdev.git`.
- Create and checkout branch for the new controller.
- Create a folder under `src/controllers`.
- Implement the controller code.
- Include the new controller in file `src/controllers/index.js`.
- Create pull request.

## What a controller should and what it shouldn't to do

Controller should:

- Expose functionality to the user as a list of commands.
- Install the required tool components on demand (on first usage).
- Start and stop the tool components that acts like a demons.
- Define three commands to control the tool version:
  - `version` to show the currently installed tool version;
  - `update` to update the tool to the latest available version;
  - `use` to select the specified tool version as the current version.

Controller shouldn't:

- Implement tool functionality itself. Controller is a connector between the user and the existing development tool.
- Implement user interaction itself. All user interaction must be implemented exactly in the terms of everdev extensibility.

## How to implement a Controller

Create a folder for a new controller:

```shell
mkdir src/controllers/foo
cd src/controllers/foo
```

Create `index.ts` with the controller's definition:

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

Create `installer.ts` to implement all the code related to the tool installation:

```ts
import path from "path";
import fs from "fs";
import { Terminal, everdevHome } from "../../core";

function fooHome() {
    return path.resolve(everdevHome(), "foo");
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

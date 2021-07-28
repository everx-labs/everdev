import {
    Command,
    Terminal,
    Component,
} from "../../core";


import {components} from "./components";


export const tonsectlInstallCommand: Command = {
    name: "install",
    title: "Install TONSECTL dependenciesI",
    args: [],
    async run(terminal: Terminal) {
        await Component.ensureInstalledAll(terminal, components);
    },
};

export const tonsectlApiCommand: Command = {
    name: "api",
    title: "Start TONSECTL API without detach",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.ensureInstalledAll(terminal, components));
    },
};

export const tonsectlInitCommand: Command = {
    name: "init",
    title: "Start TONSE API service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["init"])
    },
};

export const tonsectlVersionCommand: Command = {
    name: "version",
    title: "Show version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["--version"])
    },
};

export const tonsectlStartCommand: Command = {
    name: "start",
    title: "Start service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["start"])
    },
};

export const tonsectlStatusCommand: Command = {
    name: "status",
    title: "Status of the service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["status"])
    },
};

export const tonsectlStopCommand: Command = {
    name: "stop",
    title: "Stop service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["stop"])
    },
};

export const tonsectlResetCommand: Command = {
    name: "reset",
    title: "Reset directory with local node",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["reset"])
    },
};

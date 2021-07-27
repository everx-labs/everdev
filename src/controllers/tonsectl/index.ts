import {
    Command,
    Component,
    Terminal,
    ToolController,
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
        await Component.ensureInstalledAll(terminal, components);
    },
};

export const tonsectlVersionCommand: Command = {
    name: "version",
    title: "Show version",
    async run(terminal: Terminal) {
       terminal.log(await terminal)
    },
};

export const tonsectlStartCommand: Command = {
    name: "start",
    title: "Start service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.ensureInstalledAll(terminal, components));
    },
};

export const tonsectlStatusCommand: Command = {
    name: "status",
    title: "Status of the service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.ensureInstalledAll(terminal, components));
    },
};

export const tonsectlStopCommand: Command = {
    name: "stop",
    title: "Stop service",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.ensureInstalledAll(terminal, components));
    },
};

export const tonsectlResetCommand: Command = {
    name: "reset",
    title: "Reset directory with local node",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.ensureInstalledAll(terminal, components));
    },
};

export const TONSECTL: ToolController = {
    name: "tonsectl",
    title: "TONSECTL",
    commands: [
        tonsectlInstallCommand,
        tonsectlApiCommand,
        tonsectlInitCommand,
        tonsectlVersionCommand,
        tonsectlStartCommand,
        tonsectlStatusCommand,
        tonsectlStopCommand,
        tonsectlResetCommand,

    ],
};

import {
    Command,
    Terminal,
    Component,
} from "../../core";


import {components} from "./components";
import {downloadBinaryFromGithub, TONSECTLRegistry} from "./registry";
import {tonsectlHome} from "./registry"

export const tonsectlSetCommand: Command = {
    name: "set",
    title: "Set TONSECTL version",
    args: [
        {
            name: "version",
            title: "TONSECTL version (Look available with version command )",
            type: "string",
            defaultValue: "0.28.0",

        }
    ],
    async run(terminal: Terminal,  args: {
        version: string,
    }): Promise<void> {
        const registry = new TONSECTLRegistry();
        await registry.setupConfig(terminal,args.version);
    },
};



export const tonsectlInstallCommand: Command = {
    name: "install",
    title: "Install TONSECTL dependencies",
    args: [],
    async run(terminal: Terminal, _args: {}): Promise<void> {
    const registry = new TONSECTLRegistry();
    var tonsectl_version = await registry.getVersion();
    var os = await registry.getOS();
    const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${tonsectl_version}/tonos-se-${os}`;
    await downloadBinaryFromGithub(terminal,url,tonsectlHome())
    await components.tonsectl.run(terminal,"./", ["install"])
    }

};

export const tonsectlUpdateCommand: Command = {
    name: "update",
    title: "Update TONSECTL version",
    args: [],
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await Component.updateAll(terminal, false, components);
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
    title: "Show SE Versions",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        const versions = await registry.getVersions();
        terminal.log(`InstalledVersion: ${(await registry.getVersion())}\nVersions from Github: ${versions}`);
    },
};

export const tonsectlTestCommand: Command = {
    name: "test",
    title: "Set TONSECTL version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        const latest_version = await registry.getLatestVersion();
        await registry.setupConfig(terminal,String(latest_version));
        terminal.log(latest_version)
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

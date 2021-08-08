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
            defaultValue: "0.28.6",


        },
        {
            name: "port",
            title: "TONSECTL version (Look available with version command )",
            type: "string",
            defaultValue: "80",


        }],
    async run(terminal: Terminal,  args: {
        version: string,
        port: string,
    }): Promise<void> {
        const registry = new TONSECTLRegistry();
        await registry.setupConfig(terminal,args.version,args.port);
    },
};



export const tonsectlInstallCommand: Command = {
    name: "install",
    title: "Install TONSECTL dependencies",
    args: [],
    async run(terminal: Terminal, _args: {}): Promise<void> {
    const registry = new TONSECTLRegistry();
    var tonsectl_version = await registry.getVersion(terminal);
    var os = await registry.getOS();
    var port = await registry.getPort()
    const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${tonsectl_version}/tonsectl_${os}`;
    await downloadBinaryFromGithub(terminal,url,tonsectlHome())
    await components.tonsectl.run(terminal,"./", [`install`,`${port}`])
    }

};

export const tonsectlUpdateCommand: Command = {
    name: "update",
    title: "Update TONSECTL version",
    args: [],
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        var tonsectl_current_version = await registry.getVersion(terminal);
        var tonsectl_latest_version = await registry.getLatestVersion();
        var os = await registry.getOS();
        var port = await registry.getPort()
        if (tonsectl_current_version !== tonsectl_latest_version){
            const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${tonsectl_latest_version}/tonsectl_${os}`;
            await downloadBinaryFromGithub(terminal,url,tonsectlHome())
            await components.tonsectl.run(terminal,"./", ["install",`${port}`])
            await registry.setupConfig(terminal,String(tonsectl_latest_version))
            terminal.log("The latest version of TONSECTL was installed")
        }else{
            terminal.log("Your version is latest")
        }
    }
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
        terminal.log(`InstalledVersion: ${(await registry.getVersion(terminal))}\nVersions from Github: ${versions}`);
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

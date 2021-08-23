import {Command, Terminal} from "../../../core";
import {ContainerStatus, DevDocker} from "../../../core/docker";
import {controlInstances} from "../installer";
import {ContainerInfo} from "dockerode";

async function writeEnterMessage(docker: DevDocker, terminal: Terminal, containerName: string) {
    const containerInfo : ContainerInfo | null = await docker.findContainerInfo(containerName);
    if (null !== containerInfo) {
        terminal.log(`Open in browser: http://localhost:${containerInfo.Ports[0].PublicPort}/`);
    }
}

export const startCommand: Command = {
    name: "start",
    title: "Start ExtraTON DeBrowser, default is 'latest'",
    args: [{
        isArg: true,
        name: 'version',
        type: 'string',
        title: 'ExtraTON DeBrowser version (semver compatible)',
        defaultValue: 'latest',
    }],
    async run(terminal: Terminal, args: { version: string }): Promise<void> {
        await controlInstances(async (docker, def) => {
            const containerInfo : ContainerInfo | null = await docker.findContainerInfo(def.containerName);
            if (DevDocker.isRunning(containerInfo)) {
                terminal.log('Error: Container is already running.');
            } else {
                if (null !== containerInfo && containerInfo.Image !== def.requiredImage) {
                    await docker.shutdownContainer(terminal, def, ContainerStatus.missing);
                }
                await docker.startupContainer(terminal, def, ContainerStatus.running);
                await writeEnterMessage(docker, terminal, def.containerName);
            }
        }, args.version);
    },
};

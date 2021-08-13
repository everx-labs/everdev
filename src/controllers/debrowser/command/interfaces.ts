import {Command, Terminal} from "../../../core";
import {DevDocker} from "../../../core/docker";
import {controlInstances} from "../installer";
import {ContainerInfo} from "dockerode";
import request from "request";

export const interfacesCommand: Command = {
    name: "interfaces",
    title: "Show list of implemented interfaces",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        await controlInstances(async (docker, def) => {
            const containerInfo : ContainerInfo | null = await docker.findContainerInfo(def.containerName);
            if (null !== containerInfo && DevDocker.isRunning(containerInfo)) {
                const url = `http://localhost:${containerInfo.Ports[0].PublicPort}/interfaces.json`;
                request({url, json: true}, function (error, response) {
                    if (null === error) {
                        terminal.log('Implemented interfaces:');
                        for (const ifc of response.body) {
                            terminal.log(` - ${ifc.name}`);
                        }
                    } else {
                        terminal.log(`Error: ${error}.`);
                    }
                });
            } else {
                terminal.log("Error: Container isn't running.");
            }
        });
    },
};

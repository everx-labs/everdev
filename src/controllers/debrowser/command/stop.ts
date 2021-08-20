import {Command, Terminal} from "../../../core";
import {ContainerStatus} from "../../../core/docker";
import {controlInstances} from "../installer";

export const stopCommand: Command = {
    name: "stop",
    title: "Stop ExtraTON DeBrowser",
    args: [],
    async run(terminal: Terminal): Promise<void> {
        await controlInstances(async (docker, def) => {
            await docker.shutdownContainer(terminal, def, ContainerStatus.created);
        });
    },
};

import {compareVersions, httpsGetJson} from "../../core/utils";
import {ContainerDef, DevDocker} from "../../core/docker";
import Dockerode from "dockerode";

const DOCKER_IMAGE_NAME = "extraton/extraton-debrowser";
const DOCKER_CONTAINER_NAME = "extraton-debrowser";

export async function getAvailableVersions(): Promise<string[]> {
    const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
    return (await httpsGetJson(url)).results.map((x: any) => x.name).sort(compareVersions);
}

function instanceContainerDef(version?: string): ContainerDef {
    const requiredImage = `${DOCKER_IMAGE_NAME}:${version}`;
    return {
        requiredImage,
        containerName: DOCKER_CONTAINER_NAME,
        createContainer(docker: DevDocker) {
            const ports: Dockerode.PortMap = {
                '80/tcp': [
                    {
                        HostIp: '',
                        HostPort: '8087/tcp',
                    },
                ],
            };
            return docker.client.createContainer({
                name: DOCKER_CONTAINER_NAME,
                Image: requiredImage,
                HostConfig: {
                    PortBindings: ports,
                },
            });
        }
    };
}

export async function controlInstances(
    control: (docker: DevDocker, def: ContainerDef) => Promise<void>,
    version?: string
): Promise<void> {
    const def: ContainerDef = instanceContainerDef(version);
    await control(new DevDocker(), def);
}

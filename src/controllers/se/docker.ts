/*
 * Copyright 2018-2020 TON DEV SOLUTIONS LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.  You may obtain a copy of the
 * License at: https://www.ton.dev/licenses
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 *
 */
import Dockerode, {
    Container,
    ContainerInfo,
    DockerVersion,
    Image,
    ImageInfo,
} from "dockerode";
import Docker from "dockerode";
import { Terminal } from "../../core";

import {
    progress,
    progressDone,
    progressLine,
    versionToNumber,
} from "../../core/utils";


export enum ContainerStatus {
    missing = 0,
    created = 1,
    running = 2,
}

export interface ContainerDef {
    requiredImage: string,
    containerName: string,

    createContainer(docker: DevDocker): Promise<Dockerode.Container>
}


class DevDocker {
    client: Dockerode;
    _images: ImageInfo[] | null;
    _containers: ContainerInfo[] | null;
    _onStartupImagesPassed: boolean;
    onStartupImages: ((images: ImageInfo[]) => void) | null;
    onBeforePull: ((repoTag: string) => Promise<void>) | null;

    constructor() {
        this.client = new Docker();
        this.onStartupImages = null;
        this.onBeforePull = null;
        this._onStartupImagesPassed = false;
        this._images = null;
        this._containers = null;
    }

    dropCache() {
        this._images = null;
        this._containers = null;
    }

    async getImageInfos(): Promise<ImageInfo[]> {
        if (!this._images) {
            const images = await this.client.listImages({ all: true });
            this._images = images;
            if (!this._onStartupImagesPassed) {
                this._onStartupImagesPassed = true;
                if (this.onStartupImages) {
                    this.onStartupImages(images);
                }
            }
            this._images = images;
        }
        return this._images || [];
    }

    async getContainerInfos(): Promise<ContainerInfo[]> {
        if (!this._containers) {
            this._containers = await this.client.listContainers({ all: true });
        }
        return this._containers || [];
    }

    async numericVersion(): Promise<number> {
        const version: DockerVersion = await this.client.version();
        return versionToNumber(version.Version);
    }

    async removeImages(terminal: Terminal, nameMatches: string[], containersOnly: boolean): Promise<void> {
        // Stop and remove containers that belongs to images
        const containerInfos = (await this.getContainerInfos()).filter((info) => {
            return nameMatches.find(match => DevDocker.containersImageMatched(info, match));
        });
        for (let i = 0; i < containerInfos.length; i += 1) {
            const info = containerInfos[i];
            progress(terminal, `Removing container [${DevDocker.containerTitle(info)}]`);
            const container = this.client.getContainer(info.Id);
            if (DevDocker.isRunning(info)) {
                await container.stop();
            }
            await container.remove();
            progressDone(terminal);
        }
        if (containersOnly) {
            return;
        }
        // Remove images
        const imageInfos = (await this.getImageInfos()).filter((info) => {
            return nameMatches.find(match => DevDocker.imageHasMatchedName(info, match));
        });
        for (let i = 0; i < imageInfos.length; i += 1) {
            const info = imageInfos[i];
            progress(terminal, `Removing image [${DevDocker.imageTitle(info)}]`);
            const image = this.client.getImage(info.Id);
            await image.remove();
            progressDone(terminal);
        }
    }

    async pull(terminal: Terminal, repoTag: string): Promise<Image> {
        if (this.onBeforePull) {
            await this.onBeforePull(repoTag);
        }
        const client = this.client;
        const title = `Pulling [${repoTag}]`;
        progress(terminal, title);
        const image: Image = await new Promise((resolve, reject) => {
            client.pull(repoTag, {}, function (err, stream) {
                if (!stream) {
                    reject(err);
                    return;
                }
                client.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(_err: any, output: any) {
                    resolve(output);
                }

                function onProgress(event: any) {
                    progressLine(terminal, `${title}... ${event.progress || ""}`);
                }
            });
        });
        progress(terminal, title);
        progressDone(terminal);
        return image;
    }

    async findImageInfo(name: string): Promise<(ImageInfo | null)> {
        return (await this.getImageInfos()).find(x => DevDocker.imageHasMatchedName(x, name)) || null;
    }

    async findContainerInfo(name: string): Promise<ContainerInfo | null> {
        return (await this.getContainerInfos()).find(x => DevDocker.hasName(x, name)) || null;
    }

    async shutdownContainer(terminal: Terminal, def: ContainerDef, downTo: ContainerStatus) {
        const info = await this.findContainerInfo(def.containerName);
        if (!info) {
            return;
        }
        if (downTo < ContainerStatus.running && DevDocker.isRunning(info)) {
            progress(terminal, `Stopping [${def.containerName}]`);
            await this.client.getContainer(info.Id).stop();
            progressDone(terminal);
            this.dropCache();
        }
        if (downTo < ContainerStatus.created) {
            progress(terminal, `Removing [${def.containerName}]`);
            await this.client.getContainer(info.Id).remove();
            progressDone(terminal);
            this.dropCache();
        }
    }

    async ensureImage(terminal: Terminal, requiredImage: string) {
        if (!(await this.findImageInfo(requiredImage))) {
            await this.pull(terminal, requiredImage);
            this.dropCache();
        }
    }

    async startupContainer(terminal: Terminal, def: ContainerDef, upTo: ContainerStatus) {
        let info: ContainerInfo | null = await this.findContainerInfo(def.containerName);
        let requiredImage = def.requiredImage;
        if (requiredImage === "") {
            if (info === null) {
                throw Error(`Container ${def.containerName} doesn't exists.`);
            }
            requiredImage = info.Image;
        }
        await this.ensureImage(terminal, requiredImage);
        if (upTo >= ContainerStatus.created && !info) {
            progress(terminal, `Creating ${def.containerName}`);
            await def.createContainer(this);
            progressDone(terminal);
            this.dropCache();
            info = await this.findContainerInfo(def.containerName);
        }
        if (upTo >= ContainerStatus.running && info && !DevDocker.isRunning(info)) {
            progress(terminal, `Starting ${def.containerName}`);
            await this.client.getContainer(info.Id).start();
            progressDone(terminal);
            this.dropCache();
        }
    }

    async shutdownContainers(terminal: Terminal, defs: ContainerDef[], downTo: ContainerStatus) {
        for (let i = 0; i < defs.length; i += 1) {
            await this.shutdownContainer(terminal, defs[i], downTo);
        }
    }

    async startupContainers(terminal: Terminal, defs: ContainerDef[], upTo: ContainerStatus) {
        for (let i = 0; i < defs.length; i += 1) {
            await this.startupContainer(terminal, defs[i], upTo);
        }
    }

    async ensureRunning(terminal: Terminal, def: ContainerDef): Promise<Container> {
        await this.startupContainer(terminal, def, ContainerStatus.running);
        const info = await this.findContainerInfo(def.containerName);
        return this.client.getContainer((info && info.Id) || def.containerName);
    }

    static hasName(container: ContainerInfo, name: string): boolean {
        const nameToFind = `/${name}`.toLowerCase();
        return !!(container.Names || []).find(n => n.toLowerCase() === nameToFind);
    }

    static imageTitle(info: ImageInfo): string {
        return DevDocker.imageNames(info)[0] || info.Id;
    }

    static containerTitle(info: ContainerInfo): string {
        return info.Names.map(name => name.startsWith("/") ? name.substr(1) : name).join(";");
    }

    // if match specified with tag compare exactly
    // if match specified without tag compare untagged names
    static imageNameMatched(imageName: string, match: string): boolean {
        imageName = imageName.toLowerCase();
        match = match.toLowerCase();
        const matchParts = match.split(":");
        if (matchParts.length > 1) {
            return imageName === match;
        }
        const imageParts = imageName.split(":");
        return imageParts[0] === matchParts[0];
    }

    static imageNames(info: ImageInfo): string[] {
        return [
            ...(info.RepoTags || []),
            ...(info.RepoDigests || []).map((digest) => {
                return digest.split("@").join(":");
            }),
        ];
    }

    static imageHasMatchedName(info: ImageInfo, match: string): boolean {
        return !!DevDocker.imageNames(info).find(name => this.imageNameMatched(name, match));
    }

    static isRunning(info: ContainerInfo | null): boolean {
        return !!info && info.State.toLowerCase() === "running";
    }

    static containersImageMatched(info: ContainerInfo, match: string): boolean {
        return this.imageNameMatched(info.Image, match);
    }
}


export {
    DevDocker,
};

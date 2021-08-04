import path from "path";
import fs from "fs";

import {
    Terminal,
    tondevHome,
} from "../../core";
import {
    compareVersionsDescending,
    httpsGetJson,
    userIdentifier,
    writeJsonFile,
} from "../../core/utils";
import {
    ContainerDef,
    ContainerStatus,
    DevDocker,


const TOOL_FOLDER_NAME = "tonsectl";

function tonsectlHome() {
    return path.resolve(tondevHome(), TOOL_FOLDER_NAME);
}

export enum SESourceType {
    TONSECTL_VERSION = "tonosectl-version",
}

export type SESource = {
    type: SESourceType.TONSECTL_VERSION,
    version: string,
};

export function seSourceVersion(version: string): SESource {
    return {
        type: SESourceType.TONSECTL_VERSION,
        version,
    };
}

function registryPath(): string {
    return path.resolve(tonsectlHome(), "config.json");
}


export class TONSECTLRegistry {

    static async getVersions(): Promise<string[]> {
        const url = `https://registry.hub.docker.com/v2/repositories/${DOCKER_IMAGE_NAME}/tags/`;
        return (await httpsGetJson(url)).results.map((x: any) => x.name).sort(compareVersionsDescending);
    }

    static async getLatestVersion(): Promise<string> {
        const versions = await TONSECTLRegistry.getVersions();
        const version = versions.shift();
        if (version && version.toLowerCase() !== "latest") {
            return version;
        }
        return versions.shift() ?? "";
    }
}

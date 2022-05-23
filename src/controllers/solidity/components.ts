import { Component } from "../../core"

const TOOL_FOLDER_NAME = "solidity"

export const components = {
    compiler: new Component(TOOL_FOLDER_NAME, "solc", {
        isExecutable: true,
    }),

    linker: new Component(TOOL_FOLDER_NAME, "tvm_linker", {
        isExecutable: true,
        resolveVersionRegExp: /[^0-9]*([0-9.]+)/,
    }),

    stdlib: new (class extends Component {
        getSourceName(version: string): string {
            return `${this.name}_${version.split(".").join("_")}.tvm.gz`
        }

        async resolveVersion(downloadedVersion: string): Promise<string> {
            return downloadedVersion
        }

        async loadAvailableVersions(): Promise<string[]> {
            return components.compiler.loadAvailableVersions()
        }
    })(TOOL_FOLDER_NAME, "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
        hidden: true,
    }),
}

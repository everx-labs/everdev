import path from "path";
import {
    Component,
    tondevHome,
} from "../../core";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

export const components = {
    compiler: new Component(solidityHome(), "solc", {
        executable: true,
    }),

    linker: new Component(solidityHome(), "tvm_linker", {
        executable: true,
        resolveVersionRegExp: /[^0-9]*([0-9.]+)/,
    }),

    stdlib: new class extends Component {
        getSourceName(version: string): string {
            return `${this.name}_${version.split(".").join("_")}.tvm.gz`;
        }

        async resolveVersion(downloadedVersion: string): Promise<string> {
            return downloadedVersion;
        }

        async loadAvailableVersions(): Promise<string[]> {
            return components.compiler.loadAvailableVersions();
        }
    }(solidityHome(), "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
    }),
};

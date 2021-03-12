import path from "path";
import fs from "fs";
import {
    Component,
    tondevHome,
} from "../../core";

function solidityHome() {
    return path.resolve(tondevHome(), "solidity");
}

//TODO: Remove this when stdlib will be under versioning.
const STDLIB_HACK_VERSION = "0.1.0";

export const components = {
    compiler: new Component(solidityHome(), "solc", {
        executable: true,
    }),

    linker: new Component(solidityHome(), "tvm_linker", {
        executable: true,
        extractCurrentVersionRegExp: /TVM linker\s*([0-9.]+)/,
    }),

    stdlib: new class extends Component {
        // TODO: support versioning
        getSourceName(_version: string): string {
            return `${this.name}.gz`;
        }

        // TODO: support versioning
        async getCurrentVersion(): Promise<string> {
            return fs.existsSync(this.path) ? STDLIB_HACK_VERSION : "";
        }

        // TODO: support versioning
        async loadAvailableVersions(): Promise<string[]> {
            return [STDLIB_HACK_VERSION];
        }
    }(solidityHome(), "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
    }),
};

import fs from "fs";
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
        extractCurrentVersionRegExp: /TVM linker\s*([0-9.]+)/,
    }),

    stdlib: new class extends Component {
        getSourceName(version: string): string {
            return `${this.name}_${version.split(".").join("_")}.tvm.gz`;
        }

        async getCurrentVersion(): Promise<string> {
            if (fs.existsSync(this.path)) {
                return components.compiler.getCurrentVersion();
            } else {
                return "";
            }
        }

        async loadAvailableVersions(): Promise<string[]> {
            return components.compiler.loadAvailableVersions();
        }
    }(solidityHome(), "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
    }),
};

import path from "path";
import fs from "fs";
import {
    tondevHome,
} from "../../core";
import {Component} from "./component";

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
        // TODO: support versioning
        getSourceName(_version: string): string {
            return this.name;
        }

        // TODO: support versioning
        async getCurrentVersion(): Promise<string> {
            return fs.existsSync(this.path) ? "1.0.0" : "";
        }

        // TODO: support versioning
        async loadAvailableVersions(): Promise<string[]> {
            return ["1.0.0"];
        }
    }(solidityHome(), "stdlib_sol", {
        targetName: "stdlib_sol.tvm",
    }),
};

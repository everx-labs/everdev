import * as os from "os";
import path from "path";
import { Component, tondevHome } from "../../core";

const p = os.platform();
let innerPath: string;
let targetName: string;
let ext: string;

if (p === "linux") {
    innerPath = "opt/work/llvm/install/bin/clang";
    targetName = "clang.tar";
    ext = p + ".tar.gz";
} else if (p === "darwin") {
    innerPath = "bin/clang";
    targetName = "clang.zip";
    ext = p + ".zip";
} else {
    innerPath = "bin/clang.exe";
    targetName = "clang.zip";
    ext = p + ".zip";
}

function clangHome() {
    return path.resolve(tondevHome(), "clang");
}

export const components = {
    clang: new (class extends Component {
        getSourceName(version: string): string {
            return `${this.name}/${this.name}-${version.split(".").join("_")}-${ext}`;
        }

        async resolveVersion(downloadedVersion: string): Promise<string> {
            return downloadedVersion;
        }
    })(clangHome(), "clang-for-tvm", {
        targetName,
        innerPath,
        executable: true,
    }),
};

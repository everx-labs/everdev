import * as os from "os";
import path from "path";
import { Component, tondevHome } from "../../core";

function clangHome() {
    return path.resolve(tondevHome(), "clang");
}

export const components = {
    clang: new (class extends Component {
        getSourceName(version: string): string {
            let ext = os.platform();
            ext += ext === "linux" ? ".tar.gz" : ".zip";
            return `${this.name}/${this.name}-${version.split(".").join("_")}-${ext}`;
        }

        async resolveVersion(downloadedVersion: string): Promise<string> {
            return downloadedVersion;
        }
    })(clangHome(), "clang-for-tvm", {
        targetName: "clang.tar",
        innerPath: "opt/work/llvm/install/bin/clang",
    }),
};

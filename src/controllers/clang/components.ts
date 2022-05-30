import * as os from "os"
import { Component } from "../../core"

const p = os.platform()
let innerPath: string
let targetName: string
let ext: string

if (p === "linux") {
    innerPath = "opt/work/llvm/install/bin/clang"
    targetName = "clang.tar"
    ext = p + ".tar.gz"
} else if (p === "darwin") {
    innerPath = "bin/clang"
    targetName = "clang.zip"
    ext = p + ".zip"
} else {
    innerPath = "bin/clang.exe"
    targetName = "clang.zip"
    ext = p + ".zip"
}

const TOOL_FOLDER_NAME = "clang"

export const components = {
    compiler: new (class extends Component {
        getSourceName(version: string): string {
            return `${this.name}/${this.name}-${version
                .split(".")
                .join("_")}-${ext}`
        }

        async resolveVersion(downloadedVersion: string): Promise<string> {
            return downloadedVersion
        }
    })(TOOL_FOLDER_NAME, "clang-for-tvm", {
        targetName,
        innerPath,
        isExecutable: true,
    }),
}

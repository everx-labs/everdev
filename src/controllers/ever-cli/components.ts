import { Component } from "../../core"

const TOOL_FOLDER_NAME = "ever-cli"

export const components = {
    tonoscli: new (class extends Component {
        getSourceName(version: string): string {
            return `ever-cli-${version.split(".").join("_")}-{p}.zip`
        }
    })(TOOL_FOLDER_NAME, "ever-cli", {
        resolveVersionRegExp: /tonos_cli\s+([0-9.]+)/,
        isExecutable: true,
        runGlobally: true,
    }),
}

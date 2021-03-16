import * as path from "path";
import {
    Component,
    tondevHome,
} from "../../core";

function tonoscliHome() {
    return path.resolve(tondevHome(), "tonos-cli");
}

export const components = {
    tonoscli: new class extends Component {
        getSourceName(version: string): string {
            return `tonos-cli-${version.split(".").join("_")}-{p}.zip`;
        }
    }(tonoscliHome(), "tonos-cli", {
        resolveVersionRegExp: /tonos_cli\s+([0-9.]+)/,
        executable: true,
        globally: true,
    }),
};


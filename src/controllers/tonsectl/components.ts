import { Component } from "../../core";
import os from "os";

const p = os.platform();
let innerPath: string;

if (p === "linux") {
    innerPath = "tonsectl";

} else if (p === "darwin") {
    innerPath = "tonsectl";

} else {
    innerPath = "tonsectl.exe";

}

const TOOL_FOLDER_NAME = "tonsectl";

export const components = {
    tonsectl: new class extends Component {
    }(TOOL_FOLDER_NAME, "tonsectl", {
        isExecutable: true,
        runGlobally: false,
        innerPath,
    }),
};


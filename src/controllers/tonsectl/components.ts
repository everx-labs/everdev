import { Component } from "../../core";
// import os from "os";

// const p = os.platform();
// let innerPath: string;
// let targetName: string;
// let ext: string;
//
// if (p === "linux") {
//     innerPath = "/usr/local/bin/tonsectl";
//     targetName = "tonsectl.tar";
//     ext = p + ".tar.gz";
// } else if (p === "darwin") {
//     innerPath = "/usr/local/bin/tonsectl";
//     targetName = "tonsectl.zip";
//     ext = p + ".zip";
// } else {
//     innerPath = "/usr/local/bin/tonsectl";
//     targetName = "tonsectl.zip";
//     ext = p + ".zip";
// }






const TOOL_FOLDER_NAME = "tonsectl";

export const components = {
    tonsectl: new class extends Component {
    }(TOOL_FOLDER_NAME, "tonsectl", {
        isExecutable: true,
        runGlobally: true,
    }),
};


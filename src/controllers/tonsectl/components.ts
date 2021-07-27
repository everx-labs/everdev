import {
    Component,
} from "./registry";

const TOOL_FOLDER_NAME = "tonsectl";

export const components = {
    tonsectl: new class extends Component {
    }(TOOL_FOLDER_NAME, "tonsectl", {
        resolveVersionRegExp: /tonsectl/,
        isExecutable: true,
        runGlobally: true,
    }),
};


import { Component } from "../../core";



const TOOL_FOLDER_NAME = "tonsectl";

export const components = {
    tonsectl: new class extends Component {
    }(TOOL_FOLDER_NAME, "tonsectl", {
        isExecutable: true,
        runGlobally: false,
    }),
};


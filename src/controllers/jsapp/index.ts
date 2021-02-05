import {createJsApp} from "./codeFactory";
import {ToolController} from "../../core";

export const JsApps: ToolController = {
    name: "js-apps",
    title: "JS Applications Helper",
    commands: [{
        name: "create-node",
        title: "Create TON JS App",
        args: [{
            isArg: true,
            name: "name",
            type: "string",
        }, {
            name: "folder",
            type: "folder",
        }],
        run: createJsApp,
    }],
};

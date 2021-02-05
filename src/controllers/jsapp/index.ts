import {createJsApp} from "./codeFactory";
import {ToolController} from "../../core";

export const JsApps: ToolController = {
    commands: [{
        name: "create-js-app",
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

import { Component } from "../../core"

const TOOL_FOLDER_NAME = "sold"

export const components = {
    driver: new Component(TOOL_FOLDER_NAME, "sold", {
        isExecutable: true,
    }),
}

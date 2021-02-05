import path from "path";
import os from "os";

export interface Terminal {
    write(text: string): void,
    log(...args: any[]): void,
}

export type BaseCommandArg = {
    name: string,
    title?: string,
    description?: string,
    defaultValue?: string,
    isArg?: boolean,
};

export type FileArg = BaseCommandArg & {
    type: "file",
    nameRegExp: RegExp,
}

export type FolderArg = BaseCommandArg & {
    type: "folder",
}

export type StringArg = BaseCommandArg & {
    type: "string",
}

export type CommandArg = FileArg | FolderArg | StringArg;

export interface Command {
    name: string,
    title: string,
    description?: string,
    args?: CommandArg[],

    run(terminal: Terminal, args: any): Promise<void>,
}

export interface ToolController {
    commands: Command[],
}

export function tondevHome() {
    return path.resolve(os.homedir(), ".tondev");
}


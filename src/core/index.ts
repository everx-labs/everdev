import path from "path";
import os from "os";

/**
 * Terminal object is implemented by `tondev` and passed to the controller's command handlers.
 * Command handler uses terminal to output some human readable information related to command execution.
 */
export interface Terminal {
    /**
     * Print line. Provided argument will be converted to strings and separated by space.
     * @param args values to print.
     */
    log(...args: any[]): void,
    /**
     * Prints text. No line feeds will be produced.
     * @param text Text that will be printed.
     */
    write(text: string): void,
    /**
     * Prints error text. In case of CLI this text will be printed to stderr.
     * @param text Error text.
     */
    writeError(text: string): void,
}

/**
 * Command argument.
 */
export type BaseCommandArg = {
    /**
     * Name of the command.
     */
    name: string,
    /**
     * Title of the argument.
     */
    title?: string,
    /**
     * Description of the argument.
     */
    description?: string,
    /**
     * Default value for the command. If missing then the user must specify value for this argument.
     */
    defaultValue?: string,
    /**
     * Determine that the arg is a CLI arg (not an option).
     */
    isArg?: boolean,
};

/**
 * Argument with path ti the file.
 */
export type FileArg = BaseCommandArg & {
    type: "file",
    /**
     * Determine files matched for this argument.
     */
    nameRegExp: RegExp,
}

/**
 * Command argument with path to the folder.
 */
export type FolderArg = BaseCommandArg & {
    type: "folder",
}

/**
 * String command argument.
 */
export type StringArg = BaseCommandArg & {
    type: "string",
}

/**
 * Command argument.
 */
export type CommandArg = FileArg | FolderArg | StringArg;

/**
 * Command definition.
 */
export interface Command {
    /**
     * Command name.
     */
    name: string,
    /**
     * Command Title. Used in CLI short help and as a menu titles in IDE.
     */
    title: string,
    /**
     * Description of the command.
     */
    description?: string,
    /**
     * Command argument definitions.
     */
    args?: CommandArg[],
    /**
     * Command handler.
     * @param terminal Terminal object provided by `tondev`.
     *   Handler must print all human readable output using this terminal.
     * @param args Actual command arguments provided by user according to argument definitions.
     */
    run(terminal: Terminal, args: any): Promise<void>,
}

/**
 * Interface to be implemented by every controller.
 */
export interface ToolController {
    /**
     * Tool name. This is an identifier. Used only in configs.
     */
    name: string,
    /**
     * Tool title. Human readable name of the tool.
     */
    title?: string,
    /**
     * Tool description.
     */
    description?: string,
    /**
     * Commands provided by tool controller.
     */
    commands: Command[],
}

/**
 * Home directory where tool must store all tool related resources.
 */
export function tondevHome() {
    return path.resolve(os.homedir(), ".tondev");
}


import path from "path"
import os from "os"
import { TonClient } from "@eversdk/core"
import { libNode } from "@eversdk/lib-node"

export { ComponentOptions, Component } from "./component"

export type EverdevOptions = {
    home?: string
}

/**
 * Terminal object is implemented by `everdev` and passed to the controller's command handlers.
 * Command handler uses terminal to output some human readable information related to command execution.
 */
export interface Terminal {
    /**
     * Print line. Provided argument will be converted to strings and separated by space.
     * @param args values to print.
     */
    log(...args: unknown[]): void

    /**
     * Prints text. No line feeds will be produced.
     * @param text Text that will be printed.
     */
    write(text: string): void

    /**
     * Prints error text. In case of CLI this text will be printed to stderr.
     * @param text Error text.
     */
    writeError(text: string): void
}

export type CommandArgVariant = {
    value: string
    description?: string
}

/**
 * Command argument.
 */
export type BaseCommandArg = {
    /**
     * Name of the command.
     */
    name: string
    /**
     * Short alias for an optional arg name.
     */
    alias?: string
    /**
     * Title of the argument.
     */
    title?: string
    /**
     * Description of the argument.
     */
    description?: string
    /**
     * Default value for the command. If missing then the user must specify value for this argument.
     */
    defaultValue?: string
    /**
     * Determine that the arg is a CLI arg (not an option).
     */
    isArg?: boolean
    /*
     * Gredy argument value can include several words
     */
    greedy?: boolean

    /**
     * Get available CLI argument variants
     */
    getVariants?(): CommandArgVariant[] | Promise<CommandArgVariant[]>
}

/**
 * Argument with path to the file.
 */
export type FileArg = BaseCommandArg & {
    type: "file"
    /**
     * Determine files matched for this argument.
     */
    nameRegExp: RegExp
}

/**
 * Command argument with path to the folder.
 */
export type FolderArg = BaseCommandArg & {
    type: "folder"
}

/**
 * String command argument.
 */
export type StringArg = BaseCommandArg & {
    type: "string"
}

/**
 * Boolean command argument.
 */
export type BooleanArg = BaseCommandArg & {
    type: "boolean"
}

/**
 * Command argument.
 */
export type CommandArg = FileArg | FolderArg | StringArg | BooleanArg

/**
 * Command definition.
 */
export interface Command {
    /**
     * Command name.
     */
    name: string
    /**
     * Command alias. Used in cli instead of full command name..
     */
    alias?: string
    /**
     * Command Title. Used in CLI short help and as a menu titles in IDE.
     */
    title: string
    /**
     * Description of the command.
     */
    description?: string
    /**
     * Command argument definitions.
     */
    args?: CommandArg[]

    /**
     * Command handler.
     * @param terminal Terminal object provided by `everdev`.
     *   Handler must print all human readable output using this terminal.
     * @param args Actual command arguments provided by user according to argument definitions.
     */
    run(terminal: Terminal, args: unknown): Promise<void>
}

type NameAlias = {
    name: string
    alias?: string
}

export function matchName(
    x: NameAlias,
    test: string | undefined | null,
): boolean {
    test = (test || "").toLowerCase()
    return x.name === test || x.alias === test
}

export function nameInfo(
    x: NameAlias,
    namePrefix = "",
    aliasPrefix = "",
): string {
    return x.alias
        ? `${namePrefix}${x.name}, ${aliasPrefix}${x.alias}`
        : `${namePrefix}${x.name}`
}

/**
 * Interface to be implemented by every controller.
 */
export interface ToolController {
    /**
     * Tool name. This is an identifier. Used only in configs.
     */
    name: string
    /**
     * Tool alias. Used in cli instead of full tool name..
     */
    alias?: string
    /**
     * Tool title. Human readable name of the tool.
     */
    title?: string
    /**
     * Tool description.
     */
    description?: string
    /**
     * Commands provided by tool controller.
     */
    commands: Command[]
}

const config = {
    home: path.resolve(os.homedir(), ".everdev"),
}

export function everdevInit(options?: EverdevOptions) {
    TonClient.useBinaryLibrary(libNode)
    config.home = options?.home ?? config.home
}

export function everdevDone() {
    TonClient.default.close()
}

/**
 * Home directory where tool must store all tool related resources.
 */
export function everdevHome() {
    return config.home
}

export async function getArgVariants(
    arg: CommandArg,
): Promise<CommandArgVariant[]> {
    return arg.getVariants === undefined ? undefined : arg.getVariants()
}

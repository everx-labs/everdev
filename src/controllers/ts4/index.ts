import path from 'path'
import { Command, Component, Terminal, ToolController } from '../../core'
import { components } from './components'

export const ts4VersionCommand: Command = {
    name: "version",
    title: "Show installed and available versions",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        terminal.log(await Component.getInfoAll(components));
    },
}

export const ts4InstallCommand: Command = {
    name: "install",
    title: "Install latest release of TestSuite4",
    args: [],
    async run(terminal: Terminal) {
        await Component.ensureInstalledAll(terminal, components)
    },
}

export const ts4UpdateCommand: Command = {
    name: "update",
    title: "Update to the latest version",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await Component.updateAll(terminal, true, components)
    },
}

export const ts4RunCommand: Command = {
    name: 'run',
    title: 'Run TestSuite4\'s test',
    args: [{
        isArg: true,
        name: 'file',
        type: 'file',
        title: 'Test',
        nameRegExp: /\.py$/i,
    }],
    async run(terminal: Terminal, args: { file: string }): Promise<void> {
        const ext = path.extname(args.file)
        if (ext !== ".py") {
            terminal.log(`Choose TestSuite4 test.`)
            return
        }
        await Component.ensureInstalledAll(terminal, components)
        const fileDir = path.dirname(args.file)
        const fileName = path.basename(args.file)

        await components.ts4.run(terminal, fileDir, [fileName])
    },
}

export const TestSuite4: ToolController = {
    name: "ts4",
    title: "TestSuite4 framework",
    commands: [ts4VersionCommand, ts4InstallCommand, ts4UpdateCommand, ts4RunCommand],
}

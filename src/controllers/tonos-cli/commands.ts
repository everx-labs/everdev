import { Command, Terminal } from '../../core'
import { tonosInfo, tonosEnsureInstalled, installVersion } from './installer'

export const tonosInstallCommand: Command = {
    name: 'install',
    title: 'Install latest stable TON OS CLI',
    args: [],
    async run(terminal: Terminal) {
        await tonosEnsureInstalled(terminal)
    },
}

export const tonosSetCommand: Command = {
    name: 'set',
    title: 'Change installed version',
    args: [
        {
            name: 'version',
            title: 'version to install (e.g. 0.8.1 or latest)',
            type: 'string',
            defaultValue: 'latest',
        },
    ],
    async run(terminal: Terminal, args: { version: string }): Promise<void> {
        await installVersion(terminal, args.version)
    },
}

export const tonosUpdateCommand: Command = {
    name: 'update',
    title: 'Update to the latest version',
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await installVersion(terminal, 'latest')
    },
}

export const tonosVersionCommand: Command = {
    name: 'version',
    title: 'Show installed and available versions',
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await tonosInfo(terminal)
    },
}

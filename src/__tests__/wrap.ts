import path from 'path'

import { doneTests, initTests, deleteFiles } from './init'
import { StringTerminal, runCommand } from '..'

beforeAll(initTests)
afterAll(doneTests)

test('Shoud create HelloWallet.abi.json file', async () => {
    const solPath = path.resolve(__dirname, '..', '..', 'contracts', 'HelloWallet.sol')
    const terminal = new StringTerminal()
    await runCommand(terminal, 'sol compile', {
        file: solPath,
    })
    expect(terminal.stderr.trim()).toEqual('')
})

test('Shoud create HelloWalletContract.js file', async () => {
    const wrappedJs = path.resolve(__dirname, '..', '..', 'HelloWalletContract.js')
    deleteFiles([wrappedJs])

    const terminal = new StringTerminal()
    await runCommand(terminal, 'js wrap', {
        file: path.resolve(__dirname, '..', '..', 'HelloWallet.abi.json'),
    })
    expect(terminal.stderr.trim()).toEqual('')

    const { HelloWalletContract } = await import(wrappedJs)
    expect(typeof HelloWalletContract).toEqual('object')

    deleteFiles([wrappedJs])
})

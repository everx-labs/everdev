# EverDev
**Everscale Development Environment**

[NPM package](https://www.npmjs.com/package/everdev)

[Quick Start](docs/guides/quick_start.md)

**Get quick help in our telegram channel:**

[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ever_sdk)

## Content Table

- [EverDev](#everdev)
  - [Content Table](#content-table)
  - [What is EverDev?](#what-is-everdev)
    - [Use-cases](#use-cases)
    - [What tools does it support?](#what-tools-does-it-support)
  - [Quick Start](#quick-start)
  - [Working with DevNet](#working-with-devnet)
  - [EverDev Extensibility](#everdev-extensibility)
  - [Troubleshooting](#troubleshooting)

## What is EverDev?

EverDev is a Node.js package with CLI interface that allows to perform the following use-cases from the single interface for Developer:

### Use-cases

- Easily manage all the core [Ever OS Developer Tools](https://everos.dev/)
- Configure networks (including Local Blockchain, Developer Network, Everscale (main) network): add, configure giver;
- Manage keys: add, remove
- Work with Everscale blockchain from CLI

Also, this project serves as a backend for [EverDev VS Code extension](https://github.com/tonlabs/everdev-vscode).

### What tools does it support?

Components are downloaded and installed automatically for the target platform upon the first request.

- [Solidity Compiler](docs/command-line-interface/solidity.md)

- [C/C++ Compiler](docs/command-line-interface/c.md)

- [Contract Management Tool](docs/command-line-interface/contract-management.md) - Work with your contracts from CLI. Deploy and run your contracts with convenient CLI commands.

- [Network Tool](docs/command-line-interface/network-tool.md) - manage your networks: add, remove, configure givers.

- [Signer Tool](docs/command-line-interface/signer-tool.md) - manage your keys and seedphrases: create your secret once and use it via alias with Contract Management Tool. Really easy.

- [Evernode Platform: Startup Edition](docs/command-line-interface/evernode-platform-startup-edition-se.md) – Local blockchain for development and testing

- [Debot Browser](docs/command-line-interface/debrowser.md) - Web debot browser. For now, Extraton Debot Browser is supported. Support of Surf Debot Browser is coming.

- [TestSuite4](docs/command-line-interface/testsuite4.md) – Python lightweight framework for contract testing.

- [tonos-cli](https://github.com/tonlabs/tonos-cli) – Command line tool for multisigwallet management and staking, includes CLI Debot Browser. EverDev helps with installation and version management.

EverDev can be extended with other tools following the [instructions of integration](#everdev-extensibility).

## Quick Start

Get your hands dirty with our great tools:)
Follow the [Quick Start](docs/guides/quick-start.md) to get on board of Ever OS Development ASAP!

## Command Line Interface
### Quick start

Start testing your contracts without any delay with this guide. It will help you get test tokens in Developer Network, prepare your environment and test your first contract. [Test my first contract!](docs/guides/work-with-contracts.md)

### General command syntax

```shell
everdev <tool> <command> ...args
```

Some tools (network, signer, contract, js) and commands have short aliases. For example instead of using `everdev network list` you can use `everdev n l` and even shorter `everdev nl`.
  
Explore the detailed description of command line interface in the corresponding [section](docs/command-line-interface).
  
## Working with DevNet

Read how to deploy and configure your own Giver in DevNet in a separated guide: [Working with DevNet](docs/guides/work-with-devnet.md).

## EverDev Extensibility

TON Dev Environment is an integration point for development tools related to Everscale Blockchain.

There are two kind of software connected to EverDev:

- Development tools such as a compilers, networks, debuggers and so on.
- User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/guides/creating-controller.md)

## Troubleshooting

If you encountered any problem try to seek the solution in [Troubleshooting Notes](docs/troubleshooting.md). If it didn't help - please, ask in our [telegram channel](https://t.me/ton_sdk).

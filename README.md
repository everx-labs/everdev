# About EverDev

**Everscale Development Environment**
# [Quick Start](docs/guides/quick-start.md)

**Get quick help in our telegram channel:**
[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ever\_sdk)

EverDev is a Node.js package with CLI interface that allows to set up developer environment and work with everscale blockchain. 

[NPM package](https://www.npmjs.com/package/everdev)

## Use-cases

* Easily manage(install, update) all the core [Ever OS Developer Tools](https://everos.dev)
* Configure networks (including Local Blockchain, Developer Network, Everscale (main) network): add, configure giver contract;
* Manage keys: add, remove
* Work with blockchain from CLI
  


- [About EverDev](#about-everdev)
- [Quick Start](#quick-start)
  - [Use-cases](#use-cases)
- [Command Line Interface](#command-line-interface)
  - [General command syntax](#general-command-syntax)
  - [Solidity Compiler](#solidity-compiler)
  - [C/C++ Compiler](#cc-compiler)
  - [Network Tool](#network-tool)
  - [Signer Tool](#signer-tool)
  - [Contract Management Tool](#contract-management-tool)
  - [Evernode Simple Emulator (local blockchain)](#evernode-simple-emulator-local-blockchain)
  - [Debot Browser](#debot-browser)
  - [TestSuite4](#testsuite4)
  - [tonos-cli](#tonos-cli)
- [Cookbook](#cookbook)
  - [Working with DevNet](#working-with-devnet)
- [Troubleshooting](#troubleshooting)
- [EverDev Extensibility](#everdev-extensibility)

# Command Line Interface

Components are downloaded and installed automatically for the target platform upon the first request.

## General command syntax

```shell
everdev <tool> <command> ...args
```

Some tools (network, signer, contract, js) and commands have short aliases. For example instead of using `everdev network list` you can use `everdev n l` and even shorter `everdev nl`.

## [Solidity Compiler](docs/command-line-interface/solidity.md)
## [C/C++ Compiler](docs/command-line-interface/c.md)
## [Network Tool](docs/command-line-interface/network-tool.md) 
## [Signer Tool](docs/command-line-interface/signer-tool.md) 
##  [Contract Management Tool](docs/command-line-interface/contract-management.md)

## [Evernode Simple Emulator (local blockchain)](docs/command-line-interface/evernode-platform-startup-edition-se.md) 
## [Debot Browser](docs/command-line-interface/debrowser.md) 
## [TestSuite4](docs/command-line-interface/testsuite4.md) 
## [tonos-cli](https://github.com/tonlabs/tonos-cli) 

EverDev can be extended with other tools following the [instructions of integration](#everdev-extensibility).


# Cookbook
## Working with DevNet

Read how to deploy and configure your own Giver in DevNet in a separated guide: [Working with DevNet](docs/guides/work-with-devnet.md).

# Troubleshooting

If you encountered any problem try to seek the solution in [Troubleshooting Notes](docs/troubleshooting.md). If it didn't help - please, ask in our [telegram channel](https://t.me/ever\_sdk).

# EverDev Extensibility

TON Dev Environment is an integration point for development tools related to Everscale Blockchain.

There are two kind of software connected to EverDev:

* Development tools such as a compilers, networks, debuggers and so on.
* User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/guides/creating-controller.md)
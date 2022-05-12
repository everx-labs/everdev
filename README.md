# About EverDev

**Everscale Development Environment**

**Get quick help in our telegram channel:**
[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ever\_sdk)

EverDev is a Node.js package with CLI interface that allows to set up developer environment and work with everscale blockchain. 

[NPM package](https://www.npmjs.com/package/everdev)

## Use-cases

* Easily manage(install, update) all the core [Ever OS Developer Tools](https://everos.dev)
* Configure networks (including Local Blockchain, Developer Network, Everscale (main) network): add, configure giver contract;
* Manage keys: add, remove
* Work with blockchain from CLI
  
# [Quick Start](docs/guides/quick-start.md)

- [About EverDev](#about-everdev)
  - [Use-cases](#use-cases)
- [Quick Start](#quick-start)
- [Command Line Interface](#command-line-interface)
  - [General command syntax](#general-command-syntax)
  - [Solidity Compiler](#solidity-compiler)
  - [C/C++ Compiler](#cc-compiler)
  - [Network Tool - manage your networks: add, remove, configure givers.](#network-tool---manage-your-networks-add-remove-configure-givers)
  - [Signer Tool - manage your keys and seedphrases: create your secret once and use it via alias with Contract Management Tool. Really easy.](#signer-tool---manage-your-keys-and-seedphrases-create-your-secret-once-and-use-it-via-alias-with-contract-management-tool-really-easy)
  - [Contract Management Tool - Work with your contracts from CLI. Deploy and run your contracts with convenient CLI commands.](#contract-management-tool---work-with-your-contracts-from-cli-deploy-and-run-your-contracts-with-convenient-cli-commands)
  - [Evernode Platform: Simple Emulator – Local blockchain for development and testing](#evernode-platform-simple-emulator--local-blockchain-for-development-and-testing)
  - [Debot Browser - Web debot browser. For now, Extraton Debot Browser is supported. Support of Surf Debot Browser is coming.](#debot-browser---web-debot-browser-for-now-extraton-debot-browser-is-supported-support-of-surf-debot-browser-is-coming)
  - [TestSuite4 – Python lightweight framework for contract testing.](#testsuite4--python-lightweight-framework-for-contract-testing)
  - [tonos-cli – Command line tool for multisigwallet management and staking, includes CLI Debot Browser. EverDev helps with installation and version management.](#tonos-cli--command-line-tool-for-multisigwallet-management-and-staking-includes-cli-debot-browser-everdev-helps-with-installation-and-version-management)
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
## [Network Tool](docs/command-line-interface/network-tool.md) - manage your networks: add, remove, configure givers.
## [Signer Tool](docs/command-line-interface/signer-tool.md) - manage your keys and seedphrases: create your secret once and use it via alias with Contract Management Tool. Really easy.
##  [Contract Management Tool](docs/command-line-interface/contract-management.md) - Work with your contracts from CLI. Deploy and run your contracts with convenient CLI commands.

## [Evernode Platform: Simple Emulator](docs/command-line-interface/evernode-platform-startup-edition-se.md) – Local blockchain for development and testing
## [Debot Browser](docs/command-line-interface/debrowser.md) - Web debot browser. For now, Extraton Debot Browser is supported. Support of Surf Debot Browser is coming.
## [TestSuite4](docs/command-line-interface/testsuite4.md) – Python lightweight framework for contract testing.
## [tonos-cli](https://github.com/tonlabs/tonos-cli) – Command line tool for multisigwallet management and staking, includes CLI Debot Browser. EverDev helps with installation and version management.

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
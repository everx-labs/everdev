# TONDEV - Free TON Developer Environment

**Have a question? Get quick help in our channel:** 

[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ton_sdk)

# Content Table
- [What is TONDEV](#what-is-tondev)
    - [What components does it support?](#what-components-does-it-support)
- [Installation](#installation)
- [Supported commands](#supported-operations)
  - [Solidity](#solidity)
    - [Create your first contract](#create-your-first-contract)
    - [Compile](#compile)
    - [Version](#version)
    - [Update](#update)
  - [SDK](#sdk)
    - [Create Demo Project](#create-demo-project)
- [TONDEV Extensibility](#tondev-extensibility)
- [Backlog](#backlog)
  - [Solidity](#solidity)
  - [C/C++](#cc)
  - [TS4](#ts4)
  - [Network Support](#network-support)

# What is TONDEV?
TONDEV allows to easily download and install all the core TON.DEV components in background and use them from a single interface.

TONDEV functionality is accesible via CLI interface, it also can be included in Javascript projects as a package.
Also, this project serves as a backend for [TONDEV VS Code plugin](https://github.com/tonlabs/tondev-vscode). 

## What components does it support?

These components are supported or will be supported soon.  
Each component is downloaded and installed automatically for the target platform upon the first request.

- Solidity Compiler
- TON-SDK
- C/C++ Compiler - SOON
- TON OS Startup Edition – SOON
- TS – SOON
- tonos-cli (installation only) – SOON

# CLI Installation

## Dependencies

- [`Node.js`](https://nodejs.org/) >= 10.x installed
- (optional) [`Docker`](https://www.docker.com/)  >= 19.x installed
- Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).


**Run this command to install:**

```shell
npm i -g tondev
```


# Supported commands

```shell
% tondev
Use: tondev command args...
Version: 0.1.4
Commands:
    sol create   Create Solidity Contract
    sol compile  Compile Solidity Contract
    sol version  Show Solidity Version
    sol update   Update Solidity Compiler
    js create    Create TON JS App

```

**General command syntax**

```shell
tondev <tool> <command> ...args
```

# Solidity
## Create your first contract
This command creates a hello-world contract with comments that you get observe
and compile.

```shell
tondev sol create Contract
```

## Compile

This command compiles a selected contract. 
After successful compilation you get .abi.json and .tvc files that you can later use in your DApps to deploy and call contract methods.

```shell
tondev sol compile Contract.sol
```

## Version
This command shows the currently installed Solidity compiler version.

```shell
tondev sol version
```

## Update
This command updates the compiler - downloads the latest released binaries. 

```shell
tondev sol update
```

# TONDEV Extensibility

TON Dev Environment is an integration point for development tools related to TON Blockchain.

There are two kind of software connected to TONDev:

- Development tools such as a compilers, networks, debuggers and so on.
- User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/creating_controller.md)


# Backlog

## Solidity

- support other compilation and linking options

## C/C++

- Integrate C/C++ compiler - easily install and compile C/C++ contracts

## TS4

- debug contracts with TS framework and tools

## SDK
- Create and run Web Demo DApp with one command

## Network support

- connect to networks: main.ton.dev, net.ton.dev
- connect to local network
- connect to a custom network
- setup network giver
- deploy to network

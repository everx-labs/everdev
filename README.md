<p align="center"><a href="https://www.npmjs.com/package/tondev"><img src="assets/tondev-blue.png" height="60"/></a></p> 
<h1 align="center">TONDEV</h1>
<p align="center">Free TON Developer Environment</p>


**Get quick help in our telegram channel:**

[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ton_sdk) 

# TONDEV - Free TON Developer Environment

## Content Table

- [TONDEV - Free TON Developer Environment](#tondev---free-ton-developer-environment)
  - [Content Table](#content-table)
  - [What is TONDEV?](#what-is-tondev)
    - [What components does it support?](#what-components-does-it-support)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Update](#update)
  - [Use in JS applications](#use-in-js-applications)
  - [Command Line Interface](#command-line-interface)
    - [General command syntax](#general-command-syntax)
    - [Solidity](#solidity)
      - [Create your first contract](#create-your-first-contract)
      - [Compile](#compile)
      - [Version](#version)
      - [Update](#update-1)
    - [SDK](#sdk)
      - [Create Demo Project](#create-demo-project)
  - [TONDEV Extensibility](#tondev-extensibility)
  - [Backlog](#backlog)
    - [Solidity](#solidity-1)
    - [C/C++](#cc)
    - [TS4](#ts4)
    - [SDK](#sdk-1)
    - [Network support](#network-support)
    - [etc](#etc)

## What is TONDEV?

TONDEV an Node.js package with CLI interface that allows to easily download and install all the core TON.DEV components in background and use them from a single interface.
Also, this project serves as a backend for [TONDEV VS Code plugin](https://github.com/tonlabs/tondev-vscode).

### What components does it support?

These components are supported or will be supported soon.  
Each component is downloaded and installed automatically for the target platform upon the first request.

- [Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler)
- [TON-SDK](https://github.com/tonlabs/TON-SDK)
- [C/C++ Compiler](https://github.com/tonlabs/TON-Compiler) - SOON
- [TON OS Startup Edition](https://github.com/tonlabs/tonos-se) – SOON
- [TestSuite4](https://github.com/tonlabs/TestSuite4) – SOON
- [tonos-cli](https://github.com/tonlabs/tonos-cli) (installation only) – SOON

It can be extended with other tools following the [instructions of integration](#tondev-extensibility).

## Installation

### Prerequisites

- [`Node.js`](https://nodejs.org/) >= 10.x installed
- (optional) [`Docker`](https://www.docker.com/)  >= 19.x installed
- Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

### Install

```shell
npm i -g tondev
```

### Update

```shell
npm r -g tondev  
npm i -g tondev
```

## Use in JS applications

You can easily use tondev as a regular npm package in your JS applications.

Just add dependency into you `package.json`:

```shell
npm i -s tondev
```

And then run any command from tondev:

```js
const { consoleTerminal, runCommand } = require("tondev");
const path = require("path");

async function main() {
    await runCommand(consoleTerminal, "sol compile", {
        file: path.resolve(__dirname, "Hello.sol")
    });
}

main();
```

## Command Line Interface
### General command syntax

```shell
tondev <tool> <command> ...args
```

### Solidity

#### Create your first contract

This command creates a hello-world Solidity contract with comments that you can observe and compile.

```shell
tondev sol create Contract
```

#### Compile

This command compiles and links a selected Solidity contract. 
After successful compilation you get .abi.json and .tvc files that you can later [use in your DApps to deploy and call contract methods](https://docs.ton.dev/86757ecb2/p/07f1a5-add-contract-to-your-app-/b/462f33).

```shell
tondev sol compile Contract.sol
```

#### Version

This command shows the currently installed Solidity compiler version.

```shell
tondev sol version
```

#### Update

This command updates the compiler to the latest version.

```shell
tondev sol update
```

### SDK

#### Create Demo Project

This command creates a Node.js project with SDK latest dependencies and index.js file with main Client object creation.

```shell
tondev js create
```

## TONDEV Extensibility

TON Dev Environment is an integration point for development tools related to Free TON Blockchain.

There are two kind of software connected to TONDev:

- Development tools such as a compilers, networks, debuggers and so on.
- User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/creating_controller.md)

## Backlog

### Solidity

- syntax highlighting - Q1 2021
- support other compilation and linking options

### C/C++

- Integrate C/C++ compiler - easily install and compile C/C++ contracts

### TS4

- debug contracts with TS framework and tools

### SDK

- Create and run Web Demo DApp with one command

### Network support

Q1 2021:

- Connect to networks: main.ton.dev, net.ton.dev, local network
- Add a custom network
- Setup network giver
- Deploy to network

### etc

<p align="center"><a href="https://www.npmjs.com/package/tondev"><img src="assets/tondev.png" height="60"/></a></p> 
<h1 align="center">TONDEV</h1>
<p align="center">Free TON Development Environment</p>
</p>


**Get quick help in our telegram channel:**

[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ton_sdk) 

# TONDEV - Free TON Development Environment
Download and install all the core [TON.DEV](https://docs.ton.dev/86757ecb2/p/04a4ba-) components in one click and access them from a single interface.

## Content Table

- [TONDEV - Free TON Development Environment](#tondev---free-ton-development-environment)
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
      - [Set](#set)
    - [TON OS Startup Edition(SE)](#ton-os-startup-editionse)
      - [Start](#start)
      - [Version](#version-1)
      - [Set](#set-1)
      - [Reset](#reset)
      - [Update](#update-2)
      - [Stop](#stop)
      - [Info](#info)
    - [SDK](#sdk)
      - [See the list of available demo projects](#see-the-list-of-available-demo-projects)
      - [Install demo project](#install-demo-project)
      - [Create an empty project](#create-an-empty-project)
  - [TONDEV Extensibility](#tondev-extensibility)
  - [Backlog](#backlog)
    - [Debot](#debot)
    - [Solidity](#solidity-1)
    - [C/C++](#cc)
    - [TS4](#ts4)
    - [SDK](#sdk-1)
    - [Network support](#network-support)

## What is TONDEV?

TONDEV is a Node.js package with CLI interface that allows to easily download and install all the core TON.DEV components in background and use them from a single interface.
Also, this project serves as a backend for [TONDEV VS Code extension](https://github.com/tonlabs/tondev-vscode).

### What components does it support?

These components are supported or will be supported soon.  
Each component is downloaded and installed automatically for the target platform upon the first request.

- [Debot](https://github.com/tonlabs/debots) - **soon as part of tondev**  
- [Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler)
- [C/C++ Compiler](https://github.com/tonlabs/TON-Compiler) - **soon as part of tondev**  
- [TON OS Startup Edition](https://github.com/tonlabs/tonos-se) – 
  Local blockchain for development and testing
- [TestSuite4](https://github.com/tonlabs/TestSuite4) – **soon as part of tondev**  
  Python lightweight framework for Solidity testing 
- [tonos-cli](https://github.com/tonlabs/tonos-cli) – **soon as part of tondev** (installation only)     
  Command line tool for TON OS
- [TON-SDK](https://github.com/tonlabs/TON-SDK) -  **soon as part of tondev**   
  Core SDK Library features. 

TONDEV can be extended with other tools following the [instructions of integration](#tondev-extensibility). 

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

This command updates the compiler and linker to the latest version.

```shell
tondev sol update
```

#### Set

This command sets the compiler and linker versions and downloads them if needed.

```shell
tondev sol set --compiler 0.38.0 --linker 0.23.54
```

### TON OS Startup Edition(SE)

#### Start
This command starts the TON OS SE container (Docker must be launched). When executed for the first time downloads the latest SE image 
from dockerhub.

```shell
tondev se start
```

#### Version
This command shows the default TON OS SE version and list of other available versions. 

```shell
tondev se version

default: 0.24.12
Available Versions: 0, 0.24, 0.24.5, 0.24.6, 0.24.8, 0.24.9, 0.24.10, 0.24.11, 0.24.12, latest
```

#### Set
This command switches TON OS SE to the specified version and port and downloads it, if it is missing.   
**Attention! This command does not start TON OS SE, you need to run `start` command separately.**

```shell
tondev se set --version 0.24.11 --port 2020
```

#### Reset
This command resets the TON OS SE container (Docker must be launched) - restarts it from scratch with a clean database. 

```shell
tondev se reset
```
#### Update
This command downloads the latest TON OS SE image (Docker must be launched) and starts it. 

```shell
tondev se update
```

#### Stop
This command stops TON OS SE container. 

```shell
tondev se stop
```

#### Info
This command shows info about the downloaded versions. 

```shell
tondev se info

Instance  State    Version  GraphQL Port  ArangoDB Port  Docker Container            Docker Image
--------  -------  -------  ------------  -------------  --------------------------  --------------------------
default   running  0.24.12  2020                         tonlabs-tonos-se-ekaterina  tonlabs/local-node:0.24.12
```

### SDK

#### See the list of available demo projects

This command shows the list of available demo projects

```shell
tondev js demo 
```

Result:

```shell
$ tondev js demo
Demo   Description
-----  -------------------------
hello  Simple NodeJs Application
```

#### Install demo project

This command installs the specified demo project to the current directory. Proceed the instructions in the terminal to run it.

```shell
tondev js demo hello
```

#### Create an empty project

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

### Debot
- Support of debot test chat(browser for debot testing), 
- Debot publishing, etc.

### Solidity

- Support other compilation and linking options

### C/C++

- Integrate C/C++ compiler - easily install and compile C/C++ contracts

### TS4

- Debug contracts with TS framework and tools

### SDK

- Generate keys
- Calculate addresses
- Estimate deploy fees
- Deploy contracts,
- Run on-chain methods 
- Run get-methods
- Convert addresses, etc.

### Network support

Q1 2021:

- Connect to networks: main.ton.dev, net.ton.dev, local network
- Add a custom network
- Setup network giver

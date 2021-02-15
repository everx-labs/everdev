# TONDev

Easily prepare your local Free TON Developer Environment - download and install all the core Toolkit components and use them from the single CLI interface.

Join our telegram channel and find answers to your questions.  
[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/freeton_sdk)

## Toolkit components

Each component is downloaded automatically for the target platform upon the first request.

- Solidity Compiler
- C/C++ Compiler - SOON
- TON OS Startup Edition – SOON
- TS – SOON
- TON-SDK – SOON
- tonos-cli (installation only) – SOON

## Dependencies

- [`Node.js`](https://nodejs.org/) >= 10.x installed
- (optional) [`Docker`](https://www.docker.com/)  >= 19.x installed
- Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

## TONDev CLI

TONDev has a stock CLI utility that allows user to use all dev tools via single command line utility.

Install:

```shell
npm i -g tondev
```

Run:

```shell
tondev <tool> <command> ...args
```

## Create your first contract

Solidity:

```shell
tondev sol create Contract
```

## Compile

Solidity:

```shell
tondev sol compile Contract.sol
```

## Roadmap

### Solidity

- support other compilation and linking options

### C/C++

- Compile C/C++ contracts

### TS4

- debug contracts with TS framework and tools

### Network support

- connection to main.ton.dev, net.ton.dev and custom network configurations
- local network
- deploying to networks
- operating with TON blockchains including real blockchain networks, TONOS SE

## TONDEV Extensibility

TON Dev Environment is an integration point for development tools related to TON Blockchain.

There are two kind of software connected to TONDev:

- Development tools such as a compilers, networks, debuggers and so on.
- User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/creating_controller.md)

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
tondev sol demo
```

## Compile

Solidity:

```shell
tondev sol compile hello.sol
```

## Debug

### Create TS Rest

```shell
tondev ts create
```

### Run TS Test

```shell
tondev ts run
```

### Inspect TS Results

```shell
tondev ts inspect
```

## Run Local Node TONOS SE

Attention! Docker daemon must be running.

```shell
tondev se start
```

Go to the GraphQL playground to check that it launched successfully [http://localhost/graphql]

## TONDEV Extensibility

TON Dev Environment is an integration point for development tools related to TON Blockchain.

There are two kind of software connected to TONDev:

- Development tools such as a compilers, networks, debuggers and so on.
- User Interaction services such as an IDE plugins, CLI, GUI applications etc.

### Implementing Controller

### Implementing User Interaction

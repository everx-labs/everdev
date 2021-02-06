# About the project
Easily prepare your local Free TON Developer Environment - download and install all the core Toolkit components and use them from the 
single CLI interface.

# Need help? 
Join our telegram channel and find answers to your questions.  
[![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/freeton_sdk)


# Toolkit components
Each component is downloaded automatically for the target platform upon the first request.

- Solidity Compiler
- C/C++ Compiler - SOON
- TON OS Startup Edition
- TS4
- TON-SDK
- tonos-cli (installation only)


---
## Dependencies
- [`Node.js`](https://nodejs.org/) >= 10.x installed

- (optional) [`Docker`](https://www.docker.com/)  >= 19.x installed

## Install

```shell
$ npm install -g tondev
```

## Create your first contract
### Solidity 
```shell
$ tondev sol demo
```

## Compile 
### Solidity
```shell
$ tondev sol compile hello.sol
```

## Debug
### Create TS4 test 
```shell
$ tondev ts4 create
```
### Run it
```shell
$ tondev ts4 run
```

### Inspect results
```shell
$ tondev ts4 inspect
```

## Run Local Node TONOS SE
Attention! Docker daemon must be running. 
```shell
$ tondev nodese start
```
Go to the GraphQL playground to check that it lauched succesfully http://localhost/graphql 



# Contract Management

Contract management in everdev gives you the ability to easily deploy and run
your smart contracts on blockchain network(s).

## View contract info

This command displays a detailed summary for a contract. Contract ABI and TVC files are required to run it. Account address on the network is calculated from TVC and signer.

```bash
everdev contract info abi_filename
```

Result example:

```bash
$ everdev contract info SetcodeMultisigWallet.abi.json

Configuration

  Network: dev (eri01.net.everos.dev, rbx01.net.everos.dev, gra01.net.everos.dev)
  Signer:  test (public ad4bf7bd8da244932c52127a943bfa9217b6e215c1b3307272283c4d64f34486)

Address:   0:04dee1edc3f3d6b23529dcf5a6133627d06a39826bb14cc6334ffea272b15d50 (calculated from TVC and signer public)
Code Hash: e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208 (from TVC file)
Account:   Active
Balance:   1919381000 (≈ 2 tokens)
Details:   {
    "json_version": 5,
    "id": "0:04dee1edc3f3d6b23529dcf5a6133627d06a39826bb14cc6334ffea272b15d50",
    "workchain_id": 0,
    "boc": "te6ccgECZwEAGvQAAm/AAE3uHtw/PW ... 4MEDIoIQ/////byxkOAB8AH4R26Q3o (6912 bytes)",
    "last_paid": 1619084675,
    "bits": "0xcbc7",
    "cells": "0x67",
    "public_cells": "0x0",
    "last_trans_lt": "0x3baac81fb43",
    "balance": "0x72676e08",
    "code": "te6ccgECXwEAGcoAAib/APSkICLAAZ ... wQMighD////9vLGQ4AHwAfhHbpDeg= (6614 bytes)",
    "code_hash": "e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208",
    "data": "te6ccgEBBwEA7gAC361L972NokSTLF ... S/Xy90TNN3lUFM1WGpdlIcBQDAAAFA (249 bytes)",
    "data_hash": "ec28abd34e75f40a66561bdc06b436cbe24d10d5da7519a7d5db41026c67155d",
    "acc_type": 1,
    "acc_type_name": "Active"
}

```

Network, signer, data and account address parameters can be overridden with the following options:

```bash
$ everdev contract info -h
EverDev Version: 0.5.0
Use: everdev contract info file [options]
Args:
    file  ABI file
Options:
    --help, -h     Show command usage
    --network, -n  Network name
    --signer, -s   Signer key name
    --data, -d     Deploying initial data as name:value,...
                   This data is required to calculate the account address and to
                   deploy contract.
                   Array values must be specified as [item,...]. Spaces are not
                   allowed. If value contains spaces or special symbols "[],:"
                   it must be enclosed in "" or ''
    --address, -a  Account address
```

## Deploy contract

This command deploys a contract to the blockchain. Contract ABI and TVC files are required to run it.

```bash
everdev contract deploy abi_filename
```

Command displays deployment summary and requests constructor function parameters. Result example:

```bash
$ everdev contract deploy Contract.abi.json

Configuration

  Network: dev
  Signer:  sign1

Address: 0:0435cb4e70585759ac514bb9fd1770caeb8c3941d882b5a16d589b368cb49261

Enter constructor parameters

  param1 (uint256[]): value

Enter constructor parameters

  param2 (uint8): value

Deploying...
```

Deploy parameters can be specified in the deploy command with the following options:

```bash
$ everdev contract deploy -h
EverDev Version: 0.5.0
Use: everdev contract deploy file function [options]
Args:
    file      ABI file
    function  Function name
Options:
    --help, -h        Show command usage
    --network, -n     Network name
    --signer, -s      Signer key name
    --input, -i       Function parameters as name:value,...
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --data, -d        Deploying initial data as name:value,...
                      This data is required to calculate the account address and to
                      deploy contract.
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --value, -v       Deploying balance value in nano tokens
    --prevent-ui, -p  Prevent user interaction
                      Useful in shell scripting e.g. on server or in some
                      automating to disable waiting for the user input.
                      Instead everdev will abort with error.
                      For example when some parameters are missing in command line
                      then ton dev will prompt user to input values for missing
                      parameters (or fails if prevent-ui option is specified).

```

Example of a 2/3 multisig wallet deployment command:

```bash
everdev contract deploy SetcodeMultisigWallet.abi.json constructor -n dev -s sign1 -i owners:[0xad4bf7bd8da244932c52127a943bfa9217b6e215c1b3307272283c4d64f34486,0x5c2e348c5caeb420a863dc5e972f897ebe5ee899a6ef2a8299aac352eca4380a,0x8534c46f7a135058773fa1298cb3a299a5ddd40dafe41cb06c64f274da360bfb],reqConfirms:2
```

## Run contract deployed on the network

This command runs any function of a contract deployed on the blockchain. Contract ABI and TVC files are required to run it.

```bash
everdev contract run abi_filename
```

Command displays available functions and asks to select one. Result example:

```bash
$ everdev contract run Contract.abi.json

Configuration

  Network: dev
  Signer:  sign1

Address: 0:a4629d617df931d8ad86ed24f4cac3d321788ba082574144f5820f2894493fbc

Available functions:

  1) func1
  2) func2

  Select function (number): 2

Running...
```

Network, signer and account address parameters can be overridden and function parameters specified in the command with the following options:

```bash
$ everdev contract run -h
EverDev Version: 0.5.0
Use: everdev contract run file function [options]
Args:
    file      ABI file
    function  Function name
Options:
    --help, -h        Show command usage
    --network, -n     Network name
    --signer, -s      Signer key name
    --data, -d        Deploying initial data as name:value,...
                      This data is required to calculate the account address and to
                      deploy contract.
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --address, -a     Account address
    --input, -i       Function parameters as name:value,...
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --prevent-ui, -p  Prevent user interaction
                      Useful in shell scripting e.g. on server or in some
                      automating to disable waiting for the user input.
                      Instead everdev will abort with error.
                      For example when some parameters are missing in command line
                      then ton dev will prompt user to input values for missing
                      parameters (or fails if prevent-ui option is specified).
```

Example of creating a transaction and confirming it in a multisig wallet:

```
everdev contract run SetcodeMultisigWallet.abi.json submitTransaction -n dev -s sign1 -i dest:255a3ad9dfa8aa4f3481856aafc7d79f47d50205190bd56147138740e9b177f3,value:500000000,bounce:true,allBalance:false,payload:""
```

```
everdev contract run SetcodeMultisigWallet.abi.json confirmTransaction -n dev -a 0:04dee1edc3f3d6b23529dcf5a6133627d06a39826bb14cc6334ffea272b15d50 -s sign2 -i transactionId:6954030467099431873
```

To **execute a contract without signing**, use `signer none` option:

```
everdev contract run --signer none --address <address>
```

or

```
everdev contract run -s none -a <address>
```

In this case you have to explicitly specify address in run function because otherwise everdev may calculate a wrong address from empty pubkey.

To **execute a smart contract function with bytes argument**, the argument needs to be in hex format.

Example:

```
cat bytes | xxd -p | tr -d '\n' > bytes.hex
everdev contract run contract.abi.json function_name -i value:$(cat bytes.hex)
```

**Execute a smart contract function with structure arguments**:

```
everdev contract run shapes.tvc \
    savePoint \
    --address 0:540c1837656674d548c934258ddec9b5fd11b543da977b0016c14b5650bc7eb5 \
    --input '{ "point": { "color": "red", "center": { "x": 1, "y": 2 } } }'
```

**or with an array of structures:**

```
everdev contract run shapes.tvc \
    savePoints \
    --address 0:540c1837656674d548c934258ddec9b5fd11b543da977b0016c14b5650bc7eb5 \
    --input \
        '{ "points": [
                { "color": "pink", "center": { "x": 4, "y": 5 }},
                { "color": "gray", "center": { "x": 6, "y": 7 }}
        ]}'
```

#### Run contract locally on TVM

This command downloads a contract and runs it locally on TVM. Contract ABI and TVC files are required to run it.

```bash
everdev contract run-local abi_filename
```

Command displays available functions and asks to select one. Result example:

```bash
$ everdev contract run-local Contract.abi.json
Configuration

  Network: dev
  Signer:  sign1

Address: 0:a4629d617df931d8ad86ed24f4cac3d321788ba082574144f5820f2894493fbc

Available functions:

  1) func1
  2) func1

  Select function (number):
```

Network, signer and account address parameters can be overridden and function parameters specified in the command with the following options:

```bash
$ everdev contract run-local -h
EverDev Version: 0.5.0
Use: everdev contract run-local file function [options]
Args:
    file      ABI file
    function  Function name
Options:
    --help, -h        Show command usage
    --network, -n     Network name
    --signer, -s      Signer key name
    --data, -d        Deploying initial data as name:value,...
                      This data is required to calculate the account address and to
                      deploy contract.
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --address, -a     Account address
    --input, -i       Function parameters as name:value,...
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --prevent-ui, -p  Prevent user interaction
                      Useful in shell scripting e.g. on server or in some
                      automating to disable waiting for the user input.
                      Instead everdev will abort with error.
                      For example when some parameters are missing in command line
                      then ton dev will prompt user to input values for missing
                      parameters (or fails if prevent-ui option is specified).
```

## Emulate transaction executor locally on TVM

This command downloads a contract and emulates transaction execution locally on TVM. Contract ABI and TVC files are required to run it.

```bash
everdev contract run-executor abi_filename
```

Command displays available functions and asks to select one. Result:

```bash
$ everdev contract run-executor Contract.abi.json

Configuration

  Network: dev
  Signer:  sign1

Address: 0:a4629d617df931d8ad86ed24f4cac3d321788ba082574144f5820f2894493fbc

Available functions:

  1) func1
  2) func2

  Select function (number):
```

Network, signer and account address parameters can be overridden and function parameters specified in the command with the following options:

```bash
$ everdev contract run-executor -h
EverDev Version: 0.5.0
Use: everdev contract run-executor file function [options]
Args:
    file      ABI file
    function  Function name
Options:
    --help, -h        Show command usage
    --network, -n     Network name
    --signer, -s      Signer key name
    --data, -d        Deploying initial data as name:value,...
                      This data is required to calculate the account address and to
                      deploy contract.
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --address, -a     Account address
    --input, -i       Function parameters as name:value,...
                      Array values must be specified as [item,...]. Spaces are not
                      allowed. If value contains spaces or special symbols "[],:"
                      it must be enclosed in "" or ''
    --prevent-ui, -p  Prevent user interaction
                      Useful in shell scripting e.g. on server or in some
                      automating to disable waiting for the user input.
                      Instead everdev will abort with error.
                      For example when some parameters are missing in command line
                      then ton dev will prompt user to input values for missing
                      parameters (or fails if prevent-ui option is specified).
```

## Top up contract balance from giver

If you have set a giver for a network, you can top up contract balances on it with the following command.

```
everdev contract topup abi_filename
```

Defalt signer and giver parameters will be used, unless otherwise specified through the following options:

```
$ everdev contract topup -h
EverDev Version: 0.5.0
Use: everdev contract topup file [options]
Args:
    file  ABI file
Options:
    --help, -h     Show command usage
    --address, -a  Account address
    --network, -n  Network name
    --signer, -s   Signer key name
    --data, -d     Deploying initial data as name:value,...
                   This data is required to calculate the account address and to
                   deploy contract.
                   Array values must be specified as [item,...]. Spaces are not
                   allowed. If value contains spaces or special symbols "[],:"
                   it must be enclosed in "" or ''
    --value, -v    Deploying balance value in nano tokens
```

To **top up any known address** without providing keys or contract files, use the following command:

```
everdev contract topup --address <address>
```

or

```
everdev ct -a <addrress>
```

## Decode data from a contract deployed on the network.

```
$ everdev contract decode-data --help
EverDev Version: 1.2.0
Use: everdev contract decode-data file [options]
Args:
    file  ABI file
Options:
    --help, -h     Show command usage
    --network, -n  Network name
    --address, -a  Account address

```
For example:
```
$ everdev contract decode-data HelloWallet.abi.json  -a 0:783abd8b2cbcc578397d8d15ae8293688a87da15a052a993cfb51cbd3e6452a3
Decoded account data: {
    "data": {
        "_pubkey": "0x95c06aa743d1f9000dd64b75498f106af4b7e7444234d7de67ea26988f6181df",
        "_timestamp": "1653482490973",
        "_constructorFlag": true,
        "timestamp": "1653482492"
    }
}
```
## Decode TVC into code, data, libraries and special options.
```
$ everdev contract decode-tvc --help
EverDev Version: 1.2.0
Use: everdev contract decode-tvc file
Args:
    file  ABI file
Options:
    --help, -h  Show command usage
```
For example:
```
$ everdev contract decode-data HelloWallet.abi.json  -a 0:783abd8b2cbcc578397d8d15ae8293688a87da15a052a993cfb51cbd3e6452a3
Decoded account data: {
    "data": {
        "_pubkey": "0x95c06aa743d1f9000dd64b75498f106af4b7e7444234d7de67ea26988f6181df",
        "_timestamp": "1653482490973",
        "_constructorFlag": true,
        "timestamp": "1653482492"
    }
}

```

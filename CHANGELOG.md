# Release Notes

All notable changes to this project will be documented in this file.

## [0.7.0] - 2021-05-26

### New
- Added new option `--output-dir, -o` for solidity compiler to store `*.abi.json` and `*.tvc` files in a separate directory.
   Example: `tondev sol compile hello.sol -o ~/assets`
- Use caxa to create standalone portable binaries for windows, macos, linux

## [0.6.0] - 2021-04-28

### New
- `ts4` [TestSuite4](README.md#testsuite4) framework for contract testing is supported: install, manage versions, create test template, run tests.

## [0.5.0] - 2021-04-23

### New
- `clang` controller for [C++ compiler](https://github.com/tonlabs/TON-Compiler):   
  install, compile with 1 command, manage versions, etc.   
- `signer` controller for signer registry management:   
  generate keys, import keys and mnemonics, specify default signer, etc.   
- `network` controller for network registry management:   
  add networks, configure network giver, specify default network, etc.   
- `contract` controller for contract management:   
- get contract info summary, top up balance, deploy, run, run-local, run-executor   
- `tondev js wrap` generates `code` and `codeHash` fields in addition to `tvc`.   
- `tondev contract info` prints code hash.   
- `tondev info` command prints a summary information from all controllers.   
- short aliases for controllers, commands and options.   
  For example instead of using `tondev network list`    
  you can use `tondev n l` and even shorter `tondev nl`.   

### Fixed

- `tvm_linker` downloads always even if it's up to date.

## [0.4.0] - 2021-03-25

### New

- [`--force` option](README.md#update-1) for `sol update` and `sol set` commands.
  If set then components will be reinstalled event if their version hasn't changed.
- [`js wrap` command](README.md#create-contract-js-wrapper) generates JS wrapper file from ABI file and optional TVC file. 
- `help` command prints documentation about variants of command options, like [here](#README.md#create-contract-js-wrapper) 

## [0.3.3] - 2021-03-16

### Fixed
- Solidity stdlib didn't update.

## [0.3.2] - 2021-03-12

### Fixed
- Support versioning at solidity components

## [0.3.0] - 2021-03-11

### New
- SDK functionality added
  - [See the list of available demo projects](README.md#see-the-list-of-available-demo-projects)
  - [Install demo project](README.md#install-demo-project)
- [tonos-cli](README.md#tonos-cli)
  - Install
  - Version
  - Set
  - Update

## [0.2.0] - 2021-02-26

### New
- [TON OS Startup Edition(SE) functionality](https://github.com/tonlabs/tondev#ton-os-startup-editionse):
  - Start
  - Version
  - Set
  - Reset
  - Update
  - Stop
  - Info
## [0.1.7] – 2021-02-18

### New

- Solidity functionality added:
  - Create a hello world contract in one click
  - Install compiler in the background upon the first request
  - Compile and link a contract in one click
  - Get solidity compiler version
  - Download the latest compiler
- SDK functionality added:
  - Create an empty Node.js project with the latest SDK dependencies and index.js script with main client object creation

# Release Notes

All notable changes to this project will be documented in this file.

## [0.5.0] - 2021-04-08

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

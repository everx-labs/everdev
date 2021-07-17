# Release Notes

All notable changes to this project will be documented in this file.

## [0.8.0] - 2021-07-15

### New

- `value` option of the `contract` commands can accept values with "t" suffix.
  Such values will be properly converted to the nano tokens.
- In case of error with giver the tondev prints new detailed error describing 
  that there is a giver problem (not in users contract). 
- Components version table has a text "not installed" if some component is missing.
  If some component is missing then tondev adds a footnote about on demand installation.
  

### Fixed

- "tondev clang set --compiler" didn't change installed compiler version https://github.com/tonlabs/tondev/issues/42
- check balance of the account before deploy.
- tondev does not fill the command args with default values when user ran commands programmatically.  

## [0.7.4] - 2021-06-25

### New

- Column `used` was added to  `signer list` with reference to the giver that uses this signer;
- Column `giver` was added to `network list` with information about giver's contract and signer.
- Printed tables now supports multiline cell values.

### Fixed

- "Error: Signer not found:" in case when the default signer has upper letters in name.
- Giver didn't use default signer. From now the giver uses default signer when User calls the `network giver` command without `--signer` option. 

## [0.7.3] - 2021-06-03

### Fixed
- Incorrect parsing initial data params with options `--data, -d`.

## [0.7.2] - 2021-06-02

### Fixed
- Update README with information about how to install tondev after download binaries

## [0.7.1] - 2021-06-01

### Fixed
- GitHub Action

## [0.7.0] - 2021-05-26

### New
- Added new option `--output-dir, -o` for solidity compiler to store `*.abi.json` and `*.tvc` files in a separate directory.
   Example: `tondev sol compile hello.sol -o ~/assets`
- Created standalone portable binaries for windows, macos, linux

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

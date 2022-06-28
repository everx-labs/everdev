# Release Notes

All notable changes to this project will be documented in this file.

## [1.2.2] - 2022-06-28

### Fixed

-   Fixed an uninformative error message when it occurred in a spawned process.


## [1.2.0] - 2022-05-27

### New

- Add new option `--type` to the `everdev network giver` command.

    If you compiled your own giver, `everdev` may refuse to use it because it doesn't know what interface it implements.

    You can specify which interface your giver implements by specifying the --type = GiverV1 | GiverV2 | GiverV3 | SecureMultiSigWallet | SetcodeMultisigWallet

-   Add new sub command "everdev contract decode-data file [options]". This command decodes data from a contract deployed on the network.
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

-   Add new sub command "everdev contract decode-tvc file". This command decodes TVC into code, data, libraries and special options.
    For example:

    ```
    $ everdev contract decode-tvc HelloWallet.tvc
    Decoded TVC: {
      "code": "te6ccPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAYDA0rtRNDXScMB+GYi0NcLA6k4ANwhxwDjAiHXDR/yvC==',
      "code_hash": "7a588d25395138fa12f9fd358b2383922b80a2dcbc973cd437723b4d96c9ae13",
      "data": "te6ccgEBAgEAKAABAcABAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAg",
      "data_hash": "55a703465a160dce20481375de2e5b830c841c2787303835eb5821d62d65ca9d",
      ----%<------------------------
      "compiler_version": "sol 0.61.0"
    }
    ```

### Improved

- For "everdev sol compile" and "everdev clang compile" commands, you can specify a variable number of input files, for example:
    ```
    $ everdev sol compile Contract1.sol Contract2.sol Contract3.sol  # It works
    $ everdev sol compile *.sol  # It works too
    ```


## [1.1.2] - 2022-05-12
### Fixed
 - Updated Ever OS Cloud endpoints.
 - Updated the C++ contract example for use with the latest (7.7.35) clang compiler.

## [1.1.1] - 2022-02-11
### Fixed
 - An error "TON Client binary bridge is not set"  that occurred when using `js wrap` command as a module

### Improved
 -  Command parameter parsing when using tondev as a module. 
    Now, when some unrecognized option is found, an error occurs.
    Previously unrecognized option was silently skipped.

## [1.1.0] - 2022-02-09
### New
 - If a new version of everdev is available, then the user who executes any `everdev` command will be
   informed about it (no more than once a day)

### New
 - `sol info` command shows the file path for installed components

### Fixed
- `sol compile` command no longer suppresses warnings


## [1.0.0] - 2021-12-24
### New
The utility has a new name `everdev`!

Install it with `npm i -g everdev`

If you already have `tondev` installed and want to clone its configuration, copy `$HOME/.tondev` into the `$HOME/.everdev` directory.


## [0.11.2] - 2021-12-15
### Fixed
- `sol ast` command options

## [0.11.1] - 2021-12-07
### NEW
- `sol ast` command that parses a ton-solidity file and creates an abstract syntax tree (AST) to the output directory

### Fixed
- ssh2 transitive dependency on dockerode

## [0.11.0] - 2021-12-03
### NEW
- Structure can be passed as an argument of a function call, for example:
```
tondev contract run shapes.tvc \
    --address 0:540c1837656674d548c934258ddec9b5fd11b543da977b0016c14b5650bc7eb5 \
    --input '{ "point": { "color": "red", "center": { "x": 1, "y": 2 } } }'
```

### Improved
- Information about the installed version of stdlib has been removed from the output of the `tondev sol version` command.
Now its version is always equal to the compiler's version.
- Remove checking of .sol extension in `compile` command. Any extension can be used now. 


## [0.10.5] - 2021-11-11
### NEW
- Added the ability to compile [SafeMultisigWallet](https://github.com/tonlabs/ton-labs-contracts/tree/master/solidity/safemultisig) for Linux platform. The size of the compiled contract will be different from the original due to a different linker, but the compiler is the same

Install the appropriate compiler, linker, and stdlib versions:
```
tondev sol set -c 0.21.0
tondev sol set -s 0.21.0
tondev sol set -l 0.1.21
```
Now you can compile SafeMultisigWallet contract:
```
tondev sol compile SafeMultisigWallet.sol
ls -l SafeMultisigWallet.tvc
-rw-rw-r--. 1 4430 Nov 11 22:16 SafeMultisigWallet.tvc
```

## [0.10.4] - 2021-09-27

- `tondev contract run-local` now checks the contract state before execution and generates user friendly error, if contract does not exist or is in uninit or frozen state.

### Improved

- Dependabot cannot update ssh2 to a non-vulnerable version

## [0.10.3] - 2021-09-27

### Fixed

- Dependabot cannot update ssh2 to a non-vulnerable version

- `tondev sol set` can now install any existing binaries by version number, not just one of the last ten

## [0.10.2] - 2021-09-24

### Fixed

- `tondev signed add <seed-phase>` didn't store seed phrase in signer registry.

## [0.10.1] - 2021-09-17

### Fixed

- Build with new typescript version 
- lib-node's bridge crashed on `client.close()`

## [0.10.0] - 2021-09-10

### New

- Added new option `--code, -c` for solidity compiler to save `*.code` file.
   Example: `tondev sol compile --code hello.sol`

## [0.9.0] - 2021-08-20

### New
- [Extraton Debot Browser](https://github.com/extraton/debrowser) supported! Now you can test your debots in web with ease - even offline. Just run SE and Extraton Debot Browser together. They perfectly fit! 

### Improved
- We changed the prepay logic of deploy operation. Account is not prepaid automatically from the giver any more. Now you need to specify -v <VALUE> explicitly. Get predictible behaviour and results!
- Error messages in case of insufficiant balance were improved. 
  
### Fixed
- An error that occurred when a contract was deployed to an account with a positive balance less than the default (10 tokens) and Giver was not set properly.

## [0.8.1] - 2021-07-26

### Fixed
- problem with contracts/ folder

## [0.8.0] - 2021-07-26

### New
- `value` option of the `contract` commands can accept values with "t" suffix.
  Such values will be properly converted to nano tokens.
- `run-signer` option of the the `contract` commands allows to sign messages with alternative keys different from `signer` meanwhile address is still calculated from `signer` parameter (or from default `signer`). It should be useful for `run-local` (with `None` value) so that it is not needed to specify address explicitly any more.
- `tondev` commands that produce files (e.g. `sol create`) create output folders if required.
- `tondev signer add` command's `secret` option can accept a path to the keys file.
- `tondev se set` options `image` and `container` allow use existing docker 
  images and containers to register SE instances.
- `tondev se delete` deletes registered SE instance from `tondev` SE registry.
- `--version` or `-v` or `-V` global option prints current tondev version.

### Fixed
- "tondev clang set --compiler" didn't change installed compiler version https://github.com/tonlabs/tondev/issues/42
- `tondev` did not not fill the command args with default values when user ran commands programmatically.  
- `tondev info` stopped if one of the tools failed.

### Improved
- In case of errors with giver `tondev` prints new detailed errors describing 
  that there is a giver problem (not in users contract). 
- Component version table prints "not installed" text if some component is missing. Footnote about on demand installation is added.
- Account balance check is added before deploy.
- All commands that require abi file (e.g. `js wrap`) now accepts any input file name. 
- `tondev se version` now prints version from the latest to the eldest order.
- `tondev sol compile` now hides linker output in case of success.

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

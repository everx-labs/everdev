# Solidity Compiler Driver

Everdev allows to install and manage Solidity Compiler Driver.

It is a combined binary that includes Solidity compiler, TVM linker and required libraries, and streamlines the compilation process.

To use Solidity Compiler Driver globally after installation via Everdev, add it to the system environment:

```shell
export PATH="$HOME/.everdev/sold:$PATH"
```

Then use with the following command:

```
sold [OPTIONS] [INPUT]...
```

To see the full documentation, use `sold --help`:

```
$ sold --help
sold, the Ever Solidity commandline driver

Usage: sold [OPTIONS] [INPUT]...

Arguments:
  [INPUT]...  Source file name or remappings in the form of context:prefix=target

Options:
  -c, --contract <NAME>         Contract to build if sources define more than one contract
      --base-path <PATH>        Use the given path as the root of the source tree instead of the root of the filesystem
  -i, --include-path <PATH>     Make an additional source directory available to the default import callback. Use this option if you want to import contracts whose location is not fixed in relation to your main source tree, e.g. third-party libraries installed using a package manager. Can be used multiple times. Can only be used if base path has a non-empty value
      --allowed-path <PATH>     Allow a given path for imports. A list of paths can be supplied by separating them with a comma
  -l, --lib <PATH>              Library to use instead of default
  -p, --output-prefix <PREFIX>  Prefix for output files (by default, input file stem is used as prefix)
  -o, --output-dir <PATH>       Output directory (by default, current directory is used)
      --print-code              Print the code cell to stdout
      --abi-json                ABI specification of the contracts
      --function-ids            Print name and id for each public function
      --private-function-ids    Print name and id for each private function
      --ast-compact-json        AST of all source files in a compact JSON format
      --userdoc                 Natspec user documentation of all contracts
      --devdoc                  Natspec developer documentation of all contracts
      --init <FILENAME>         Set newly generated keypair
      --silent                  Mute all notifications
  -h, --help                    Print help
  -V, --version                 Print version
```

{% hint style="info" %}
**Note**: Version 0.68.0 and earlier versions have some dependency issues on older Linux systems. If you encounter any such issues, update to 0.69.0 or later.
{% endhint %}

## Install

This command installs the latest Solidity Compiler Driver

```shell
everdev sold install
```

To use Solidity Compiler Driver globally after installation via Everdev, add it to the system environment:

```shell
export PATH="$HOME/.everdev/sold:$PATH"
```

## Version

This command shows the used Solidity Compiler Driver version and list of available for download versions

```shell
everdev sold version
Component  Version  Available
---------  -------  --------------------------------------------------------------
driver     0.69.0   0.69.0, 0.68.0, 0.67.0, 0.66.0, 0.66.0, 0.65.0, 0.65.0, 0.64.0

File path: /home/<username>/.everdev/sold/sold
```

## Set

This command specifies Solidity Compiler Driver version to use and downloads it if needed.

```shell
everdev sold set --version 0.69.0
```

## Update

This command updates Solidity Compiler Driver version to the latest

```shell
everdev sold update
```

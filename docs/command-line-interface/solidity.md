# Solidity

## Create your first contract

This command creates a hello-world Solidity contract with comments that you can observe and compile.

```shell
everdev sol create Contract
```

## Compile

This command compiles and links a selected Solidity contract. After successful compilation you get .abi.json and .tvc files that you can later [use in your DApps to deploy and run contract methods](https://docs.everos.dev/ever-sdk/guides/work\_with\_contracts/add\_contract\_to\_your\_app).

```shell
everdev sol compile Contract.sol
```

To save generated assembler code use `-c` option (default is false)

```shell
everdev sol compile Contract.sol -c path/to/output/file
```

Assembler code will be saved in path/to/output/file with the extension `code`

You can specify the output files location with the `-o` option:

```shell
everdev sol compile Contract.sol -o path/to/output/file
```

## Ast

This command parses a ton-solidity file and creates an abstract syntax tree (AST) to the output directory.

```shell
everdev sol ast Contract.sol
```

To specify the ast format type, use `-f` or `--format` option:

```shell
everdev sol ast-json Contract.sol -f <json | compact-json>
```

To point the location of the output folder, use the `-o` or `--output-dir` option:

```shell
everdev sol ast-json Contract.sol -f <json | compact-json> -o path/to/output/file
```

## Version

This command shows the currently installed Solidity compiler version.

```shell
everdev sol version
```

## Update

This command updates the compiler and linker to the latest version.

```shell
everdev sol update
```

**Attention!** Use --force option to force update of components that do not update their version.

## Set

This command sets the compiler and linker versions and downloads them if needed.

```shell
everdev sol set --compiler 0.38.0 --linker 0.23.54
```

**Attention!** Use --force option to force update of components that do not update their version.

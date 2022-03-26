# C++

## Create your first contract

This command creates a basic C++ contract with comments that you can observe and compile.

```shell
everdev clang create Contract
```

## Compile

This command compiles and links a selected C++ contract.
After successful compilation you get .abi.json and .tvc files that you can later [use in your DApps to deploy and run contract methods](https://tonlabs.gitbook.io/ton-sdk/guides/work_with_contracts/add_contract_to_your_app).

```shell
everdev clang compile Contract.cpp
```

## Version

This command shows the currently installed C++ compiler version.

```shell
everdev clang version
```

## Update

This command updates the compiler to the latest version.

```shell
everdev clang update
```

Use `--force` or `-f` option to force reinstall, if the compiler is already up to date.

## Set

This command sets the compiler version and downloads it if needed.

```shell
everdev clang set --compiler 7.0.0
```

Use `--force` or `-f` option to force reinstall, if the current version is the same as the requested version.

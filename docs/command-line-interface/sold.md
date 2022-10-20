# Solidity compiler diver

## Version

This command shows the currently installed sold version.

```shell
everdev sold version
```

## Install

This command installs the latest sold.

```shell
everdev sold install
```
The installer requires NPM to be installed, so it can install packages globally without using sudo.
In case of error, manually set environment variable `PATH=$PATH:$HOME/.everdev/solidity`

## Update

This command updates the sold executable to the latest version.

```shell
everdev sold update
```

**Attention!** Use --force option to force update of components that do not update their version.

## Set

This command specifies sold version to use and downloads it if needed.

```shell
everdev sold set --version 0.8.0
```

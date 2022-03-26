# SDK

## See the list of available demo projects

This command shows the list of available demo projects

```shell
everdev js demo
```

Result:

```shell
$ everdev js demo
Demo          Description
------------  -------------------------
hello-wallet  Simple NodeJs Application
```

## Install demo project

This command installs the specified demo project to the current directory. Proceed the instructions in the terminal to run it.

```shell
everdev js demo hello-wallet
```

## Create an empty project

This command creates a Node.js project with SDK latest dependencies and index.js file with main Client object creation.

```shell
everdev js create test_project
```

## Create contract JS wrapper

This command takes abi and, optionally, tvc file and generates a JS wrapper with abi and tvc converted into base64 that can be used further in SDK.
tvc file must have the same name as abi.

```shell
everdev js wrap contractName.abi.json
```
The result name of the wrapper will be "ContractName||"Contract".js".

See other available generation options with help command:

```shell
everdev js wrap -h
EverDev Version: 0.4.0
Use: everdev js wrap file [options]
Args:
    file  ABI file
Options:
    --help, -h    Show command usage
    --print, -p   Print code to console
    --output, -o  Set output file name (default is built from source ABI file name)
    --export, -e  Export type and options
                  commonjs          Use CommonJS modules (NodeJs)
                  commonjs-default  Use CommonJS modules (NodeJS) with default export
                  es6               Use ES6 modules
                  es6-default       Use ES6 modules with default export
```

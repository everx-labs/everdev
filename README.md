# EverDev

Everdev is a Node.js package with CLI interface that allows to set up developer environment and develop on TVM compatible blockchains (Everscale, Venom, TON, Gosh, etc).

## [Quick Start](docs/guides/quick-start.md)

**Get quick help in our telegram channel:** [![Channel on Telegram](https://img.shields.io/badge/chat-on%20telegram-9cf.svg)](https://t.me/ever\_sdk)

<div>

<figure><img src="docs/.gitbook/assets/Everscale Logo.png" alt=""><figcaption></figcaption></figure>

 

<figure><img src="docs/.gitbook/assets/vf-dev-program.png" alt=""><figcaption></figcaption></figure>

</div>

[NPM package](https://www.npmjs.com/package/everdev)

### Use-cases

* Easily manage(install, update) all the core tools, such as Solidity/C++ Compilers, Evernode-SE, tonos-cli
* Configure networks (including Local Blockchain, Developer Network, Everscale (main) network): add, configure giver contract;
* Manage keys: add, remove
* Work with blockchain from CLI

## Content table

* [EverDev](./#everdev)
  * [Quick Start](./#quick-start)
    * [Use-cases](./#use-cases)
  * [Content table](./#content-table)
  * [Installation](./#installation)
    * [Prerequisites](./#prerequisites)
    * [Using NPM](./#using-npm)
    * [Using pre-compiled binaries](./#using-pre-compiled-binaries)
    * [Using docker](./#using-docker)
    * [Update](./#update)
  * [Command Line Interface](./#command-line-interface)
    * [General command syntax](./#general-command-syntax)
    * [Solidity Compiler](./#solidity-compiler)
    * [Solidity Compiler Driver](./#solidity-compiler-driver)
    * [C/C++ Compiler](./#cc-compiler)
    * [Network Tool](./#network-tool)
    * [Signer Tool](./#signer-tool)
    * [Contract Management Tool](./#contract-management-tool)
    * [Evernode Simple Emulator (local blockchain)](./#evernode-simple-emulator-local-blockchain)
    * [Debot Browser](./#debot-browser)
    * [TestSuite4](./#testsuite4)
    * [tonos-cli](./#tonos-cli)
  * [Cookbook](./#cookbook)
    * [Quick Start](./#quick-start-1)
    * [Work with contracts](./#work-with-contracts)
    * [Work with DevNet](./#work-with-devnet)
    * [Create controller](./#create-controller)
    * [View controller info](./#view-controller-info)
  * [Troubleshooting](./#troubleshooting)
  * [EverDev Extensibility](./#everdev-extensibility)

## Installation

### Prerequisites

* [`Node.js`](https://nodejs.org) >= 14.x installed. Required only if you are installing Everdev from NPM. We recommend using [Node version manager](https://github.com/nvm-sh/nvm#install--update-script) to install nodejs and NPM.
* (optional) [`Docker`](https://www.docker.com) >= 19.x installed
* Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

### Using NPM

```shell
npm i -g everdev
```

If you see an EACCESS error when you try to install a package globally on Mac or Linux, [please see this instruction](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

### Using pre-compiled binaries

You can download precompiled binaries for your platform from [the latest release](https://github.com/tonlabs/everdev/releases/). After download you need to create directory if it does not exists.

For linux/macos:

> ```shell
> mkdir -p ~/.everdev/bin
> ```
>
> Then unpack `everdev` from archive into this folder.

For windows:

> ```shell
> md $env:HOMEDRIVE$env:HOMEPATH\.everdev\bin
> ```
>
> Then move downloaded binary as `everdev.exe` into this folder.

To make it possible to run `everdev` from any folder, you need to update the system PATH environment variable.

For linux/macos:

> ```shell
> echo 'export PATH=~/.everdev/bin:$PATH' >> ~/.profile && source ~/.profile
> ```

For windows run PowerShell and execute this line:

> ```powershell
> [System.Environment]::SetEnvironmentVariable("PATH", "$env:HOMEDRIVE$env:HOMEPATH\.everdev\bin;$([System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User))", [System.EnvironmentVariableTarget]::User)
> ```

_After trying to run `everdev` on macos you can see the error: "everdev" cannot be opened because the developer cannot be verified. Open your computer System Preferences > Security & Privacy > Privacy. Here, you should see an option to click "Allow Anyway" next to the "everdev" application in question._

### Using docker

Select a base image that provides GLIBC ver. 2.29 or higher if you want to use the Evedev Solidity compiler like ubuntu:20.04:

```
docker run -it --rm ubuntu:20.04
# apt update &&  apt upgrade -y && apt install -y curl
# curl -L https://github.com/tonlabs/everdev/releases/download/1.3.1/everdev-linux.tgz  --output everdev-linux.tgz
# tar xvf everdev-linux.tgz
# mv everdev /usr/local/bin/
```

### Update

```shell
npm r -g everdev
npm i -g everdev
```

## Command Line Interface

Components are downloaded and installed automatically for the target platform upon the first request.

### General command syntax

```shell
everdev <tool> <command> ...args
```

Some tools (network, signer, contract, js) and commands have short aliases. For example instead of using `everdev network list` you can use `everdev n l` and even shorter `everdev nl`.

### [Solidity Compiler](docs/command-line-interface/solidity.md)

Controller for [Everscale Solidity compiler](https://github.com/tonlabs/TON-Solidity-Compiler).

### [Solidity Compiler Driver](docs/command-line-interface/sold.md)

Controller for [sold - Everscale Solidity compiler driver](https://github.com/tonlabs/TON-Solidity-Compiler/tree/master/sold)

### [C/C++ Compiler](docs/command-line-interface/c.md)

Controller for [Everscale Clang Compiler](https://github.com/tonlabs/TON-Compiler).

### [Network Tool](docs/command-line-interface/network-tool.md)

Controller for network management.

### [Signer Tool](docs/command-line-interface/signer-tool.md)

Controller for keys management.

### [Contract Management Tool](docs/command-line-interface/contract-management.md)

Controller for working with smart contracts.

### [Evernode Simple Emulator (local blockchain)](docs/command-line-interface/evernode-platform-startup-edition-se.md)

Controller for [Local Node emulator](https://github.com/tonlabs/evernode-se).

### [Debot Browser](docs/command-line-interface/debrowser.md)

Controller for DeBot browser.

### [TestSuite4](docs/command-line-interface/testsuite4.md)

Controller for [TestSuite4](https://github.com/tonlabs/TestSuite4) testing framework.

### [tonos-cli](https://github.com/tonlabs/tonos-cli)

Controller for [tonos-cli](https://github.com/tonlabs/tonos-cli) tool management.

EverDev can be extended with other tools following the [instructions of integration](./#everdev-extensibility).

## Cookbook

### Quick Start

Get started with essential Everscale Development Tools with [Quick Start guide](docs/guides/quick-start.md).

### Work with contracts

Learn how to deploy and call your smart contracts with EverDev: [Work with contracts](docs/guides/work-with-contracts.md).

### Work with DevNet

Read how to deploy and configure your own Giver in DevNet in a separated guide: [Working with DevNet](docs/guides/work-with-devnet.md).

### Create controller

Find out how to create your own controller for EverDev: [Create controller](docs/guides/creating-controller.md).

### View controller info

Learn how to view all available controllers information: [View controller info](docs/view-controller-info.md).

## Troubleshooting

If you encountered any problem try to seek the solution in [Troubleshooting Notes](docs/troubleshooting.md). If it didn't help - please, ask in our [telegram channel](https://t.me/ever\_sdk).

## EverDev Extensibility

TON Dev Environment is an integration point for development tools related to Everscale Blockchain.

There are two kind of software connected to EverDev:

* Development tools such as a compilers, networks, debuggers and so on.
* User Interaction services such as an IDE plugins, CLI, GUI applications etc.

Learn more about creating your own controller: [Creating Controller](docs/guides/creating-controller.md)

# Installation

## Prerequisites

- [`Node.js`](https://nodejs.org/) >= 14.x installed
- (optional) [`Docker`](https://www.docker.com/)  >= 19.x installed
- Solidity compiler requires VC++ Runtime on Windows. You can install it from [the latest supported Visual C++ downloads](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

## Install

```shell
npm i -g everdev
```

If you see an EACCESS error when you try to install a package globally on Mac or Linux, [please see this instruction](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

## Download

You can download precompiled binaries for your platform from [the latest release](https://github.com/tonlabs/everdev/releases/latest).
After download you need to create directory if it does not exists.

For linux/macos:
> ```shell
> mkdir -p ~/.everdev/bin
> ```
> Then unpack `everdev` from archive into this folder.

For windows:
> ```shell
> md $env:HOMEDRIVE$env:HOMEPATH\.everdev\bin
> ```
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

*After trying to run `everdev` on macos you can see the error: "everdev" cannot be opened because the developer cannot be verified. Open your computer System Preferences > Security & Privacy > Privacy. Here, you should see an option to click "Allow Anyway" next to the "everdev" application in question.*


## Update

```shell
npm r -g everdev
npm i -g everdev
```

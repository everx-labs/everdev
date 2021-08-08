# TONDEV Troubleshooting

Here are some solutions to frequently encountered problems.

## EACCESS errors during installation

These errors can occur, if npm was installed without the use of a version manager.

Refer to [this article](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) for ways to resolve the issue.

## command not found: tondev

This error may happen because `PATH` environment variable was not correctly updated to contain path to Node.js binary.


If you use Linux, ensure the following command is in your `~/.bashrc` for bash shell or `~/.zshrc` for zsh shell:

```sh
export PATH=~/.npm-global/bin:$PATH
```

If you have installed Node.js using Homebrew on MacOS, npm binaries could be found in `/usr/local/share/npm/bin`. 
So, in your `~/.zshrc` file add the following:

```sh
export PATH=/usr/local/share/npm/bin:$PATH
```

If you use Windows, add path to NodeJS bin directory via environment variables settings dialogue and relaunch console window.

Additionally, make sure [permissions are alright](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

## Unspecified Error on `tondev sol compile` in Windows 10

1) Run \Users\UserName\tondev\solidity\solc.exe and review error messages.
2) Update Visual Studio components and make sure [vc_redist is installed](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

## TON OS SE: Couldn’t connect to Docker daemon

This error occurs in two cases. Either the docker daemon isn't running, or current user doesn't have rights to access docker.

You can [fix the rights](https://docs.docker.com/engine/install/linux-postinstall/) issue either by running relevant commands as the superuser or adding the user to the `docker` group: 

    sudo usermod -a -G docker $USER

Make sure to restart the system or log out and back in, for the new group settings to take effect.

## After tondev is installed on Ubuntu WSL on Windows 10 old version is there

This issue can occur if npm was installed without correct permissions for Linux/Ubuntu.
Refer to [this article](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) for ways to resolve it.

After it is done, reload terminal and install tondev via `npm i tondev -g' again.

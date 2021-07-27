# TONDEV Troubleshooting

Here are some solutions to frequently encountered problems.

## EACCESS errors during installation

These errors can occur, if npm was installed without the use of a version manager.

Refer to [this article](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) for ways to resolve the issue.

## command not found: tondev

This may happen because PATH variable was not correctly updated. Run this command:
```
export PATH=~/.npm-global/bin:$PATH
```

## Unspecified Error on `tondev sol compile` in Windows 10

1) Run \Users\UserName\tondev\solidity\solc.exe and review error messages.
2) Update Visual Studio components and make sure [vc_redist is installed](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0).

## TON OS SE: Couldn’t connect to Docker daemon

This error occurs in two cases. Either the docker daemon isn't running, or current user doesn't have rights to access docker.

You can fix the rights issue either by running relevant commands as the superuser or adding the user to the `docker` group: 

    sudo usermod -a -G docker $USER

Make sure to restart the system or log out and back in, for the new group settings to take effect.

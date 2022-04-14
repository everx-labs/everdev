# DeBrowser
[The ExtraTON DeBot Browser](https://github.com/extraton/debrowser/).

## Version
This command shows the list of available versions.

```shell
everdev debrowser version

Available Versions: 1.1.0, 1.2.0, 1.2.1, 1.3.1
```

## Interfaces
This command shows the list of implemented interfaces.

```shell
everdev debrowser interfaces

Realised interfaces:
 - Address Input
 - Amount Input
 - Confirm Input
 - Menu
 - Network
 - Number Input
 - QR Code
 - Signing Box Input
 - Terminal
 - User Info
```

## Start
This command downloads image and starts DeBrowser container (Docker must be launched).

```shell
everdev debrowser start 1.3.1
```

## Stop
This command stops DeBrowser container.

```shell
everdev debrowser stop
```

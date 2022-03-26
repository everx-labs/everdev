# Evernode Platform: Startup Edition(SE)

## Start
This command starts the Evernode SE container (Docker must be launched). When executed for the first time downloads the latest SE image from dockerhub.

```shell
everdev se start
```

## Version
This command shows the default Evernode SE version and list of other available versions.

```shell
everdev se version

default: 0.24.12
Available Versions: 0, 0.24, 0.24.5, 0.24.6, 0.24.8, 0.24.9, 0.24.10, 0.24.11, 0.24.12, latest
```

## Set
This command switches Evernode SE to the specified version and port and downloads it, if it is missing.
**Attention! This command does not start TON OS SE, you need to run `start` command separately.**

```shell
everdev se set --version 0.24.11 --port 2020
```

## Reset
This command resets the Evernode SE container (Docker must be launched) - restarts it from scratch with a clean database.

```shell
everdev se reset
```
## Update
This command downloads the latest Evernode SE image (Docker must be launched) and starts it.

```shell
everdev se update
```

## Stop
This command stops Evernode SE container.

```shell
everdev se stop
```

## Info
This command shows info about the downloaded versions.

```shell
everdev se info

Instance  State    Version  GraphQL Port  ArangoDB Port  Docker Container            Docker Image
--------  -------  -------  ------------  -------------  --------------------------  --------------------------
default   running  0.24.12  2020                         tonlabs-tonos-se-ekaterina  tonlabs/local-node:0.24.12
```

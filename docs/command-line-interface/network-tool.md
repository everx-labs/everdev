# Network Tool

Network tool is a convenient way to organize all of your network configurations in one place.

You can register several blockchains (networks) under short names and then use these names as a target blockchain when working with contracts.

You can mark one of the networks as a default. It can be used in network commands without providing net name.

## Available commands

See available commands with help command:

```
$ everdev network --help
EverDev Version: 1.4.0
Use: everdev network command args [options]
Options:
    --help,    -h  Show command usage
Commands:
    add             Add net
    credentials, c  Set credentials for network authentication
    delete          Delete network from registry
    list, l         Prints list of networks
    info, i         Prints network detailed information
    default, d      Set default network
    giver, g        Set giver for network
```

## Add a network

This command adds a network to the everdev registry.

```bash
everdev network add network_name network_endpoint(s)
```

See other available network addition options with help command:

```bash
$ everdev network add -h
EverDev Version: 0.5.0
Use: everdev network add name endpoints [options]
Args:
    name
    endpoints  Comma separated endpoints
Options:
    --help, -h   Show command usage
    --force, -f  Overwrite key if already exists
```

Example with [mainnet endpoint](https://docs.everos.dev/ever-sdk/reference/ever-os-api/networks):

```bash
everdev network add main mainnet.evercloud.dev
```
## Set credentials for a network
```
$ everdev network credentials --help
EverDev Version: 1.4.0
Use: everdev network credentials name [options]
Args:
    name  Network name
Options:
    --help, -h        Show command usage
    --project, -p     Your project ID
    --access-key, -k  Your secret or JWT token
    --clear           Clear saved credentials (mutually exclusive with other options)
```
Access to the devnet and mainnet blockchains requires authorization.\
Create a project on [dashboard.evercloud.dev](https://dashboard.evercloud.dev) if you don't have one, 
find your "Project Id" and "Secret" (optional) on the "Security" tab, and pass them as parameters:

Example with "devnet" endpoint:

```bash
everdev network credentials devnet --project <Project Id> --access-key <Secret>
```

## Set a giver for a network

This command sets a giver account for a network. Giver will be used to top up your account balances on the network, including during deployment.

```bash
everdev network giver network_name giver_address
```

See other available network addition options with help command:

```bash
$ everdev network giver -h
EverDev Version: 0.5.0
Use: everdev network giver name address [options]
Args:
    name     Network name
    address  Giver address
Options:
    --help, -h    Show command usage
    --signer, -s  Signer to be used with giver
    --value, -v   Deploying account initial balance in nanotokens
    --type, -t    Type giver contract (GiverV1 | GiverV2 | GiverV3 | SafeMultisigWallet | SetcodeMultisigWallet)
```

**Note:** The default signer and the initial balance value of 10 tokens will be used, unless otherwise specified through options. Also note, that some contracts may require a higher initial balance for successful deployment. DePool contract, for instance, requires a minimun of 21 tokens.

Only one giver can be set for a network. Setting another one will overwrite the current giver. To view the current giver settings for all networks, use the `everdev network list` command (for details see the section [below](network-tool.md#list-registered-networks)).

## List registered networks

This command lists all registered networks, their public endpoints, and their giver addresses, if any.

```bash
everdev network list
```

Result:

```bash
$ everdev network list
Network        Endpoints                                        Giver
-------------  -----------------------------------------------  ------------------------------------------------------------------
se             http://localhost                                 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5
dev (Default)  https://devnet.evercloud.dev                     0:255a3ad9dfa8aa4f3481856aafc7d79f47d50205190bd56147138740e9b177f3
```

## Set default network

This command sets a previously added network as default (initially the mainnet is used by default).

```bash
everdev network default network_name
```

## Delete a network

This command deletes a network from everdev registry.

```bash
everdev network delete network_name
```

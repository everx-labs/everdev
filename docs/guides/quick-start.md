# Quick Start

## Guide overview

This guide will help you get started with such essential Everscale tools as:

* [Everdev CLI](https://github.com/tonlabs/everdev)
* [Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler)
* [Local Blockchain](https://github.com/tonlabs/evernode-se)
* [Everscale Blockchain Explorer](https://ever.live)
* [GraphQL API](https://docs.evercloud.dev/reference/graphql-api)
* [Evercloud dashboard](https://dashboard.evercloud.dev)

You will learn how to:

* Create and compile your first Solidity contract
* Run Local blockchain for testing
* Deploy your first contract
* Run it on-chain
* Run a getter-function
* Make a transfer
* Explore contract data in Explorer and GraphQL playground
* Switch to the developer network
* Configure Evercloud access
* Configure devnet giver

## Table of Contents

* [Get started with Development Tools](quick-start.md#get-started-with-development-tools)
  * [Guide overview](quick-start.md#guide-overview)
  * [Table of Contents](quick-start.md#table-of-contents)
    * [Install everdev - single interface to access all the developer tools](quick-start.md#install-everdev---single-interface-to-access-all-the-developer-tools)
    * [Create helloWorld contract](quick-start.md#create-helloworld-contract)
    * [Compile it](quick-start.md#compile-it)
    * [Run Local Blockchain](quick-start.md#run-local-blockchain)
    * [Configure default network](quick-start.md#configure-default-network)
    * [Configure Giver wallet that will sponsor deploy operation](quick-start.md#configure-giver-wallet-that-will-sponsor-deploy-operation)
    * [Generate the keys for contract ownership](quick-start.md#generate-the-keys-for-contract-ownership)
    * [Calculate the contract address](quick-start.md#calculate-the-contract-address)
    * [Deploy](quick-start.md#deploy)
    * [View contract information with Explorer](quick-start.md#view-contract-information-with-explorer)
    * [Explore contract information with GraphQL](quick-start.md#explore-contract-information-with-graphql)
    * [Run on-chain](quick-start.md#run-on-chain)
    * [Run a getter function](quick-start.md#run-a-getter-function)
    * [Transfer some tokens](quick-start.md#transfer-some-tokens)
    * [Switch to Development Network](quick-start.md#switch-to-development-network)
    * [Set a giver contract on your network](quick-start.md#set-a-giver-contract-on-your-network)
  * [What's next?](quick-start.md#whats-next)

### Install everdev - single interface to access all the developer tools

```bash
$ npm install -g everdev
```

If you experience any problems with installation, check out our [troubleshooting section](../troubleshooting.md).

### Create helloWorld contract

```bash
$ everdev sol create helloWorld
```

### Compile it

Using Solidity compiler:

```bash
$ everdev sol compile helloWorld.sol
```

You can also use the [Solidity compiler driver](../command-line-interface/solidity-compiler-driver.md):

```bash
$ everdev sold install
$ export PATH="/home/<username>/.everdev/sold:$PATH"
$ sold helloWorld.sol
```

### Run Local Blockchain

**Attention:** Docker should be running.

```bash
$ everdev se start
```

### Configure default network

Set Local Blockchain [SE (Simple Emulator)](https://github.com/tonlabs/evernode-se) as the default network:

```bash
$ everdev network default se
```

### Configure Giver wallet that will sponsor deploy operation

Here we use address and private key of [SE High Load Giver](https://github.com/tonlabs/evernode-se/tree/master/contracts/giver\_v3).&#x20;

Note: it may be already configured if you make a clean install of the latest Everdev. Then you can skip this step. If you are updating from some old version, it is necessary.

```
$ everdev signer add seGiver 172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3
$ everdev network giver se 0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415 --signer seGiver
```

**Attention! This giver is available only in SE. If you work in mainnet or devnet, you need to deploy your own giver - more details below.**

### Generate the keys for contract ownership

```
$ everdev signer generate owner_keys
$ everdev signer default owner_keys
$ everdev s l 

Signer                Public Key                                                        Used
--------------------  ----------------------------------------------------------------  ---------------------------
seGiver               2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16  se network giver signer   EverNode SE Default Giver Keys
owner_keys (Default)  3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b
```

\*Note that there are shortcuts for all the commands: s l = signer list :)

\*\*Don't forget to make the owner key default otherwise giver keys will be used as default.

### Calculate the contract address

```
$ everdev c i helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)
Code Hash: c517820144a4daf5a3414c9233556b2b0ad34cdd228f200ea68a4c0327e0bd29 (from TVC file)
Account:   Doesn't exist
```

You can see that the contract does not exist yet (is not deployed) but you can already see its future address.

### Deploy

Here we deploy the contract, sponsoring it with 10 Tokens (Everscale native currency has 9 decimals). The money for deploy are taken from the giver we configured in the previous steps.

```
$ everdev contract deploy -v 10000000000 helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)

Deploying...
Contract has deployed at address: 0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5
```

### View contract information with Explorer

Go to [localhost](http://localhost) and search for your contract address in search bar. Open your account page. You will need it later to see its transactions and messages, that we will produce in the next steps.

### Explore contract information with GraphQL

Go to [localhost/graphql](http://localhost/graphql). Enter in the left pane and click Run button (replace the contract's address with the one you got in the previous steps).

```
query {
  accounts(
    filter: {
      id: {
        eq: "0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5"
      }
    }
  ) {
    acc_type_name
    balance
    code
    code_hash
    data
  }
}
```

You will see:

```
{
  "data": {
    "accounts": [
      {
        "acc_type_name": "Active",
        "balance": "0x1db0832ba",
        "code": "te6ccgECEwEAAnkABCj/AIrtUyDjAyDA/+MCIMD+4wLyCxECARICoiHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AY4d+EMhuSCfMCD4I4ED6KiCCBt3QKC53pMg+GPg8jTYMNMfAfgjvPK50x8B2zz4R27yfAUDATQi0NcLA6k4ANwhxwDcIdMfId0B2zz4R27yfAMDQCCCEDtj1H67joDgIIIQaBflNbuOgOAgghBotV8/uuMCCwYEAlgw+EFu4wD4RvJzcfhm0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPH/4ZwUPAHjtRNAg10nCAY4U0//TP9MA1wsf+Gp/+GH4Zvhj+GKOG/QFcPhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeICKCCCEFTWvRi64wIgghBoF+U1uuMCCAcBSts8+EqNBHAAAAAAAAAAAAAAAAA6BflNYMjOIc8LH8lw+wB/+GcQAnIw0ds8IcD/jikj0NMB+kAwMcjPhyDOjQQAAAAAAAAAAAAAAAANTWvRiM8WIc8UyXD7AN4w4wB/+GcJDwECiAoAFGhlbGxvV29ybGQCKCCCEDcxLkW64wIgghA7Y9R+uuMCDgwDSDD4QW7jAPpA1w1/ldTR0NN/39cMAJXU0dDSAN/R2zzjAH/4ZxANDwBU+EUgbpIwcN74Qrry4Gb4AFRxIMjPhYDKAHPPQM4B+gKAa89AyXD7AF8DAkAw+EFu4wDR+EUgbpIwcN74Qrry4Gb4APgj+GrbPH/4ZxAPAC74QsjL//hDzws/+EbPCwD4SgHLH8ntVAAu7UTQ0//TP9MA1wsf+Gp/+GH4Zvhj+GIBCvSkIPShEgAA",
        "code_hash": "c517820144a4daf5a3414c9233556b2b0ad34cdd228f200ea68a4c0327e0bd29",
        "data": "te6ccgEBAQEALwAAWTgmICsSnqjAQbjUmmVVEmSPyUN30ZWKek/J9LMFHs97AAABesq/uBawfEB6wA=="
      }
    ]
  }
}
```

You can specify any other fields in the result section that are available in GraphQL Schema. (Click `Docs` on the right side of your screen to explore it).

**What is GraphQL?** This is the API of blockchain, to retrieve data from it and to send data into it. You can use this playground later, if you will need need to test some queries.

### Run on-chain

Let's move on and run an on-chain method.

```
$ everdev c run helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 83cb989d99bce34dd7c04dd05a8a155f2a268d241ef8ec41c4c431cce0827f2d)

Address:   0:25d101f07d7ef18260619c5d1cf2bc46173cb70c86129d6eed9ec46ed777e966 (calculated from TVC and signer public)

Available functions:

  1) renderHelloWorld
  2) touch
  3) sendValue
  4) timestamp

  Select function (number): 

```

Let's enter 3. You will see the transaction ID of the operation.

```
    "transaction": {
        "json_version": 5,
        "id": "8087f774d4b8b4d4716cb31a74deea32550a04b40e853f55c64579fa3897108f",
        "boc": "te6ccgECBw......
        ........................
```

You can also execute it inline like this:\
`$ everdev c run helloWorld touch`

In the result you can see the transaction\_id. Search for it on your Contract's page in Explorer and in GraphQL playground (use `transactions` collection instead of `accounts`).

### Run a getter function

```
$ everdev c run-local helloWorld timestamp

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)

Execution has finished with result: {
    "output": {
        "timestamp": "1626898677"
    },
    "out_messages": []
}
```

### Transfer some tokens

```
$ everdev c run helloWorld sendValue

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)

Parameters of sendValue:

  dest (address): 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5
  amount (uint128): 1000000000
  bounce (bool): true

Running...

Execution has finished with result: {
    "transaction": {
        "json_version": 5,
        "id": "550731bb26e5054387a781257e077dbdd769367f16b19bfa529c20475e2a08f6",
        "boc": "te6ccgECCwEAAkwAA7V+dMQlhJbnnmLgFMqWkRrL9csOKG/VXdb049pU5Bl931AAAAAAAAADdx7fDdz4W9u1NnBVF9To555bwxWhiXk8pjgn1OO6cR6wAAAAAAAAAzYPiDAAADRxN2doBQQBAg8MSMYbFBYEQAMCAG/Jh6EgTBRYQAAAAAAAAgAAAAAAAmHZXn3oj36iIsmePH9xls7+ruVE+XB4H24a
```

**Attention!**

* Contracts take value in nanotokens, so in this step we transferred 1 token.
* Bounce = true means that if the recipient does not exist, money will be returned back. **If you plan to transfer money for deploy, specify Bounce = false!**

Again, now you can find this transaction in Explorer or GraphQL API.

### Switch to Development Network

The Development Network, aka devnet is the Everscale test network with free test tokens that has an identical configuration to mainnet. You can test your contracts in a live environment on it.

To access devnet, you need to create an account and a project on [https://dashboard.evercloud.dev/](https://dashboard.evercloud.dev/). Follow [this guide](https://docs.evercloud.dev/products/evercloud/get-started) to do it.

You will get your personal project ID, optional secret key and an endpoint of the following format:\
[https://devnet.evercloud.dev/\<projectID>/graphql](https://devnet.evercloud.dev/%3CprojectID%3E/graphql)

To set devnet up as the default network in everdev, do the following:

```
everdev network default dev
```

Go to your Evercloud [dashboard](https://dashboard.evercloud.dev/), find your "Project Id" and "Secret" (optional) on the "Security" tab, and pass them as parameters:

```sh
everdev network credentials network_name --project <Project Id> --access-key <Secret>
```

Example:

```
everdev network credentials dev --project 01234567890123456789012345678901 --access-key 98765432109876543210987654321098
```

### Set a giver contract on your network

While working with SE network, you already have a preset giver. In Devnet you need to configure your own.

This contract can be some multisig wallet, for example your [Surf](https://ever.surf/) account (don't forget to [switch it to devnet too](https://help.ever.surf/en/support/solutions/articles/77000397828-how-to-select-surf-test-network-)!).

To get test tokens to your future giver, go to your Evercloud [dashboard](https://dashboard.evercloud.dev/), open the **Endpoints** tab of your project, and click the faucet button next to **Development Network**. Specify the address and you will get some free test tokens.

To set the giver up in everdev, first get your giver keys ready. In Surf it is your [seed phrase](https://help.ever.surf/en/support/solutions/articles/77000236693-how-to-get-your-seed-phrase-in-surf-).

Save the keys of your giver account into a signer that will be used to sign giver transactions:

```sh
everdev signer add giver_sign signer_secret_key_or_seed_phrase_in_quotes
```

Then add the giver address specifying the signer to be used with it.

```sh
everdev network giver dev giver_address --signer giver_sign --type giver_type
```

Where

`giver_type` is the type of the giver contract you selected (GiverV1 | GiverV2 | GiverV3 | SafeMultisigWallet | SetcodeMultisigWallet) - for Surf use `SetcodeMultisigWallet`.



**Now you can do all the steps of this guide on devnet and see your transactions on your GraphQL playground at** [**https://devnet.evercloud.dev/\<projectID>/graphql**](https://devnet.evercloud.dev/%3CprojectID%3E/graphql) **and**  [**ever.live**](https://net.ever.live/landing)**!**

## What's next?

1. Also take a look at our [blockchain basics page](https://docs.everscale.network/arch/basics) that will help you understand the core concepts of Everscale:)
2. If you want to integrate your application with Everscale - dive into our [SDK Quick Start](https://docs.everos.dev/ever-sdk/quick\_start)!
3. If you want to explore the GraphQL API more, [here is the documentation](https://docs.evercloud.dev/reference/graphql-api)!
4. If you are an exchange - check out our [exchange guide](https://docs.everos.dev/ever-sdk/add\_to\_exchange)!

We hope this guide was helpful to you! If you have any difficulties/questions/suggestions/etc. please write to out [telegram channel](https://t.me/ever\_sdk).

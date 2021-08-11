# Get started with Development Tools
## Guide overview
This guide will help you get started with such essensial Free TON tools as:
- [Tondev CLI](https://github.com/tonlabs/tondev) 
- [Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler)
- [Local Blockchain](https://github.com/tonlabs/tonos-se)
- [Blockchain Explorer TON Live](ton.live)
- [GraphQL API](https://docs.ton.dev/86757ecb2/p/793337-ton-os-api)
  
You will learn how to:
- Create and compile your first Solidity contract
- Run Local blockchain for testing
- Deploy your first contract
- Run it on-chain
- Run a getter-function
- Make a transfer
- Explore contract data in Explorer and GraphQL playground

## Table of Contents
- [Get started with Development Tools](#get-started-with-development-tools)
  - [Guide overview](#guide-overview)
  - [Table of Contents](#table-of-contents)
    - [Install tondev - single interface to access all the developer tools](#install-tondev---single-interface-to-access-all-the-developer-tools)
    - [Create helloWorld contract](#create-helloworld-contract)
    - [Compile it](#compile-it)
    - [Run Local Blockchain](#run-local-blockchain)
    - [Configure default network](#configure-default-network)
    - [Configure Giver wallet that will sponsor deploy operation](#configure-giver-wallet-that-will-sponsor-deploy-operation)
    - [Generate the keys for contract ownership](#generate-the-keys-for-contract-ownership)
    - [Calculate the contract address](#calculate-the-contract-address)
    - [Deploy](#deploy)
    - [View contract information with Explorer](#view-contract-information-with-explorer)
    - [Explore contract information with GraphQL](#explore-contract-information-with-graphql)
    - [Run on-chain](#run-on-chain)
    - [Run a getter function](#run-a-getter-function)
    - [Transfer some tokens](#transfer-some-tokens)
  - [What's next?](#whats-next)

### Install tondev - single interface to access all the developer tools
```$ npm install -g tondev```

If you experience any problems with installation, check out our [troubleshooting section](https://github.com/tonlabs/tondev/blob/main/docs/troubleshooting.md). 


### Create helloWorld contract
```$ tondev sol create helloWorld```

### Compile it
```$ tondev sol compile helloWorld.sol```

### Run Local Blockchain 
**Attention** Docker should be running.

```$ tondev se start```

### Configure default network 
Set Local Blockchain [SE (Startup Edition)](https://github.com/tonlabs/tonos-se) as the default network:

```$ tondev network default se```

### Configure Giver wallet that will sponsor deploy operation
Here we use address and private key of [SE High Load Giver](https://github.com/tonlabs/tonos-se/tree/master/contracts/giver_v2).

```
$ tondev signer add giver_keys 172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3
$ tondev network giver se 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5 --signer giver_keys
```

### Generate the keys for contract ownership

```
$ tondev signer generate owner_keys
$ tondev signer default owner_keys
$ tondev s l 

Signer                Public Key                                                        Used
--------------------  ----------------------------------------------------------------  ---------------------------
giver_keys            2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16  se network giver signer
owner_keys (Default)  3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b
```
*Note that there are shortcuts for all the commands: s l = signer list :)

**Don't forget to make the owner key default otherwize giver keys will be used as default. 

### Calculate the contract address

```
$ tondev c i helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)
Code Hash: c517820144a4daf5a3414c9233556b2b0ad34cdd228f200ea68a4c0327e0bd29 (from TVC file)
Account:   Doesn't exist
```
You can see that the contract does not exist yet (is not deployed) but you can already see its future address.

### Deploy

```
$ tondev contract deploy helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_keys (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)

Deploying...
Contract has deployed at address: 0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5
```

### View contract information with Explorer
Go to [localhost](http://localhost/) and search for your contract address in search bar.
Open your account page. You will need it later to see its transactions and messages, that we will produce in the next steps. 


### Explore contract information with GraphQL
Go to [localhost/graphql](http://localhost/graphql).
Enter in the left pane and click Run button
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

**What is GraphQL?** 
This is the API of blockchain, to retrieve data from it and to send data into it. 
You can use this playground later, if you will need need to test some queries.  

### Run on-chain
Let's move on and run an on-chain method.

``` 
$ tondev c run helloWorld

Configuration

  Network: se (http://localhost)
  Signer:  owner_key (public 3826202b129ea8c041b8d49a655512648fc94377d1958a7a4fc9f4b3051ecf7b)

Address:   0:e74c4258496e79e62e014ca96911acbf5cb0e286fd55dd6f4e3da54e4197ddf5 (calculated from TVC and signer public)

Available functions:

  1) constructor
  2) renderHelloWorld
  3) touch
  4) sendValue
  5) timestamp

  Select function (number): 
```

  Let's enter 3. You will see the transaction ID of the operation.

```Execution has finished with result: {
    "transaction": {
        "json_version": 5,
        "id": "8087f774d4b8b4d4716cb31a74deea32550a04b40e853f55c64579fa3897108f",
        "boc": "te6ccgECBw......
        ........................
```

You can also execute it inline like this:  
```$ tondev c run helloWorld touch```

In the result you can see the transaction_id. 
Search for it on your Contract's page in Explorer and in GraphQL playground (use `transactions` collection instead of `accounts`). 

### Run a getter function

```
$ tondev c run-local helloWorld timestamp

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
$ tondev c run helloWorld sendValue

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
- Contracts take value in nanotokens, so in this step we transfered 1 token.
- Bounce = true means that if the recipient does not exist, money will be returned back. 
**If you plan to transfer money for deploy, specify Bounce = false!**

Again, now you can find this transaction in Explorer or GraphQL API. 

## What's next? 

1. Also take a look at our [blockchain basics page](https://ton.dev/faq/blockchain-basic) that will help you understand the core concepts of Free TON:)

2. If you want to integrate your application with Free TON - dive into our [SDK Quick Start](https://docs.ton.dev/86757ecb2/p/33b76d-quick-start)!

3. If you are an exchange - check out our [exchange guide](https://docs.ton.dev/86757ecb2/p/10aec9-add-ton-crystal-to-your-exchange)!

We hope this guide was helpful to you! If you have any difficulties/questions/suggestions/etc. please write to out telegram channel https://t.me/ton_sdk. 

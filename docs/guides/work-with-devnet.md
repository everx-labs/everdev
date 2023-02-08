# Working with DevNet: deploy and start using your own giver in Developer Network

## Contents

- [Working with DevNet: deploy and start using your own giver in Developer Network](#working-with-devnet-deploy-and-start-using-your-own-giver-in-developer-network)
  - [Contents](#contents)
  - [Deploying your own Giver](#deploying-your-own-giver)
    - [Get your Devnet credentials](#get-your-devnet-credentials)
    - [Generate Giver keys](#generate-giver-keys)
    - [Compile Giver code](#compile-giver-code)
    - [Calculate Giver address](#calculate-giver-address)
    - [Sponsor Giver with public faucet](#sponsor-giver-with-public-faucet)
    - [Deploy Giver contract](#deploy-giver-contract)
  - [Configure everdev to use your Giver](#configure-everdev-to-use-your-giver)
  - [Testing your new Giver](#testing-your-new-giver)

Working with DevNet is similar to working with SE except you usually don't have any predeployed giver in DevNet. So you need to fund your contracts manually or deploy your own giver, which you will be able to use the same way as in SE. Deploying your own giver can be useful, if you need to deploy many contracts or need to frequently redeploy and test contract after subsequent midification.

## Deploying your own Giver

In order to deploy the Giver, do the following steps, like for an ordinary contract:

### Get your Devnet credentials

First, go to https://www.evercloud.dev/ and register in the dashboard. 
Follow this instruction: https://docs.evercloud.dev/products/evercloud/get-started
Save your project ID and secret, if you enabled it.

Now, run this command. Specifying secret is optional - only if you enabled it:
```
$ everdev network credentials dev --project "Project Id" --access-key "Project secret"
```

### Generate Giver keys

```
$ everdev signer generate devnet_giver_keys
$ everdev s l

Signer             Public Key
-----------------  ----------------------------------------------------------------
test (Default)     de101cde5c94540926fe862e965cf109b1b803989e7048657cf7c4caaa2a257d
devnet_giver_keys  5a343ccbd62c15e3df1076bc34957ad2717469d84e4d6b3ef26112db80ac8e1b
```

### Compile Giver code

You can find compiled giver v4 contract with code [here](https://github.com/tonlabs/evernode-se/tree/master/contracts/giver_v4). You need to recompile code only if you want to change its code, so you can use compiled `GiverV4.tvc` file and move to the next step.

**Attention!**
This giver is recommended to use with solc version above 0.61.2 to deploy it on devnet or mainnet.

After modifying code, compile it:
```
$ everdev sol compile GiverV4.sol
```
In a case of success, compiler will generate two files: compiled code (`GiverV4.tvc`) and ABI (`GiverV4.abi.json`). You need these files for the next steps.

### Calculate Giver address

In order to deploy contract, you need to know its address:

```
$ everdev contract info -n dev -s devnet_giver_keys GiverV2.tvc

Configuration

  Network: dev 
  Signer:  devnet_giver_keys (public 5a343ccbd62c15e3df1076bc34957ad2717469d84e4d6b3ef26112db80ac8e1b)

Address:   0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3 (calculated from TVC and signer public)
Code Hash: ccbfc821853aa641af3813ebd477e26818b51e4ca23e5f6d34509215aa7123d9 (from TVC file)
Account:   Doesn't exist
```

### Sponsor Giver with public faucet

On the next step, you need to sponsor your Giver's address, which you have obtained on the previous step, with funds in order to be able to deploy contract. The easiest way to do it in DevNet is to use [EverGiver[DevNet] Telegram bot](https://t.me/everdev_giver_bot). It can give you 111 rubies maximum per address. If you need more, or in a case of different test network, you can contact an owner of particular network (for DevNet it is TON Labs).

In EverGiver Telegram bot type (change Giver's address to the address obtained at previous step):

```
/give 111 0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3
```

Wait for operation completion. Check address balance in [Blockchain Explorer](https://net.ever.live).

### Deploy Giver contract

For contract deployment you need to have compiled contract files (`GiverV4.tvc` and `GiverV4.abi.json`) and giver keys. To deploy contract execute next command:

```
$ everdev contract deploy -n dev -s devnet_giver_keys GiverV2.tvc

Configuration

  Network: dev 
  Signer:  devnet_giver_keys (public 5a343ccbd62c15e3df1076bc34957ad2717469d84e4d6b3ef26112db80ac8e1b)

Address:   0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3 (calculated from TVC and signer public)

Deploying...
Contract has deployed at address: 0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3
```

Done, now you have your own Giver, deployed to the DevNet! Let's configure `everdev` to use your Giver by default.

## Configure everdev to use your Giver

For convenience, you might need to configure `everdev` in order to use your Giver as default. To do it, execute the next command (change address to your Giver's address, obtained on previous steps):

```
$ everdev network giver dev 0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3 --signer devnet_giver_keys
```

Check:

```
$ everdev n l
Network       Endpoints                                        Giver
------------  -----------------------------------------------  ------------------------------------------------------------------
se (Default)  http://localhost                                 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5
                                                                 GiverV4
dev           eri01.net.everos.dev, rbx01.net.everos.dev, gra01.net.everos.dev          0:93139197f2f58d674bee4ee71a42d8f1e7b6a3c3e041ded7a54d330bcc44f3b3
                                                                 GiverV4 signed by devnet_giver_keys
main          eri01.main.everos.dev, gra01.main.everos.dev, gra02.main.everos.dev ...
```

If Giver is set, you will see you Giver's address and keypair name for the `dev` network.

## Testing your new Giver

For testing your new Giver, try to topup any address, for example, one of the contract's address, which you need to deploy:

```
$ everdev contract topup --network dev --address <address> --value 10000

Configuration

  Network: dev 
  Signer:  test (public de101cde5c94540926fe862e965cf109b1b803989e7048657cf7c4caaa2a257d)

Address:   <address>
0.00001 tokens (10000 nano) were sent to address <address>
```

# Deploy and call your contracts with TONDev
In this article, you will learn how to work with a contact in TONDev. 
This sample covers such functionality as network configuration, deploy (including giver configuration), on-chain execution, read contract data.

To cover this functionality we will test the following use-case: deploy a multi-signature contract with two custodians, which confirm a transaction to transfer funds from this wallet to another wallet account.

## Preparing the contract deployment environment

1. To deploy the contract in the Developer network, you need to have a wallet with tokens, that you will use to prepay the initial deploy operation. Surf can help us with that.

 Install the TON Surf application on your mobile device. 

**Attention!** Only the mobile version of TON Surf enables you to get Rubies. After installing TON Surf on your mobile device and receiving Rubies, you can access your TON Surf account via the web (URL: [https://web.ton.surf/](https://web.ton.surf/)).

 To get Rubies:
    1. Click the Settings icon in the upper left corner and select Advanced settings.    
    2. Turn on the Developer mode.   
    3. Go back to the main screen and click Chain Rider > Get Rubies.   
    4. Verify that the Rubies you received are displayed in the Developer balance.   

2. To configure the environment required for contract development, you should install the TONDev tool by running the following command:

```
npm i -g tondev
```

3. Add a Developer Network to the TONDev registry with two endpoints (for details, see [Networks](https://docs.ton.dev/86757ecb2/p/85c869-networks/t/660e33)):

```
tondev network add devnet net1.ton.dev,net5.ton.dev
```

4.	Specify the developer’s network devnet as a default network for contract development (see the [TONDev documentation](https://github.com/tonlabs/TONDEV#network-tool)) by running the following command:

```
tondev network default devnet
```

5.	To enable using your wallet as a giver, you need to import the seed phrase from Surf to TONDev. In Surf, select: Settings > Safety protection > Master password. The system will ask you to enter your PIN. After successful PIN validation, it will display the master password, consisting of 12 words (seed phrase). Copy and save your seed phrase.

6.	Add a signer with previously generated keys (seed phrase):

```
tondev signer add <signer_name> <seed_phrase_in_quotes>
```

**Note:** The seed is enclosed in quotes and consists of 12 words, separated by space (see [TONDEV Free TON Development Environment](https://github.com/tonlabs/tondev#add-a-signer-with-specific-keys)).

For example:

```
tondev signer add signer1 "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
```

7. Copy and save the wallet address from Surf by selecting: Chain Rider > Share wallet address.

**Note:** Alternatively, you can access the wallet address from Settings > Safety Protection > Address and keys, or you can click Receive and then click on the address (will be copied automatically). 

8.	Configure the Surf wallet as a giver for the network (devnet) with the wallet address and signer (created in step 6) as shown in the below command example:

```
tondev network giver devnet 0:4a367a6beade23b7b5b98a6b018f797787986b3fad3704550ac87655abe5643e
 -s signer1
```

**Note:** The default value sponsored by the a giver is 1 token. The sponsored value can be changed with the `-value`  option. The `-value`  parameter is specified in nanotokens (1 token = 1000000000 nanotokens).

9.	Create a directory that you will use as a work folder for your contract testing (`multisig` folder in this example) and enter it. 

```jsx
mkdir multisig
cd multisig
```

10.	Download the abi and .tvc files  from the [multisig contract directory](https://github.com/tonlabs/ton-labs-contracts/tree/master/solidity/setcodemultisig) and copy them into your working directory (`multisig`). 

12.	Add two signers with [randomly generated keys](https://github.com/tonlabs/tondev/blob/main/README.md):

```
tondev signer generate <signer_name1>
```

```
tondev signer generate <signer_name2>
```

Refer to the example below:

```
tondev signer generate k1
```

```
tondev signer generate k2
```

13.	Specify the first key pair (k1) as a default:

```
tondev signer default k1
```

14.	To view public keys, execute the following command:

```
tondev signer info
```

The example of signer information is provided below:

```
Signer Public Key
----------------
---------------------------------------------------------------
signer1 eac2da069edaede16499b9565c194b6871bdf2f811e09d5b3c20a2a1352613b6
k1 (Default)
aa1787d058eafdf4453274b063e4ddfb05492ddc1b01e91d06681466f35475ed
k2
fc911f562450a5cf943fa2ac5d0f6baf3d107ac2daf37dcdc1da72785158ff2a
```

## Deploying the contract

1. To [deploy the contract](https://github.com/tonlabs/tondev#deploy-contract) to blockchain with two custodians, run the following command:

```
tondev contract deploy <contract_name>
```

Note that in this example, the contract name is SetcodeMultisigWallet (the abi file name), as shown in the command below:

```
tondev contract deploy SetcodeMultisigWallet
```

**Note:** In this command, the key is not defined explicitly (k1 is used by default).

When running this command, you enter the following options (constructor parameters):

- Number of signers (number of items in owners: 2).
- Owner 1: The first signer’s (K1) public key value preceded with 0x characters.
- Owner 2: The second signer’s (K2) public key value preceded with 0x characters.
- Number of required confirmations: 2

The example of constructor parameters is shown below:

```
Parameters of constructor:
1. Enter number of items in owners: 2
2. owners 1 (uint256): 0xaa1787d058eafdf4453274b063e4ddfb05492ddc1b01e91d06681466f35475ed
3. owners 2 (uint256): 0xfc911f562450a5cf943fa2ac5d0f6baf3d107ac2daf37dcdc1da72785158ff2a
reqConfirms (uint8): 2
```

2. Verify that the contract is successfully deployed as shown in the example below:

```
Deploying...
Contract was deployed at address:
0:e61e3b688b3c388540ce5116ad9de41cb2927fe4915ddad5bd30b3a713b0f148
```

## Calling the Contract

When the contract is successfully deployed in the blockchain, we can run its methods. 

In this example, you will create a transaction by the first custodian and confirm it by the second custodian. 

1. You will sequentially call the following three methods:

    1) On-chain call of the [submitTransaction](https://github.com/tonlabs/ton-labs-contracts/blob/776bc3d614ded58330577167313a9b4f80767f41/solidity/setcodemultisig/SetcodeMultisigWallet.sol#L273) to initiate the transfer by the first custodian

    2) Off-chain call of the [getTransaction](https://github.com/tonlabs/ton-labs-contracts/blob/776bc3d614ded58330577167313a9b4f80767f41/solidity/setcodemultisig/SetcodeMultisigWallet.sol#L398) method to get the created transaction ID

    3) The last on-chain call of the [confirmTransactio](https://github.com/tonlabs/ton-labs-contracts/blob/776bc3d614ded58330577167313a9b4f80767f41/solidity/setcodemultisig/SetcodeMultisigWallet.sol#L307)n method to confirm the transaction by the second custodian (see [Run contract deployed on the network](https://github.com/tonlabs/tondev#run-contract-deployed-on-the-network) for details).

2. Call contract’s `submitTransaction` method with the first custodian key (k1) to initiate a transaction to some random address. Select function 4 (`submitTransaction`) with the following parameters:
    - dest (address) – the destination address (wallet address copied from the recipient’s TON Surf application). **Note**: In this example, another Surf walled was created. Its address is used as a recipient address.
    - value – the value in nanotokens (1 token = 1000000000 nanotokens)
    - bounce (bool) – true if tokens are transferred to an existing account; set false to transfer to a non-deployed account
    - allBalance – true if need to transfer all remaining balance
    - payload (cell) – leave blank.

The example of the command to run the contract with the `submitTransaction` function is shown below:

```
tondev contract run SetcodeMultisigWallet --signer k1
```

```
Configuration
Network: devnet (net1.ton.dev, net5.ton.dev)
Signer:
k1 (public aa1787d058eafdf4453274b063e4ddfb05492ddc1b01e91d06681466f35475ed)
Address:
0:959f470d3431ec94c7294209d8dcb7b7c5a0b8ed848c1d383e1a1c28b5b415c5 (calculated from
TVC and signer public)
Available functions:
1) constructor
2) acceptTransfer
3) sendTransaction
4) submitTransaction
5) confirmTransaction
6) isConfirmed
7) getParameters
8) getTransaction
9) getTransactions
10) getTransactionIds
11) getCustodians
12) submitUpdate
13) confirmUpdate
14) executeUpdate
15) getUpdateRequests
Select function (number): 4
Parameters of submitTransaction:
dest (address): 0:8a398f150c7eff3927eb23b52af9c5c29a0aca67b49b9ac5e9bdac04e25fefa6
value (uint128): 1000000000
bounce (bool): true
allBalance (bool): false
payload (cell):
Running...
```

In the output, note the transaction ID (`transId` field) value, which will be used in the next step.

For example: 

```
...
"output": {
"transId": "6963980449992624641"
},
...
```

2.	Execute the command to run the contract locally and call the get`getTransaction` method.

```
tondev contract run-local <contract_name>
```

Select function 8 (`getTransaction`) and enter the transaction ID parameter value.

Refer to the example below:

```
tondev contract run-local SetcodeMultisigWallet
Configuration
Network: devnet (net1.ton.dev, net5.ton.dev)
Signer:
k1 (public aa1787d058eafdf4453274b063e4ddfb05492ddc1b01e91d06681466f35475ed)
Address:
0:959f470d3431ec94c7294209d8dcb7b7c5a0b8ed848c1d383e1a1c28b5b415c5 (calculated from
TVC and signer public)
Available functions:
1) constructor
2) acceptTransfer
3) sendTransaction
4) submitTransaction
5) confirmTransaction
6) isConfirmed
7) getParameters
8) getTransaction
9) getTransactions
10) getTransactionIds
11) getCustodians
12) submitUpdate
13) confirmUpdate
14) executeUpdate
15) getUpdateRequests
Select function (number): 8
Parameters of getTransaction:
transactionId (uint64): 6963980449992624641
```

3. Run the contract and call the [confirmTransaction](https://github.com/tonlabs/ton-labs-contracts/blob/776bc3d614ded58330577167313a9b4f80767f41/solidity/setcodemultisig/SetcodeMultisigWallet.sol#L307) method with the second custodian key to confirm the transaction:

```
tondev contract run <contract_name> -a <contract_address> --signer (second_signer name)
```

- Choose function 5: (`confirmTransaction`).
- Enter the transaction ID (`transId`) parameter value.

In the below example, we execute the following command:

```
tondev contract run SetcodeMultisigWallet -a 0:959f470d3431ec94c7294209d8dcb7b7c5a0b8ed848c1d383e1a1c28b5b415c5 --signer k2
```

**Note:** In this command, we explicitly specify the the second (not default) custodian (K2) and the contract deployment address.

```
Configuration
Network: devnet (net1.ton.dev, net5.ton.dev)
Signer: k2 (public fc911f562450a5cf943fa2ac5d0f6baf3d107ac2daf37dcdc1da72785158ff2a)
Address:
0:959f470d3431ec94c7294209d8dcb7b7c5a0b8ed848c1d383e1a1c28b5b415c5
Available functions:
1) constructor
2) acceptTransfer
3) sendTransaction
4) submitTransaction
5) confirmTransaction
6) isConfirmed
7) getParameters
8) getTransaction
9) getTransactions
10) getTransactionIds
11) getCustodians
12) submitUpdate
13) confirmUpdate
14) executeUpdate
15) getUpdateRequests
Select function (number): 5
Parameters of confirmTransaction:
transactionId (uint64): 6963980449992624641
Running...
```

4. Verify that the transaction is completed successfully and the tokens are transferred to the recipient’s account.

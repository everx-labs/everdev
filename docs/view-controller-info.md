# View controller info

This command displays a summary of all controller configurations.

```
everdev info
```
Output example:

$ everdev info

```
C++ compiler

Component  Version  Available
---------  -------  ---------
clang      7.0.0    7.0.0

Solidity Compiler

Component  Available
---------  ----------------------------------------------
compiler   0.42.0, 0.41.0, 0.40.0, 0.39.0, 0.38.2, 0.38.1
linker     0.3.0, 0.1.0
stdlib     0.42.0, 0.41.0, 0.40.0, 0.39.0, 0.38.2, 0.38.1

EVER OS SE

Instance  State          Version  GraphQL Port  Docker Container      Docker Image
--------  -------------  -------  ------------  --------------------  -----------------------
default   not installed  0.27     80            tonlabs-tonos-se-test  tonlabs/local-node:0.27

Network Registry

Network        Endpoints                                        Giver
-------------  -----------------------------------------------  ------------------------------------------------------------------
se             http://localhost                                 0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5
dev (Default)  net.ton.dev, net1.ton.dev, net5.ton.dev          0:255a3ad9dfa8aa4f3481856aafc7d79f47d50205190bd56147138740e9b177f3
main           main.ton.dev, main2.ton.dev, main3.ton.dev, ...

Signer Registry

Signer          Public Key
--------------  ----------------------------------------------------------------
surf            8534c46f7a135058773fa1298cb3a299a5ddd40dafe41cb06c64f274da360bfb
test (Default)  ad4bf7bd8da244932c52127a943bfa9217b6e215c1b3307272283c4d64f34486
test2           5c2e348c5caeb420a863dc5e972f897ebe5ee899a6ef2a8299aac352eca4380a

EVER OS CLI

Component  Version  Available
---------  -------  --------------------------------------------------------------------------------
tonoscli   0.11.3   0.11.4, 0.11.3, 0.11.2, 0.11.1, 0.11.0, 0.10.1, 0.10.0, 0.9.2, 0.9.1, 0.9.0, ...
```

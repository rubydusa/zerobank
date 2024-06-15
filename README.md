# Zero Bank (Circom demo)

This repository contains the code from my presentation on Circom.
Some of the images and other sources presented in the presentation can be found in the `presentation` directory.

## About
This demo demonstrates how zero knowledge proofs can be used in applications to preserve user privacy and perform computation on sensitive data in a public context.
Our hypothetical bank ZeroBank is a private and decentralized bank that manages user registration through a smart contract. There are three tiers of accounts users can register:
- Basic
- Gold
- Platinum

Each tier has a different monthly income requirement:
- Basic (>=0$)
- Gold (>10,000$)
- Platinum (>20,000$)

However, there is a problem: the income of users is sensitive information and it would compromise privacy if users were to report their exact income on-chain.

### Soltion
The first step is for ZeroBank to recognize a certificate authority that is permitted to make claims about the income of users (In a real life context this could be a government organization, the user's employer, etc..)
Secondly, users retrieve certificates from that authority with their income data signed.

Then, when users wish to register, they create a zero knowledge proof that their income is signed by said authority, and that their income is greater than the threshold set by the bank. By utilizing a zero knowledge proof, users refrain from revealing their exact income while simulteniously proving it is in a certain range.
The bank's registration smart contract can trustlessly verify upon registration that a user submits a valid proof.

### Points for improvements and expansion
This solution is kept very simple for demonstration purposes, but there are many glaring issues that can be addressed and improved upon. These examples emphasize the versatility of ZK and how much power it gives to application developers.

#### 1. Bank and certificate authority collusion
In order to prevent 'double-spending' of a certificate, the on-chain address of the user is included in the certificate (only the wallet that has the address in the certificate can utilize the certificate). As a consequence of that, the bank could contact the certificate issuer and relate the on-chain address to a real identity.

With an incremental merkle tree system, you could prove membership in the group of all users that retrieved a certificate. To those familiar, tornado cash's system utilizes in a similar manner an incremental merkle tree in order to dissasociate wallets that deposit money and wallets that retrieve money.

#### 2. Single point of failure
The bank depends solely on the central certificate authority to verify users income claims. If the authority is compromised, all applications that depend on it break.

Instead of proving knowledge of a signature produced by a single authority, you could rely on multiple independant certificate authorites and prove that at least N out of M signed your income data.

#### 3. Could be implemented more simply with plain signatures
At last, although it's not a problem, the requirements set by the bank for different types of accounts are simplistic and could solved more easily by simply requiring a the certificate authorities to sign a message in the format of "User X has more than 10,000$ monthly income".

The real power of ZK reveals itself when there are complex requirements in the computations that need to be performed on private data. Think for example if instead of simply requiring user income to be above a certain threshold, the bank requires proof of avaerage monthly income above a certain threshold over a period of time, with a standard deviation no less than 5%. 

Sure, certificate authorities could sign messages attesting to these, but what if tomorrow the bank decides that it accepts standard deviation of up to 10%? or that there is a new requirement? 

## Usage

### Prerequesties:
- [Circom](https://github.com/iden3/circom)
- [Foundry](https://github.com/foundry-rs/foundry)
- NodeJS

### Run:
First, clone the repository:
```
> git clone https://github.com/rubydusa/zerobank.git
```

Enter the directory and install dependancies:
```
> npm i
> forge install
```

Run tests:
```
> npm test
> forge test
```

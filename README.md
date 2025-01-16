# Smart Contract Fundamentals

## Projects Overview

## Inline-Assembly
- The goal of this basic contract is replicate basic functionality that can be written in Solidity, with EVM Opcodes.
- It includes a test for "String.sol", to ensure that the function works as intended.
- This is to understand the fundamentals of the EVM stack.

## Upgradeable-Contracts
- The goal of this basic contract is to make an NFT, ERC20 and staking contract upgradeable.
- To then create a new NFT contract and upgrading it.
- It includes the deployment scripts.

## Advanced-NFT
- Implement an ERC721 NFT smartcontract with a merkle tree airdrop, where the address can only mint once.
- Showcases the use of bitmaps.
- Uses commit-reveal pattern to allocate random NFTs.
- Uses multicall so people can transfer multiple NFTs at once.

## Testing
- The aim of this project was to preform static analysis, unit testing + code coverage, mutation testing.
- Includes the basic contract ERC20 + ERC1155, basic test & basic results.
- mutation tests reports were left as is, to show errors. Contracts would need to be ammended for better result. 

## Vault
- This is a basic ERC4626 vault smart contract, that uses chainlink automation.
- It incorperates a fee structure, but the % gain for the user is fake as it is not
connected to a liqudity pool, yield farming etc...
- The fake gains are used to trigger the chainlink automation.
- It includes a basic contract to read chainlin price feeds.
---------------------------------------------------------------------------------
#### Notes
- This repository is a work in progress, where more complex smart contracts and fundamentals will be added.

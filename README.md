# Smart Contract Fundamentals

## 📚 Projects Overview
This repository is a curated collection of smart contract projects designed to build and demonstrate a solid understanding of Ethereum Smart Contract development fundamentals. Each project focuses on a specific concept, and includes corresponding contracts, scripts or tests.



## 🛠 Inline-Assembly
This project explores low-level programming using **EVM Opcodes** and **inline assembly**.
- Implements basic functionality typically written in high-level Solidity using ```assembly``` to gain a deeper understanding of how the **EVM stack** operates.
- Inlcudes a test for ```String.sol```, which replicates string behaviour using raw opcodes.
- Great for developers aiming to understand Solidity __"under the hood"__.
  

## ♻ Upgradeable-Contracts
This project demonstrates how to write and manage **upgradeable smart contracts** using proxy patterns.
- Applies the pattern to **ERC20**, **ERC721**, and **staking** contracts.
- Demonstrates how to deploy a proxy contract and **upgrade** it's logic by replacing the implementation. (i.e. craeting a new version of the NFT contract).
  

## 🧬 Advanced-NFT
An advanced **ERC721** project that demonstrates modern techniques in NFT development:
- **Merkle Tree Airdrop:** Ensures that each eligible address can only mint once.
- **Bitmaps:** Efficient tracking of minting eligibility or user interactions.
- **Commit-Reveal Pattern:** Secure and fair random allocation of NFTs, achieved securely.
- **Multicall Support:** Enables users to batch transfer multiple NFTs in a single transaction, reducing gas costs.

  
## 🧪 Testing & Analysis
This project focuses on smart contract quality assurancce using various testing methodologies:
- Covers **unit testing**, **static analysis**, **code coverage**, and **mutation testing**.
- Uses basic ```ERC20``` and ```ERC1155``` contracts to demonstrate core testing principles.
- Mutation test results are left intentionally as-is to highlight areas needing improvement.
- Optionally integrates **Foundry** for **fuzz testing**, enabling random and edge-case exploration.
  

## 💰 Vault
A simplified example of an **ERC4626-compliant vault**, integrated with **Chainlink Automation**:
- Simulates yield farming by implementing a fake returns mechanism for users.
- Includes a fee structure to demonstrate real-world vault logic.
- Automates vault updates {interest distribution} using **Chainlink Keepers (Automation)**.
- Includes a basic/minimal contract to read Chainlink testnet **price feeds**.
  
  
---------------------------------------------------------------------------------
#### 📃 Notes
This repository is a **work in progress**, and will continue to expand with more complex smart contracts and deeper explorations of Ethereum fundamentals. It serves as both a learning resource and foundation for more advanced projects.

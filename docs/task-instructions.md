# Overview

Thank you for your interest in CoinTracker! 🎉

We'd like you to work on this assignment to get a sense of your technical skills in designing and building a system that closely resembles the type of work we do day-to-day at CoinTracker.

Please submit your output within **24 hours** of starting the assignment.

We suggest reading through this doc, taking some time to think, setup your local environment for development, and budgeting ~**2 - 4 hours** for completing the assignment.

# The assignment

## Context

Traders often need detailed transaction history to track their asset movements, reconcile their portfolios, and report their holdings accurately. Many portfolio tracking applications require structured transaction data, but retrieving and organizing this data manually can be tedious.

By automating the process of fetching and categorizing Ethereum wallet transactions, this project aims to streamline transaction tracking. Users can easily export their transaction history into a CSV file, which can then be imported into portfolio management software or used for personal record-keeping.

This system will be valuable for individuals and businesses managing multiple wallets, ensuring accurate reporting and improving financial tracking efficiency.

## Objective

Develop a script that retrieves transaction history for a specified Ethereum wallet address and exports it to a structured CSV file with relevant transaction details.

### Inputs:

- The script should accept an Ethereum wallet address as an input
    - Sample ETH addresses:
        - [0xa39b189482f984388a34460636fea9eb181ad1a6](https://etherscan.io/address/0xa39b189482f984388a34460636fea9eb181ad1a6)
        - [0xd620AADaBaA20d2af700853C4504028cba7C3333](https://etherscan.io/address/0xd620AADaBaA20d2af700853C4504028cba7C3333)
        - Large addresses with transfers: assume [0xfb50526f49894b78541b776f5aaefe43e3bd8590](https://etherscan.io/address/0xfb50526f49894b78541b776f5aaefe43e3bd8590) (160,000+ transactions).

### Data Retrieval:

- Examples of API’s you can use to fetch transaction data for a given ETH address - Etherscan, Alchemy , Blockscout, Infura

### Data Processing:

- Extract & categorize transactions into
    - External(Normal) Transfers - These are direct transfers between user controlled addresses
    - Internal Transfers - These are transfers that occur within smart contracts & not directly initiated by users.
    - Token Transfers
        - ERC-20, ERC-721

### Output:

- Generate a CSV file containing relevant transaction details.
- The CSV should include these essential fields for ETH transfers, ERC-20 tokens, ERC-721 NFTs, and ERC-1155 assets:
    - **Transaction Hash** – Unique identifier for the transaction
    - **Date & Time** – Transaction confirmation timestamp
    - **From Address** – Sender's Ethereum address
    - **To Address** – Recipient's Ethereum address or contract
    - **Transaction Type** – ETH transfer, ERC-20, ERC-721, ERC-1155, or contract interaction
    - **Asset Contract Address** – Contract address of the token or NFT (if applicable)
    - **Asset Symbol / Name** – Token symbol (e.g., ETH, USDC) or NFT collection name
    - **Token ID** – Unique identifier for NFTs (ERC-721, ERC-1155)
    - **Value / Amount** – Quantity of ETH or tokens transferred
    - **Gas Fee (ETH)** – Total transaction gas cost

## Bonus(Optional) - Pls include answers to these in the Notion Doc

- If you were designing this for a larger scale system, how would you structure & store the transaction data for easy retrieval?
- What trade offs would you consider when handling more complex transactions beyond simple send and receive such as [add liquidity on Uniswap](https://etherscan.io/tx/0x5151b1e1e3543f45a07b2b3056318b85d55b86c661967242c78a78f65e439601) ?

## Evaluation Criteria

We’re looking for: 

- A working proof of concept
- Clean, well structured and maintainable code with error & exception handling
- Clear explanation of design choices - Be ready to discuss improvements/ modifications
- Testing - It’s not necessary to write all the tests but it is important to define the critical test cases/ scenarios you’d write tests for.


### What are the next steps?

Pls include a link to your source code + answers to the questions above in this Notion doc and shoot us an email when you are done, and we'll get back to you within a few business days. 

1. **Source code:** Please share the link to your project source code on GitHub as soon as you’re finished.  For private projects, add GitHub user `ct-hiring` as a collaborator (https://github.com/ct-hiring).
    1. Use the programming languages and frameworks that you are most comfortable with. **Make sure your development environment is reproducible by CoinTracker engineers.** 
2. **README:** Your `README` file should make it clear how to setup the development environment and run your code. 
    1. Include information about the assumptions made while building the project
    2. Highlight interesting architecture decisions
3. Please also provide us feedback via email.
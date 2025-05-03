Since we are depending on the Alchemy RPC call `alchemy_getAssetTransfers`, we'd need to conduct a data analysis to see the key-value pairs and their differences across different types.

See: `docs/data-considerations.js`

Alchemy gives us all these types to pick from:
```
"external",
"internal",
"erc20",
"erc721",
"erc1155",
"specialnft",
```

With a good instruction to GitHub Copilot, we may be able to do a quick research about common and non-common fields.

Prompt:
- feed: `docs/data-considerations.js`
`Spot key differences between objects keys and types (not values) between external, internal, erc721, erc1155, specialNFT` 

--------------------------------------------------- Results ----------------------------------------------------

GitHub Copilot: Here is a comparison of the **keys** and **types** for the objects `external`, `internal`, `erc20`, `erc721`, `erc1155`, and `specialNFT`:

---

### **Key Differences Across Objects**

| **Key**             | **External**       | **Internal**       | **ERC20**          | **ERC721**         | **ERC1155**        | **SpecialNFT**     |
|----------------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|
| `blockNum`          | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `uniqueId`          | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `hash`              | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `from`              | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `to`                | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `value`             | `Number`          | `Number`          | `Number`          | `Null`            | `Null`            | `Null`            |
| `erc721TokenId`     | `Null`            | `Null`            | `Null`            | `String`          | `Null`            | `Null`            |
| `erc1155Metadata`   | `Null`            | `Null`            | `Null`            | `Null`            | `Array`           | `Null`            |
| `tokenId`           | `Null`            | `Null`            | `Null`            | `String`          | `Null`            | `String`          |
| `asset`             | `String`          | `String`          | `String`          | `String`          | `String`          | `String`          |
| `category`          | `"external"`      | `"internal"`      | `"erc20"`         | `"erc721"`        | `"erc1155"`       | `"specialnft"`    |
| `rawContract.value` | `String`          | `String`          | `String`          | `Null`            | `Null`            | `Null`            |
| `rawContract.address`| `Null`           | `Null`            | `String`          | `String`          | `String`          | `String`          |
| `rawContract.decimal`| `String`         | `String`          | `String`          | `Null`            | `Null`            | `String`          |
| `metadata.blockTimestamp` | `String`   | `String`          | `String`          | `String`          | `String`          | `String`          |

---

### **Key Observations**

1. **Keys Unique to `external` and `internal`**:
   - `value`: Present as a `Number` in both `external` and `internal`. It is `Null` in all other categories.

2. **Keys Unique to `erc20`**:
   - `rawContract.value`: A `String` representing the value in hexadecimal format.
   - `rawContract.address`: A `String` containing the contract address.
   - `rawContract.decimal`: A `String` representing the number of decimals.

3. **Keys Unique to `erc721`**:
   - `erc721TokenId`: A `String` representing the token ID.
   - `tokenId`: A `String` that matches `erc721TokenId`.

4. **Keys Unique to `erc1155`**:
   - `erc1155Metadata`: An `Array` containing metadata for multiple tokens (e.g., `[{ tokenId: "0x18", value: "0x01" }]`).

5. **Keys Unique to `specialNFT`**:
   - `tokenId`: A `String` representing the token ID (similar to `erc721` but distinct in context).

6. **Common Keys Across All Objects**:
   - `blockNum`, `uniqueId`, `hash`, `from`, `to`, `asset`, `category`, `metadata.blockTimestamp`.

7. **`rawContract` Differences**:
   - `external` and `internal`: `rawContract.value` is a `String`, but `rawContract.address` is `Null`.
   - `erc20`, `erc721`, `erc1155`, and `specialNFT`: `rawContract.address` is a `String`.

---

### **Summary Table of Unique Keys**

| **Category**   | **Unique Keys**                                                                 |
|-----------------|---------------------------------------------------------------------------------|
| `external`     | `value`                                                                         |
| `internal`     | `value`                                                                         |
| `erc20`        | `rawContract.value`, `rawContract.address`, `rawContract.decimal`               |
| `erc721`       | `erc721TokenId`, `tokenId`                                                      |
| `erc1155`      | `erc1155Metadata`                                                               |
| `specialNFT`   | `tokenId`                                                                       |

This comparison highlights the structural and type differences between the objects, making it easier to handle them programmatically.


--------------------------------------------------------------------------------------------------------------------

Our main goal is to extract:

- **Transaction Hash** – Unique identifier for the transaction
  -> mapped to: .hash
- **Date & Time** – Transaction confirmation timestamp
  -> mapped to: .metadata.blockTimestamp
- **From Address** – Sender's Ethereum address
  -> mapped to: .from
- **To Address** – Recipient's Ethereum address or contract
  -> mapped to: .to
- **Transaction Type** – ETH transfer, ERC-20, ERC-721, ERC-1155, or contract interaction
  -> mapped to: .category
- **Asset Contract Address** – Contract address of the token or NFT (if applicable)
  -> mapped to: .rawContract.address | nullable
- **Asset Symbol / Name** – Token symbol (e.g., ETH, USDC) or NFT collection name
  -> mapped to: .asset
- **Token ID** – Unique identifier for NFTs (ERC-721, ERC-1155)
  -> mapped to: .tokenId | .erc1155Metadata[n].tokenId | nullable
- **Value / Amount** – Quantity of ETH or tokens transferred
  -> mapped to: .value | 0
- **Gas Fee (ETH)** – Total transaction gas cost
  -> Pick from another RPC call.




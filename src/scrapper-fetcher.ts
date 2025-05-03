import * as DbSchema from "./db-schema";
import * as Viem from "viem";
import Axios from "axios";
import Chains from "./chains";
import Logger from "./logger";
import Env from "./env";

interface AlchemyGetAssets
{
  hash: string;
  blockNum: string;
  uniqueId: string;
  category: string;
  metadata: { blockTimestamp: string; };
  from: string;
  to: string;
  tokenId?: string;
  rawContract: { address?: string; value?: string; decimal?: string; };
  asset?: string;
  value?: number;
  erc721TokenId?: string,
  erc1155Metadata?: [{ tokenId: string, value: string; }],
}

export type InGetTransactions = {
  chainId?: string;
  fromBlock?: string | number;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
};

export type InGetTransactionsByAddress = {
  chainId?: string;
  fromBlock?: string | number;
  toBlock?: string;
  address: string;
};

export async function getTransactions( input: InGetTransactions )
{
  const chainId = input.chainId || "1";
  const fromBlock = input.fromBlock || "0";
  const toBlock = input.toBlock || "latest";
  const fromAddress = input.fromAddress || undefined;
  const toAddress = input.toAddress || undefined;

  const chain = Chains[chainId];
  if ( !chain ) throw new Error( `Chain with ID ${chainId} not found.` );

  const url = `${chain.rpc_url}/${Env.ALCHEMY_KEY}`;

  const params: any = {
    fromBlock: "0x" + Number( fromBlock ).toString( 16 ),
    toBlock: toBlock == "latest" ? "latest" : "0x" + Number( toBlock ).toString( 16 ),
    order: "asc",
    withMetadata: true,
    excludeZeroValue: false,
    category: [
      "external",
      "internal",
      "erc20",
      "erc721",
      "erc1155",
      "specialnft",
    ],
  };

  if ( fromAddress ) params.fromAddress = fromAddress;

  if ( toAddress ) params.toAddress = toAddress;

  const payload = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [params],
  };

  const headers = { accept: "application/json", "content-type": "application/json" };

  const objects: DbSchema.Tables.Web3Transfer[] = [];

  const mapAlchemyCategoryToCategory: Record<string, string> = {
    external: "external",
    internal: "internal",
    erc20: "token",
    erc721: "token",
    erc1155: "token",
    specialnft: "token",
  };

  try
  {
    while ( true )
    {
      const response = await Axios.post( url, payload, { headers } );

      if ( response.data.error )
      {
        Logger.error( `Error response ${response.status} while requesting ${url}: ${response.data.error.message}` );
        throw new Error( `ALCHEMY_GET_ASSETS_ERROR: ${response.data.error.message}` );
      }
      else
      {
        const result = response.data.result;
        const transfers: AlchemyGetAssets[] = result.transfers;

        const newObjects = transfers.map( ( transfer ) =>
        {
          // Note: We may consider if there are multiple token IDs when `transfer.category` is `erc1155`.
          const token_id = transfer.tokenId || transfer.erc721TokenId || transfer.erc1155Metadata?.[0]?.tokenId || null;
          const category = mapAlchemyCategoryToCategory[transfer.category] || "token";

          return {
            id: transfer.uniqueId,
            category: category,
            chain_id: chainId,
            transaction_type: transfer.category,
            transaction_hash: transfer.hash,
            date_time: transfer.metadata.blockTimestamp,
            block_number: parseInt( transfer.blockNum, 16 ),
            from_address: Viem.getAddress(transfer.from),
            to_address: Viem.getAddress(transfer.to),
            asset_contract_address: transfer.rawContract?.address || null,
            asset_symbol_name: transfer.asset || "",
            value_amount: transfer.value || 0,
            token_id: token_id,
            gas_fee_eth: 0,
          };
        } );

        objects.push( ...newObjects ); // Append new objects to the list.

        if ( !result.pageKey )
        {
          break;
        }
        else
        {
          payload.params[0].pageKey = result.pageKey;
        }
      }
    }

    return objects;
  } catch ( error: any )
  {
    if ( error.response )
    {
      Logger.error( `Error response ${error.response.status} while requesting ${error.config.url}: ${error.response.data}` );
    } else
    {
      Logger.error( `An error occurred: ${error.message}` );
    }
    throw error;
  }
}

export async function getTransactionsByAddress( input: InGetTransactionsByAddress )
{
  const [from, to] = await Promise.all( [
    getTransactions( {
      ...input,
      fromAddress: input.address,
    } ),
    getTransactions( {
      ...input,
      toAddress: input.address,
    } ),
  ] );

  from.push( ...to );

  return from;
}


import * as DbSchema from "./db-schema";
import * as Utils from "./utils";
import * as ScrapperFetcher from "./scrapper-fetcher";
import * as CSV from "csv";
import Axios from "axios";
import Chains from "./chains";
import DB from "./db-connection";

type InSaveTransaction = {
  transactions: DbSchema.Tables.Web3Transfer[];
};

type InGetLatestBlock = {
  chainId: string | number;
  address: string;
};

type InUpdateLatestBlock = {
  chainId: string | number;
  address: string;
  lastBlock: number;
};

type InUpdateForWallets = {
  chainId: string | number;
  address: string;
};

type InGetTransactionHistory = {
  address: string;
  limit?: number;
};

type InCvtTrx2Csv = {
  address: string;
  transactions: DbSchema.Tables.Web3Transfer[];
};

type InUpdateAndGenerateTrxsCsv = {
  chainId: string | number;
  address: string;
};

/**
 * Saves a batch of transactions into the `web3_transfer` table.
 * Transactions are inserted in chunks of to optimize performance.
 */
export async function saveTransactions( input: InSaveTransaction )
{
  const result = await DB.transaction().execute( async ( trx ) =>
  {
    const batches = await Utils.batchAwaitFn( input.transactions, 500, async ( chunk ) =>
    {
      return trx
        .insertInto( "web3_transfer" )
        .values( chunk )
        .onConflict( c => c.columns( ["id", "chain_id", "category"] ).doNothing() )
        .execute();
    } );

    return batches;
  } );

  return result;
}

/**
 * Retrieves the latest block information for a specific chain and wallet address.
 */
export async function getLatestBlock( input: InGetLatestBlock )
{
  const latest = await DB
    .selectFrom( "web3_scrapper_state" )
    .select( ["chain_id", "last_block", "wallet_address"] )
    .where( "chain_id", "=", String( input.chainId ) )
    .where( "wallet_address", "=", input.address )
    .executeTakeFirst();

  return latest ?? {
    chain_id: String( input.chainId ),
    wallet_address: input.address,
    last_block: 0,
  };
}

/**
 * Updates the latest block information for a specific chain and wallet address.
 * If a record already exists, it updates the `last_block` and `updated_at` fields.
 */
export async function updateLatestBlock( input: InUpdateLatestBlock )
{
  const r = await DB
    .insertInto( "web3_scrapper_state" )
    .values( {
      last_block: input.lastBlock,
      wallet_address: input.address,
      chain_id: String( input.chainId ),
    } )
    .onConflict( c => c.columns( ["chain_id", "wallet_address"] )
      .doUpdateSet(
        {
          last_block: input.lastBlock,
          updated_at: new Date(),
        }
      ) )
    .execute();

  return r;
}

/**
 * Fetches and updates transactions for a specific wallet address.
 * Retrieves transactions from the latest block to the current block and saves them to the database.
 */
export async function updateTransactionsForWallet( input: InUpdateForWallets )
{
  const latest = await getLatestBlock( input );

  const allTrxs = await ScrapperFetcher.getTransactionsByAddress( {
    chainId: String( input.chainId ),
    fromBlock: Number( latest.last_block ) + 1,
    toBlock: "latest",
    address: input.address,
  } );

  if ( !allTrxs?.length ) return []; // Skip.

  const lastTrx = allTrxs[allTrxs.length - 1];

  // Save transactions to the database.
  const batch_results = await saveTransactions( { transactions: allTrxs } );

  // Update the latest block for the wallet address.
  await updateLatestBlock( {
    address: input.address,
    chainId: lastTrx.chain_id,
    lastBlock: Number( lastTrx.block_number ),
  } );

  return batch_results;
}

/**
 * Retrieves the transaction history for a specific wallet address.
 * Filters transactions where the address is either the sender or the receiver.
 */
export async function getTransactionHistory( input: InGetTransactionHistory )
{
  let query = DB
    .selectFrom( "web3_transfer" )
    .selectAll()
    .where( w =>
      w.or( [
        w( "from_address", "=", input.address ),
        w( "to_address", "=", input.address ),
      ] )
    )
    .orderBy( "block_number", "desc" );

  if ( input.limit ) query = query.limit( input.limit );

  const trxs = await query.execute();
  return trxs;
}

/**
 * Converts a list of transactions into a CSV format.
 * The CSV includes headers and uses a comma as the delimiter.
 */
export async function convertTransactionsToCsv( input: InCvtTrx2Csv )
{
  const cols = [
    "transaction_type",
    "transaction_hash",
    "block_number",
    "date_time",
    "from_address",
    "to_address",
    "asset_contract_address",
    "asset_symbol_name",
    "value_amount",
    "gas_fee_eth",
    "token_id",
  ] as const;

  return CSV.stringify(
    input.transactions,
    {
      header: true,
      columns: cols.map( c => ( { key: c, header: c } ) ),
      delimiter: ",",
    } );
}

/**
 * Updates the transactions for a specific wallet address and generates a CSV file.
 * The CSV file includes all transactions for the wallet address.
 * The returned object is a stream that can be piped to a file or response.
 */
export async function updateAndGenerateTrxsCsv( input: InUpdateAndGenerateTrxsCsv )
{
  // Update database with latest transactions for the wallet address.
  const gen = await updateTransactionsForWallet( {
    chainId: input.chainId,
    address: input.address,
  } );

  // Retrieve all transactions for the wallet address.
  const trxs = await getTransactionHistory( {
    address: input.address,
    limit: undefined,
  } );

  // Convert transactions to CSV format.
  const csv = await convertTransactionsToCsv( {
    address: input.address,
    transactions: trxs,
  } );

  return csv;
}

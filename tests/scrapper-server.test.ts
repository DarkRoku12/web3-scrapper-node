import * as ScrapperSrv from "../src/scrapper-service";
import DB from "../src/db-connection";
import { expect, test, afterAll, vi } from "vitest";

afterAll( async () =>
{
  DB.destroy();
} );

vi.mock(import("../src/scrapper-service"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    updateTransactionsForWallet: vi.fn().mockReturnValue([]),
    getTransactionHistory: vi.fn().mockReturnValue([
      {
        id: "1",
        chain_id: "1",
        category: "external",
        transaction_type: "transfer",
        transaction_hash: "0x75d0f57360d8d4250197fb6950be113fcf0210cd692134ddb035398fec4f2e00",
        block_number: "123456",
        date_time: "2024-01-09T07:14:11.000Z",
        from_address: "0xfb50526f49894b78541b776f5aaefe43e3bd8590",
        to_address: "0xba7b93334069936275f6aafb4ae5e10306deb55f",
        asset_contract_address: null,
        asset_symbol_name: "ETH",
        value_amount: "0",
        gas_fee_eth: "0.001",
        token_id: null,
      },
      {
        id: "2",
        chain_id: "1",
        category: "internal",
        transaction_type: "transfer",
        transaction_hash: "0x984bbb138fcd25963a62f96079f9b34c82b1e45b47c5fd9e74c65cba4de69500",
        block_number: "123457",
        date_time: "2024-04-12T03:37:11.000Z",
        from_address: "0x111111125421ca6dc452d289314280a0f8842a65",
        to_address: "0xfb50526f49894b78541b776f5aaefe43e3bd8590",
        asset_contract_address: null,
        asset_symbol_name: "ETH",
        value_amount: "0.8286610970152296",
        gas_fee_eth: "0.002",
        token_id: null,
      },
    ])
  }
})

async function streamToString (stream: NodeJS.ReadableStream): Promise<string> {
  const chunks = [] as Buffer[];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}

test( "Test CSV generation", async () => 
{
  const walletAddress = "0xfb50526f49894b78541b776f5aaefe43e3bd8590";

  // Retrieve all transactions for the wallet address.
  const trxs = await ScrapperSrv.getTransactionHistory( {
    address: walletAddress,
    limit: undefined,
  } );

  // // Convert transactions to CSV format.
  const csvStream = await ScrapperSrv.convertTransactionsToCsv( {
    address: walletAddress,
    transactions: trxs,
  } );

  const str = await streamToString(csvStream);

  const fields = [
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
  ];

  const toMatchArr: string[] = [
    // Header 
    fields.join(","),
    // First row
    fields.map( f => trxs[0][f] ).join(","),
    // Second row
    fields.map( f => trxs[1][f] ).join(",")
  ];

  const toMatch = toMatchArr.join("\n") + "\n";

  expect( str ).toEqual( toMatch );
} );


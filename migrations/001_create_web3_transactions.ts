import * as Ky from "kysely";

/** Up migration. */
export async function up( db: Ky.Kysely<any> ): Promise<void>
{
  await Ky.sql`
    CREATE TABLE web3_transfer (
      id TEXT,
      chain_id TEXT NOT NULL,
      category TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      transaction_hash TEXT NOT NULL,
      block_number BIGINT NOT NULL,
      date_time TIMESTAMP NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      asset_contract_address TEXT NULL,
      asset_symbol_name TEXT NOT NULL,
      value_amount DECIMAL(50, 18) NOT NULL,
      gas_fee_eth DECIMAL(50, 18) NOT NULL,
      token_id TEXT NULL,
      PRIMARY KEY (id, chain_id, category)
    ) PARTITION BY LIST (category);

    -- Filtrable fields.
    CREATE INDEX IF NOT EXISTS web3_transfer_chain_id_idx ON web3_transfer (chain_id);
    CREATE INDEX IF NOT EXISTS web3_transfer_transaction_hash_idx ON web3_transfer (transaction_hash);
    CREATE INDEX IF NOT EXISTS web3_transfer_transaction_type ON web3_transfer (transaction_type);
    CREATE INDEX IF NOT EXISTS web3_transfer_from_address_idx ON web3_transfer (from_address);
    CREATE INDEX IF NOT EXISTS web3_transfer_to_address_idx ON web3_transfer (to_address);

    CREATE TABLE IF NOT EXISTS web3_transfer_external 
      PARTITION OF web3_transfer FOR VALUES IN ('external');

    CREATE TABLE IF NOT EXISTS web3_transfer_internal
      PARTITION OF web3_transfer FOR VALUES IN ('internal');

    CREATE TABLE IF NOT EXISTS web3_transfer_token
      PARTITION OF web3_transfer FOR VALUES IN ('token');
  `.execute( db );
}

/** Down migration. */
export async function down( db: Ky.Kysely<any> ): Promise<void>
{
  await db.schema.dropTable( "web3_transfer" ).execute();
}

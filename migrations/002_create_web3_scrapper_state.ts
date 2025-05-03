import * as Ky from "kysely";

/** Up migration. */
export async function up( db: Ky.Kysely<any> ): Promise<void>
{
  await db.schema.createTable( "web3_scrapper_state" )
    .addColumn( "id", "bigint", c => c.generatedByDefaultAsIdentity().primaryKey() )
    .addColumn( "chain_id", "text", c => c.notNull() )
    .addColumn( "wallet_address", "text", c => c.notNull() )
    .addColumn( "last_block", "integer", c => c.notNull() )
    .addColumn( "created_at", "timestamp", c => c.notNull().defaultTo( Ky.sql`now()` ) )
    .addColumn( "updated_at", "timestamp", c => c.notNull().defaultTo( Ky.sql`now()` ) )
    .execute();

  await db.schema
    .createIndex( "web3_scrapper_state_chain_id_wallet_address_idx" )
    .on( "web3_scrapper_state" )
    .columns( ["chain_id", "wallet_address"] )
    .unique()
    .execute();
}

/** Down migration. */
export async function down( db: Ky.Kysely<any> ): Promise<void>
{
  await db.schema.dropTable( "web3_scrapper_state" ).execute();
}

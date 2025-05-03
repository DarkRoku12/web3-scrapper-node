import { ColumnType, Generated } from "kysely";

export type Decimal = string | number;

export type OnCreateOnly<T> = ColumnType<T, never, never>;
export type OnUpdateOnly<T> = ColumnType<T, never, T>;

export type CreatedAt = OnCreateOnly<Date>;
export type UpdatedAt = OnUpdateOnly<Date>;

export namespace Tables
{
  export type Web3Transfer =
    {
      id: string;
      chain_id: string;
      category: string;
      transaction_type: string;
      transaction_hash: string;
      block_number: string | number;
      date_time: string; // Use `Date` if your database driver supports it
      from_address: string;
      to_address: string;
      asset_contract_address: string | null;
      asset_symbol_name: string;
      value_amount: Decimal;
      gas_fee_eth: Decimal;
      token_id: string | null;
    };

  export type Web3ScrapperState =
    {
      id: Generated<number>;
      chain_id: string;
      wallet_address: string;
      last_block: number;
      created_at: CreatedAt;
      updated_at: UpdatedAt;
    };
}

export interface DatabaseSchema
{
  web3_transfer: Tables.Web3Transfer;
  web3_scrapper_state: Tables.Web3ScrapperState;
}

export default DatabaseSchema;
import * as Ky from "kysely";
import * as Pg from "pg";
import DbSchema from "./db-schema";
import Env from "./env";

export const dialect = new Ky.PostgresDialect( {
  pool: new Pg.Pool( {
    max: 4,
    connectionString: Env.PG_URI,
    ssl: Env.PG_URI!.includes( "localhost" ) ? false : { rejectUnauthorized: false },
  } ),
} );

export const db = new Ky.Kysely<DbSchema>( { dialect } );

export default db;
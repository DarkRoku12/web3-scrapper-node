import * as Ky from "kysely";
import * as KyCmd from "kysely-ctl";
import DB from "./src/db-connection";

export default KyCmd.defineConfig( {
  kysely: DB,
  migrations: {
    allowJS: false,
    migrationFolder: "./migrations",
    migrationTableName: "app_migrations",
    migrationLockTableName: "app_migrations_lock",
    migrationTableSchema: "public",
    allowUnorderedMigrations: true
  },
} );

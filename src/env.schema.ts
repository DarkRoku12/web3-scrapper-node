import * as Z from "zod";

const bool_def_false = Z.enum( ["true", "false"] )
  .transform( ( val ) => val == "true" )
  .default( "false" );

export const env_schema = Z.object( {
  NODE_ENV: Z.enum( ["development", "staging", "production", "test"] ).default( "development" ),
  HOST: Z.coerce.string().default( "localhost" ),
  PORT: Z.coerce.number().default( 7676 ),
  TEST: bool_def_false,
  PG_URI: Z.string(),
  ALCHEMY_KEY: Z.string(),
} );

export default env_schema;

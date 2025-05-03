import * as DotEnvFlow from "dotenv-flow";
import * as ZodValidationError from "zod-validation-error";
import * as Z from "zod";
import EnvSchema from "./env.schema";

DotEnvFlow.config( {
  default_node_env: "development",
} );

const parsed_env = EnvSchema.safeParse( process.env );

// Throw an error in case of an invalid env.
if ( !parsed_env.success ) 
{
  const err = ZodValidationError.fromZodError( parsed_env.error );
  throw err;
}

// Set the TEST flag if NODE_ENV is "test" [regardless if not set].
if ( parsed_env.data.NODE_ENV == "test" ) parsed_env.data.TEST = true;

export const env = new Proxy( parsed_env.data, {
  get( target: any, prop ) 
  {
    const key = prop as string;
    const value = target[key];
    return value;
  },

  has( target, prop ) 
  {
    if ( typeof prop === "string" ) 
    {
      return prop in target;
    }
    return false;
  },

  set( target, prop, value )
  {
    const key = prop as string;
    target[key] = value;
    return true;
  },

  ownKeys( target ) 
  {
    return Object.keys( target );
  },
} ) as any as Z.infer<typeof EnvSchema>;

export default env;

import * as HonoServer from "@hono/node-server";
import Logger from "./logger";
import MainApp from "./app-context";
import Env from "./env";

MainApp.onError( ( err, ctx ) =>
{
  console.error( err );
  return ctx.json( { error: "Internal Server Error" }, 500 );
} );

Logger.log( `Using database: ${Env.PG_URI.split( "@" )[1]}` );

export const server = HonoServer.serve(
  {
    port: Env.PORT,
    fetch: MainApp.fetch,
  },
  ( info ) => Logger.log( `Listening on http://localhost:${info.port}`, { env: Env.NODE_ENV } )
);

export default MainApp;
import "./env";
import * as CORS from "hono/cors";
import * as Hono from "hono";
import * as HonoLog from "hono/logger";
import * as HonoStream from 'hono/streaming';
import * as ScrapperSrv from "./scrapper-service";
import * as Viem from "viem";

export const App = new Hono.Hono( { strict: false } );

App.use( CORS.cors( {
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
} ) );

App.use( HonoLog.logger() );

/** Basic ping/health check. */
App.get( "/ping", ( ctx ) =>
{
  return ctx.json( { message: "pong" }, 200 );
} );

/** Fetch transactions and return a CSV. */
App.get( "/transactions", async ( ctx ) =>
{
  const address = ctx.req.query( "address" );
  if ( !address ) return ctx.json( { error: "address is required (in query)" }, 400 );

  const csvStream = await ScrapperSrv.updateAndGenerateTrxsCsv( {
    address: Viem.getAddress( address ),
    chainId: 1,
  } );

  return HonoStream.streamText( ctx, async ( stream ) =>
  {
    await new Promise( ( resolve, reject ) =>
    {
      csvStream.on( "end", () =>
      {
        resolve( null );
      } );

      csvStream.on( "data", ( chunk ) =>
      {
        stream.write( chunk );
      } );

      csvStream.on( "error", ( err ) =>
      {
        reject( err );
      } );
    }
    );
  } );
} );

export default App;
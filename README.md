

## Author:
Enmanuel Reynoso.
https://linkedin.com/in/enmanuelr
https://code.darkroku12.ovh/

## Installing

Required environment variables:

### Environment variables

```
PG_URI=postgresql://{user}:{pass}@{host}:65432/cointracker
ALCHEMY_KEY="your Alchemy API key"
```

You may check for reference:
- `.env.example`
- `src/env.schema.ts`

### Database migrations

For the service to work, run:
`pnpm run db-migrate-latest` 
on your target database, be local / docker / or external machine.
if running on localhost, be sure to set the proper env, it will run migrations 
using the database specified in `PG_URI`.

### Docker

- Build and tag image only: podman build --pull --rm -f "dockerfile" -t "web3_scrapper:latest" "." 
- Alternatively, run everything with `docker-compose up`.

Remember to change the `docker-compose.yml` / `dockerfile` with your updated env variables.

### Local
- Install Node (recommended v23+)
- Install pnpm `npm install -g pnpm`
- Install packages `pnpm install`
- Create an `.env` file with the desired content, or just export the desired env variables in your system.
- Run server in dev mode: `pnpm run dev`
- Run server in dist mode: `pnpm run start`

## Testing

To run test just run `pnpm run test`.

I didn't spend that much time in configuring new tests.
Since it'd depend the scope of what we want to have it testable.

Mocking for example, Kysely (our Database query builder) would be hard by itself.
So we either mock methods that includes it, or, we use a real database, which have their own issues
(re-creating the database, running migrations, seeds, etc), or use a memory db that can
simulate PostgreSQL, `pg-mem` for NodeJS is available, but it may not support all PostgreSQL features.

We may want to test a couple of endpoints, for example, Hono ships a testing client that plays nice with almost any NodeJS testing framework, including Vitest and Jest.

## Usage

`GET /transactions?address=<wallet_address>`

Example:
`http://localhost:7676/transactions?address=0xd620AADaBaA20d2af700853C4504028cba7C3333`

## Challenges

#### Matching wallet address.

wallet address in Ethereum can exist in two flavors:
checksummed and non-checksummed, in our endpoint, we transform every input address to checksummed
as well as when retrieving the data from Alchemy.

For example, when using Metamask in the frontend, by my experience wallet address always comes
already checksummed, this also happens for most if not all block-explorers, but that will always depend on your source. 

Another solution would be comparing/matching entries in database as to be case-insensitive.
It would be really hard to match two valid wallets that can actually both compare to the same
string lowercase.

See: https://viem.sh/docs/utilities/getAddress.html

#### Retrieving Gas fees. 
RPC `eth_getTransactionReceipt` is what we'll usually use, since 
the custom alchemy RPC endpoint `alchemy_getAssetTransfers` is really convenient but does not return
the gas used, another RPC would do, the problem is the amount of RPC calls we'll need to get this value.

A cool solution would be use Envio.dev HyperSync queries (https://docs.envio.dev/docs/HyperSync/hypersync-query) and batch a multiples transactions, we can also specify which fields we strictly want
so we save on bandwidth.

Like:
  `query.fieldSelection.transaction = [ "gas", "gasPrice" ];`

I omitted this since I don't feel comfortable implementing a native solution, and Envio.dev
HyperSync would take a bit of time to implement (without copy pasting the hell out of other projects I've done). For example, the above example was copy pasted and modified from my previous work at Umoja Labs.

#### Endpoint results.

`alchemy_getAssetTransfers` is not that fast (around 3000 entries every second), 
any HTTP request will eventually timeout if we're building our database from a given wallet address from the block 0 to the latest.

A solution would be returning a task with a `task id result token`, and a client may pull that token status from another endpoint, and when ready, download the results.

So, we'd end with 3 endpoint:
- One to launch the task to sync a wallet up to the latest block.
- One to retrieve the status of such task.
- One to retrieve the latest records in form of CSV.

## Motivations

The purpose was to be able to build a solution is somewhat robust and efficient, this is why we're using PostgreSQL partitioned tables 
(see `migrations/001_create_web3_transactions.ts`)

When using PostreSQL partitioned table, couple with several indexes, we ensure that we may retrieve very fast tokens
by their category type (`'external', 'internal', 'token'`).

And we use a pivot table `web3_scrapper_state` to store the last block scanned for a given address in a given chain.

We're basically appending only new records for a given wallet address once we sync from 0-latest blocks.

As you can see, we use a fixed `1` in `chainId` to represent `mainnet`, we could modify the endpoint to pass another query parameter
that we may optionally specify the intended `chainId` to use, that would require us to map desired chains in the file `src/chains.ts`,
be aware that `alchemy_getAssetTransfers` might not support all chains we may like, so we could resort to manually query and classify transactions
based on the logs produced.

As you may see, in `/docs` there are two files, same name, different extension: `data-considerations`.

The first I consider when building a data pipeline my input data, base on that I'd try to find differences and clean up the data to ensure
we have a robust dataset, thanks god AI is very good at spotting differences.

Initially, I really wanted to implement this in Python, but I struggle to bring the Asynchronous behavior to work well with PostgreSQL,
tried SQLAlchemy, Tortoise-orm, piccolo-orm, and few others.

Either they're not working, or when they do, their initial connection was way too slow for my standards, and, I didn't want to resort
to using synchronous behavior, because even though this is 'assessment 2-4h project', I really like to optimize things (see my blog: https://code.darkroku12.ovh/)

So, I just went back to my comfort zone in TypeScript when everything works as expected, but I could have done it with Python (given enough debugging time, and perhaps some aid), or just using any other language like C#, or Go.

## Further enhancements.

1. Rust / Go / C# server (microservice) for enhanced string manipulation, improving CSV delivery, since Python/Node.js are not the best players when it comes to CPU bound operations that also involve memory management. For example, in Python we may implement an 'Efficient String Concatenation',  and Node.js is good enough even without a proper string builder class. But even though, I'd resort to having a microservice in a more per formant language for this specific scenario.

2. Use Envio.dev HyperSync queries to batch request transaction metadata that `alchemy_getAssetTransfers` misses.

3. In the context of a CLI tool, we may stream to a file results directly for every alchemy 'loop' iteration, or to a database.
   Instead of the flow we have now: gather all → store → convert to CSV → update scanner status.
   We could have: gather the first/next batch → store → update scanner status → either: (back to 1st step) or (append to CSV file).
   Another good and solid approach is instead of trying to get from blocks: 0-latest in the first wallet request, we can do batch them and resume it by limiting the scope to 2K~5k blocks.
   In either case, for an API to work well, then, we'd need to upgrade to →  check section `#### Endpoint results`.

4. Logging, validation, error handling, auth: Granted, we have a basic logging, and some error handling, but in a real, distributed system, you'd probably want to include support for structured logging, meaningful error codes and messages, and whenever there is an input, there is data validation
   For example, we may not only validate that an eth address is just a string, but a valid address, same with the chain id, equally if we're applying any filters that are customizable by the users, such filters must exist. If this is a public facing service, we may like to limit the actions a user
   may do, or the data they see, along with quota rates, if applicable.

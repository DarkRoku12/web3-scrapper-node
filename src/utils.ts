export async function batchAwaitFn<T extends any[], R>( iArray: T, batchLen: number, fn: ( chunk: T ) => Promise<R | R[]> )
{
  const results = [] as R[];

  for ( let i = 0; i < iArray.length; i += batchLen )
  {
    const chunk = iArray.slice( i, i + batchLen ) as T;
    const checkResults = await fn( chunk );
    if ( Array.isArray( checkResults ) ) results.push( ...checkResults );
    else results.push( checkResults );
  }

  return results;
}

/** Convert an array<T> into chunks: array<T[]> */
export function inChunks<T extends any[]>( iArray: T, chunkLen: number )
{
  const chunks = [] as T[];
  for ( let i = 0; i < iArray.length; i += chunkLen )
  {
    const chunk = iArray.slice( i, i + chunkLen ) as T;
    chunks.push( chunk );
  }
  return chunks;
}
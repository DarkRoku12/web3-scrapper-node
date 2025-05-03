export type Chain = {
  name: string;
  rpc_url: string;
};

export const chains = {
  "1": { "name": "Ethereum", "rpc_url": "https://eth-mainnet.g.alchemy.com/v2" },
  "11155111": { "name": "Sepolia", "rpc_url": "https://eth-sepolia.g.alchemy.com/v2" },
  "42161": { "name": "Arbitrum", "rpc_url": "https://eth-sepolia.g.alchemy.com/v2" },
} as Record<string | number, Chain>;

export default chains;

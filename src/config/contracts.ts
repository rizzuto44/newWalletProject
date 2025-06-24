// Deployed Contract Addresses on Sepolia
export const CONTRACTS = {
  // Mock USDT Token
  USDT: '0x425f8026d423cc234760BB153997Bf05C26911b5',
  
  // Account Abstraction Contracts
  LIGHT_ACCOUNT_FACTORY: '0x87E0fca8F13A7C66CfaA3489f4a9203eD734da3A',
  PAYMASTER: '0xE3c13Bd30b453E7867cC74B3D6edDa23294e4b44',
  
  // EntryPoint (standard across all chains)
  ENTRYPOINT: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  
  // Chainlink Oracle
  CHAINLINK_ETH_USD: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
} as const;

// RPC URLs
export const RPC_URLS = {
  SEPOLIA: 'https://eth-sepolia.g.alchemy.com/v2/lDgYh55XLkK3fo6ixC5GiRuw29_vwYKN',
  PIMLICO_BUNDLER: 'https://api.pimlico.io/v2/11155111/rpc?apikey=pim_Fy9sH63ryxZiaK9SB2jhFK',
  PIMLICO_PAYMASTER: 'https://api.pimlico.io/v2/11155111/paymaster?apikey=pim_Fy9sH63ryxZiaK9SB2jhFK',
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: 11155111, // Sepolia
  CHAIN_NAME: 'Sepolia',
  CURRENCY_SYMBOL: 'ETH',
  BLOCK_EXPLORER: 'https://sepolia.etherscan.io',
} as const; 
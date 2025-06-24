declare module '@env' {
  export const INFURA_PROJECT_ID: string;
  
  // Account Abstraction Configuration
  export const RPC_URL: string;
  export const ENTRYPOINT: string;
  export const USDT0_ADDRESS: string;
  export const FACTORY_ADDRESS: string;
  export const PAYMASTER_ADDRESS: string;
  export const PAYMASTER_URL: string;
  export const BUNDLER_RPC: string;
  export const CHAINLINK_ETH_USD: string;
  
  // Optional: Self-hosted bundler
  export const SELF_HOSTED_BUNDLER_URL?: string;
  
  // Development Configuration
  export const NODE_ENV: string;
} 
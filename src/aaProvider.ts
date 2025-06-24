import { 
  createSmartAccountClient, 
  SmartAccountClient,
  SmartAccountClientConfig,
  getDefaultEntryPointAddress,
  type SmartAccountSigner
} from '@alchemy/aa-core';
import { 
  createPublicClient, 
  http, 
  type Chain,
  type PublicClient,
  type Transport 
} from 'viem';
import { sepolia } from 'viem/chains';
import { 
  RPC_URL, 
  ENTRYPOINT, 
  USDT0_ADDRESS, 
  FACTORY_ADDRESS, 
  PAYMASTER_URL, 
  BUNDLER_RPC 
} from '@env';

/**
 * @title AAProvider
 * @dev Account Abstraction provider for smart contract account operations
 */
export class AAProvider {
  private client: SmartAccountClient;
  private publicClient: PublicClient;
  private chain: Chain;

  constructor() {
    this.chain = sepolia;
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(RPC_URL),
    });

    // Use Pimlico bundler instead of deprecated Stackup
    const bundlerUrl = BUNDLER_RPC || 'https://api.pimlico.io/v2/sepolia/rpc';

    const config: SmartAccountClientConfig = {
      chain: this.chain,
      transport: http(bundlerUrl),
      entryPoint: ENTRYPOINT || getDefaultEntryPointAddress(this.chain),
      bundlerUrl: bundlerUrl,
      paymasterUrl: PAYMASTER_URL,
    };

    this.client = createSmartAccountClient(config);
  }

  /**
   * @dev Create a smart contract account from an EOA
   * @param owner The EOA address that will own the SCA
   * @param signer The signer for the EOA
   * @returns The smart account client configured for the new account
   */
  async createSmartAccount(owner: string, signer: SmartAccountSigner) {
    try {
      const smartAccountClient = await this.client.createSmartAccount({
        signer,
        factoryAddress: FACTORY_ADDRESS,
        gasManagerConfig: {
          policyId: PAYMASTER_URL, // Using paymaster URL as policy ID for now
        },
      });

      return smartAccountClient;
    } catch (error) {
      console.error('Error creating smart account:', error);
      throw new Error('Failed to create smart account');
    }
  }

  /**
   * @dev Get the counterfactual address for a smart account
   * @param owner The EOA address
   * @returns The predicted SCA address
   */
  async getSmartAccountAddress(owner: string): Promise<string> {
    try {
      const address = await this.client.getSmartAccountAddress({
        factoryAddress: FACTORY_ADDRESS,
        owner,
      });
      return address;
    } catch (error) {
      console.error('Error getting smart account address:', error);
      throw new Error('Failed to get smart account address');
    }
  }

  /**
   * @dev Execute a transaction through the smart account
   * @param smartAccountClient The smart account client
   * @param target The target contract address
   * @param data The transaction data
   * @param value The ETH value to send (0 for token transfers)
   * @returns The transaction hash
   */
  async executeTransaction(
    smartAccountClient: SmartAccountClient,
    target: string,
    data: string,
    value: bigint = 0n
  ): Promise<string> {
    try {
      const { hash } = await smartAccountClient.sendTransaction({
        to: target,
        data: data as `0x${string}`,
        value,
      });
      return hash;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw new Error('Failed to execute transaction');
    }
  }

  /**
   * @dev Execute a USDT transfer through the smart account
   * @param smartAccountClient The smart account client
   * @param to The recipient address
   * @param amount The amount of USDT to transfer
   * @returns The transaction hash
   */
  async executeUSDTTransfer(
    smartAccountClient: SmartAccountClient,
    to: string,
    amount: bigint
  ): Promise<string> {
    try {
      // USDT transfer function signature: transfer(address,uint256)
      const transferData = `0xa9059cbb${to.slice(2).padStart(64, '0')}${amount.toString(16).padStart(64, '0')}`;
      
      const { hash } = await smartAccountClient.sendTransaction({
        to: USDT0_ADDRESS,
        data: transferData as `0x${string}`,
        value: 0n,
      });
      
      return hash;
    } catch (error) {
      console.error('Error executing USDT transfer:', error);
      throw new Error('Failed to execute USDT transfer');
    }
  }

  /**
   * @dev Estimate the gas cost for a transaction
   * @param smartAccountClient The smart account client
   * @param target The target contract address
   * @param data The transaction data
   * @param value The ETH value to send
   * @returns The estimated gas cost in wei
   */
  async estimateGasCost(
    smartAccountClient: SmartAccountClient,
    target: string,
    data: string,
    value: bigint = 0n
  ): Promise<bigint> {
    try {
      const gasEstimate = await smartAccountClient.estimateGas({
        to: target,
        data: data as `0x${string}`,
        value,
      });
      
      // Get current gas price
      const gasPrice = await this.publicClient.getGasPrice();
      
      return gasEstimate * gasPrice;
    } catch (error) {
      console.error('Error estimating gas cost:', error);
      throw new Error('Failed to estimate gas cost');
    }
  }

  /**
   * @dev Estimate the USDT fee for a transaction
   * @param smartAccountClient The smart account client
   * @param target The target contract address
   * @param data The transaction data
   * @param value The ETH value to send
   * @returns The estimated USDT fee amount
   */
  async estimatePaymasterFee(
    smartAccountClient: SmartAccountClient,
    target: string,
    data: string,
    value: bigint = 0n
  ): Promise<bigint> {
    try {
      const gasCost = await this.estimateGasCost(smartAccountClient, target, data, value);
      
      // This is a simplified calculation - in a real implementation,
      // you would call the paymaster's calculateTokenAmount function
      // For now, we'll use a rough estimate (1 USDT per 0.001 ETH)
      const usdtFee = (gasCost * 1000n) / 1_000_000_000_000_000_000n; // Convert wei to ETH, then to USDT
      
      return usdtFee;
    } catch (error) {
      console.error('Error estimating paymaster fee:', error);
      throw new Error('Failed to estimate paymaster fee');
    }
  }

  /**
   * @dev Get the USDT balance of a smart account
   * @param smartAccountAddress The smart account address
   * @returns The USDT balance
   */
  async getUSDTBalance(smartAccountAddress: string): Promise<bigint> {
    try {
      // USDT balanceOf function signature: balanceOf(address)
      const balanceData = `0x70a08231${smartAccountAddress.slice(2).padStart(64, '0')}`;
      
      const balance = await this.publicClient.call({
        to: USDT0_ADDRESS,
        data: balanceData as `0x${string}`,
      });
      
      if (balance.data) {
        return BigInt(balance.data);
      }
      
      return 0n;
    } catch (error) {
      console.error('Error getting USDT balance:', error);
      throw new Error('Failed to get USDT balance');
    }
  }

  /**
   * @dev Check if a smart account exists
   * @param smartAccountAddress The smart account address
   * @returns True if the account exists, false otherwise
   */
  async isSmartAccountDeployed(smartAccountAddress: string): Promise<boolean> {
    try {
      const code = await this.publicClient.getBytecode({
        address: smartAccountAddress as `0x${string}`,
      });
      
      return code !== undefined && code !== '0x';
    } catch (error) {
      console.error('Error checking smart account deployment:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const aaProvider = new AAProvider(); 
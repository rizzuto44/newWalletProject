import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INFURA_PROJECT_ID } from '@env';

// Polyfill for Buffer
global.Buffer = Buffer;

const PRIVATE_KEY_STORAGE_KEY = 'privateKey';
const WALLET_ADDRESS_STORAGE_KEY = 'walletAddress';
const SEPOLIA_RPC_URL = `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`;

const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);

export const createWallet = async (): Promise<ethers.Wallet> => {
    try {
        const newWallet = ethers.Wallet.createRandom();
        await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, newWallet.privateKey);
        await AsyncStorage.setItem(WALLET_ADDRESS_STORAGE_KEY, newWallet.address);
        return newWallet;
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw new Error('Failed to create and store wallet.');
    }
};

const getWallet = async (): Promise<ethers.Wallet | null> => {
  try {
    const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
    if (!privateKey) {
        console.log("No private key found");
        return null;
    }
    const wallet = new ethers.Wallet(privateKey);
    return wallet;
  } catch (error) {
    console.error('Error getting wallet:', error);
    return null;
  }
};

export const getWalletAddress = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(WALLET_ADDRESS_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving wallet address:', error);
    return null;
  }
};

export const getBalance = async (address: string): Promise<string | null> => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error retrieving balance:', error);
    return null;
  }
}

export const getPrivateKey = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Error retrieving private key:', error);
      return null;
    }
};

export const clearWallet = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
      await AsyncStorage.removeItem(WALLET_ADDRESS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wallet data:', error);
    }
};

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const tokenContractAddress = '0xa8Aeb9c64B72aFfAB318f06229052AF517CA2D50';
const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, provider);

export const getTokenBalance = async (address: string): Promise<string> => {
    if (!INFURA_PROJECT_ID || INFURA_PROJECT_ID === 'YOUR_INFURA_PROJECT_ID_HERE') {
        throw new Error('Invalid INFURA_PROJECT_ID');
    }
    try {
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return '0.00';
    }
};

export const sendTransaction = async (to: string, value: string): Promise<string> => {
    const wallet = await getWallet();
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    const walletWithProvider = wallet.connect(provider);
    const tx = await walletWithProvider.sendTransaction({
        to: to,
        value: ethers.utils.parseEther(value)
    });
    await tx.wait();
    return tx.hash;
};

export const getTokenPrice = async (): Promise<number> => {
  // In a real app, this would fetch the price from a real API (e.g., CoinGecko, Binance)
  // For this demo, we'll return a static price.
  return 1.00;
}; 
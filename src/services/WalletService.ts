import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill for Buffer
global.Buffer = Buffer;

const PRIVATE_KEY_STORAGE_KEY = 'privateKey';
const WALLET_ADDRESS_STORAGE_KEY = 'walletAddress';
const SEPOLIA_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/demo';

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
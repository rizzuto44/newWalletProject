import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';
import { getWalletAddress, clearWallet, getBalance } from '../services/WalletService';

type RootStackParamList = {
  Onboarding: undefined;
  Transfer: undefined;
  AddFunds: undefined;
  Wallet: { newBalance?: string };
};

type WalletScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

type WalletScreenRouteProp = RouteProp<RootStackParamList, 'Wallet'>;

interface WalletData {
  address: string;
  ethBalance: string;
}

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const route = useRoute<WalletScreenRouteProp>();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadWalletData = async () => {
        setIsLoading(true);
        const address = await getWalletAddress();
        if (address) {
          const balance = await getBalance(address);
          const currentBalance = parseFloat(walletData?.ethBalance || balance || '0.0');
          const newBalance = currentBalance + parseFloat(route.params?.newBalance || '0');
          
          setWalletData({ address, ethBalance: newBalance.toFixed(2) });
        }
        setIsLoading(false);
      };
      loadWalletData();
    }, [route.params?.newBalance])
  );

  const handleCopyAddress = async () => {
    if (walletData?.address) {
      await Clipboard.setStringAsync(walletData.address);
      Alert.alert('Copied', 'Address copied to clipboard!');
    }
  };

  const handleViewOnEtherscan = () => {
    if (walletData?.address) {
      const url = `https://sepolia.etherscan.io/address/${walletData.address}`;
      Linking.openURL(url);
    }
  };

  const handleReset = async () => {
    try {
      await clearWallet();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to reset wallet');
    }
  };

  const handleSend = () => {
    navigation.navigate('Transfer');
  };

  const handleAddFunds = () => {
    navigation.navigate('AddFunds');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Wallet</Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.iconButton}>
              <Feather name="copy" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleViewOnEtherscan} style={styles.iconButton}>
              <Feather name="globe" size={22} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceAmount}>
                ${walletData?.ethBalance}
              </Text>
              <Text style={styles.balanceUsd}>USD</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddFunds}>
                <Text style={styles.actionButtonText}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Receive</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 8,
  },
  balanceUsd: {
    fontSize: 18,
    color: '#adb5bd',
  },
  iconButton: {
    paddingHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletScreen; 
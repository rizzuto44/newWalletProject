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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getWalletAddress, clearWallet } from '../services/WalletService';

type RootStackParamList = {
  Onboarding: undefined;
  Transfer: undefined;
};

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface WalletData {
  address: string;
  usdtBalance: string;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadWalletData = async () => {
        setIsLoading(true);
        const address = await getWalletAddress();
        if (address) {
          // TODO: Query actual USDT balance from a testnet
          setWalletData({ address, usdtBalance: '1,000.00' });
        }
        setIsLoading(false);
      };
      loadWalletData();
    }, [])
  );

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

  const handleAddFunds = async () => {
    try {
      // TODO: Implement Apple Pay on-ramp
      // 1. Present Apple Pay sheet via react-native-payments
      // 2. Call backend to mint mock USDT
      // 3. Update balance display
      Alert.alert('Coming Soon', 'Apple Pay integration will be available soon!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add funds');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
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
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>
                ${walletData?.usdtBalance}
              </Text>
              <Text style={styles.balanceUsd}>USD</Text>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
                {walletData?.address}
              </Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#007AFF',
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
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
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
  addressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
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

export default DashboardScreen; 
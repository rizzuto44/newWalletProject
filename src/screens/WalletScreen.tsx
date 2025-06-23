import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';
import { getWalletAddress, getTokenBalance, getTokenPrice } from '../services/WalletService';
import CubeIcon from '../components/CubeIcon';

type RootStackParamList = {
  Onboarding: undefined;
  Transfer: undefined;
  AddFunds: undefined;
  Wallet: { newBalance?: string; address?: string | null; tokenBalance?: string; };
};

type WalletScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type WalletScreenRouteProp = RouteProp<RootStackParamList, 'Wallet'>;

interface WalletData {
  address: string;
  tokenBalance: string;
  usdBalance: string;
}

const formatBalance = (balance: string | number) => {
  const number = typeof balance === 'string' ? parseFloat(balance) : balance;
  return Math.floor(number).toLocaleString('en-US');
};

const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const route = useRoute<WalletScreenRouteProp>();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;

  // Load initial wallet data
  useFocusEffect(
    React.useCallback(() => {
      const loadWalletData = async () => {
        try {
          setIsLoading(true);
          
          // Get address from navigation params or storage
          let address = route.params?.address;
          if (!address) {
            address = await getWalletAddress();
          }
          
          if (address) {
            // Set initial state with 0 balances
            setWalletData({ address, tokenBalance: '0', usdBalance: '0.00' });
            
            // Start loading balance and price in background
            loadBalanceAndPrice(address);
          }
        } catch (error) {
          console.error('Error loading wallet data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadWalletData();
    }, [route.params?.address])
  );

  const loadBalanceAndPrice = async (address: string) => {
    try {
      setIsBalanceLoading(true);
      // Fetch both simultaneously
      const [balance, price] = await Promise.all([
        getTokenBalance(address),
        getTokenPrice()
      ]);
      const usdValue = (parseFloat(balance) * price).toFixed(2);
      setWalletData(prev => prev ? { ...prev, tokenBalance: balance, usdBalance: usdValue } : null);
    } catch (error) {
      console.error('Error loading balance and price:', error);
      // Still update with what we have, or show an error
      setWalletData(prev => prev ? { ...prev, tokenBalance: 'N/A', usdBalance: 'N/A' } : null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!walletData?.address || isRefreshing) return;
    
    setIsRefreshing(true);
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    try {
      await loadBalanceAndPrice(walletData.address);
    } finally {
      setIsRefreshing(false);
      spinAnimation.stop();
      spinValue.setValue(0);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const handleSend = () => navigation.navigate('Transfer');
  const handleAddFunds = () => navigation.navigate('AddFunds');
  const handleReceive = () => Alert.alert('Receive', 'This feature is not yet implemented.');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{flex: 1}} size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
            <CubeIcon />
            <View style={{ marginLeft: 12 }}>
                <Text style={styles.walletTitle}>Wallet</Text>
                <View style={styles.addressContainer}>
                    <Text style={styles.walletAddress}>
                        {walletData?.address ? truncateAddress(walletData.address) : 'Loading...'}
                    </Text>
                    <TouchableOpacity onPress={handleCopyAddress} style={styles.iconButton}>
                        <Feather name="copy" size={16} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleViewOnEtherscan} style={styles.iconButton}>
                        <Feather name="globe" size={16} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
            <TouchableOpacity>
                <Text style={[styles.tab, styles.activeTab]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.tab}>Coins</Text>
            </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
            <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={handleRefresh}
                    disabled={isRefreshing || isBalanceLoading}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Feather 
                            name="refresh-cw" 
                            size={20} 
                            color={isRefreshing || isBalanceLoading ? "#999" : "#666"} 
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
                ${isBalanceLoading && !walletData?.usdBalance ? '...' : walletData?.usdBalance || '0.00'}
            </Text>
        </View>
        
        {/* Actions */}
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddFunds}>
                <Feather name="plus-circle" size={16} color="white" />
                <Text style={styles.actionButtonText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
                <Feather name="arrow-up-circle" size={16} color="white" />
                <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
             <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
                <Feather name="arrow-down-circle" size={16} color="white" />
                <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    walletTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'gray',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walletAddress: {
        fontSize: 14,
        color: '#333',
    },
    iconButton: {
        marginLeft: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    tab: {
        fontSize: 18,
        color: 'gray',
        marginRight: 20,
    },
    activeTab: {
        fontWeight: 'bold',
        color: '#000',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 4,
    },
    balanceContainer: {
        marginBottom: 30,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 16,
        color: 'gray',
    },
    refreshButton: {
        marginLeft: 8,
        padding: 4,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
    },
    tokenAmount: {
        fontSize: 16,
        color: 'gray',
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        backgroundColor: '#000',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default WalletScreen; 
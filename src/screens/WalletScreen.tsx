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
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getWalletAddress, getTokenBalance, getTokenPrice } from '../services/WalletService';
import CubeIcon from '../components/CubeIcon';

type RootStackParamList = {
  Onboarding: undefined;
  Transfer: undefined;
  AddFunds: undefined;
  Wallet: { newBalance?: string; address?: string | null; tokenBalance?: string; shouldRefreshBalance?: boolean; };
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
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pullAnimValue = React.useRef(new Animated.Value(0)).current;

  // Create spin animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Create pull animation
  const pullScale = pullAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinAnimation = () => {
    spinValue.stopAnimation();
    spinValue.setValue(0);
  };

  const onRefresh = React.useCallback(async () => {
    if (!walletData?.address) return;
    
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startSpinAnimation();
    
    try {
      const tokenBalance = await getTokenBalance(walletData.address);
      const tokenPrice = await getTokenPrice();
      const usdBalance = (parseFloat(tokenBalance) * tokenPrice).toFixed(2);
      
      setWalletData(prev => prev ? {
        ...prev,
        tokenBalance,
        usdBalance
      } : null);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setRefreshing(false);
      stopSpinAnimation();
    }
  }, [walletData?.address]);

  // Load initial wallet data
  useFocusEffect(
    React.useCallback(() => {
      const loadWalletData = async () => {
        try {
          console.log('WalletScreen: Loading wallet data');
          console.log('WalletScreen: Route params:', route.params);
          
          setIsLoading(true);
          
          // Get address from navigation params or storage
          let address = route.params?.address;
          if (!address) {
            address = await getWalletAddress();
          }
          
          if (address) {
            setWalletData(prev => ({ 
              address, 
              tokenBalance: prev?.tokenBalance || '0', 
              usdBalance: prev?.usdBalance || '0.00' 
            }));
            
            // Check if we should refresh balance (from AddFunds flow)
            if (route.params?.shouldRefreshBalance) {
              console.log('WalletScreen: Should refresh balance - starting refresh');
              setIsBalanceLoading(true);
              startSpinAnimation();
              const tokenBalance = await getTokenBalance(address);
              const tokenPrice = await getTokenPrice();
              const usdBalance = (parseFloat(tokenBalance) * tokenPrice).toFixed(2);
              
              setWalletData(prev => ({
                address,
                tokenBalance,
                usdBalance
              }));
              setIsBalanceLoading(false);
              stopSpinAnimation();
            } else {
              console.log('WalletScreen: Loading balance normally');
              // Load balance normally
              setIsBalanceLoading(true);
              startSpinAnimation();
              const tokenBalance = await getTokenBalance(address);
              const tokenPrice = await getTokenPrice();
              const usdBalance = (parseFloat(tokenBalance) * tokenPrice).toFixed(2);
              
              setWalletData(prev => ({
                address,
                tokenBalance,
                usdBalance
              }));
              setIsBalanceLoading(false);
              stopSpinAnimation();
            }
          }
        } catch (error) {
          console.error('Error loading wallet data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadWalletData();
    }, [route.params?.shouldRefreshBalance])
  );

  const handleCopyAddress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (walletData?.address) {
      await Clipboard.setStringAsync(walletData.address);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  const handleViewOnEtherscan = () => {
    if (walletData?.address) {
      const url = `https://sepolia.etherscan.io/address/${walletData.address}`;
      Linking.openURL(url);
    }
  };

  const handleSend = () => navigation.navigate('Transfer');
  const handleAddFunds = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AddFunds');
  };
  const handleReceive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Receive', 'This feature is not yet implemented.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{flex: 1}} size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
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

      {/* Fixed Tabs */}
      <View style={styles.tabsContainer}>
          <TouchableOpacity>
              <Text style={[styles.tab, styles.activeTab]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity>
              <Text style={styles.tab}>Coins</Text>
          </TouchableOpacity>
      </View>

      {/* Scrollable Content with Pull-to-Refresh */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#666"
            colors={["#666"]}
            progressBackgroundColor="#fff"
            progressViewOffset={10}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
        <View style={styles.balanceContainer}>
            <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={onRefresh}
                    disabled={refreshing || isBalanceLoading}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Feather 
                            name="refresh-cw" 
                            size={20} 
                            color={refreshing || isBalanceLoading ? "#999" : "#666"} 
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40, // Extra padding for pull-to-refresh
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
    refreshControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshIcon: {
        marginRight: 8,
    },
    refreshText: {
        color: '#666',
        fontSize: 14,
    },
});

export default WalletScreen; 
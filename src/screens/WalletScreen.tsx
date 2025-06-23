import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import CubeIcon from '../components/CubeIcon';

type RootStackParamList = {
  Onboarding: undefined;
  Transfer: undefined;
  AddFunds: undefined;
  Wallet: { newBalance?: string };
};

type WalletScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type WalletScreenRouteProp = RouteProp<RootStackParamList, 'Wallet'>;

interface WalletData {
  address: string;
  ethBalance: string;
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

  useFocusEffect(
    React.useCallback(() => {
      const loadWalletData = async () => {
        setIsLoading(true);
        const address = await getWalletAddress();
        if (address) {
          const onChainBalance = await getBalance(address);
          const currentBalance = parseFloat(walletData?.ethBalance || onChainBalance || '0.0');
          const newFunds = parseFloat(route.params?.newBalance || '0');
          const totalBalance = currentBalance + newFunds;
          setWalletData({ address, ethBalance: totalBalance.toString() });
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
                    <Text style={styles.walletAddress}>{truncateAddress(walletData?.address || '')}</Text>
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
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>
                ${walletData ? formatBalance(walletData.ethBalance) : '0'}
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
        color: 'gray',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walletAddress: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
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
    balanceLabel: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
    },
    actionsContainer: {
        flexDirection: 'row',
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
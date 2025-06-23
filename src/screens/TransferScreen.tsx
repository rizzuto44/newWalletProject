import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    SafeAreaView, 
    TextInput, 
    StyleSheet, 
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBalance, getWalletAddress } from '../services/WalletService';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';


export const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0.00');

  useEffect(() => {
    const fetchBalance = async () => {
        const address = await getWalletAddress();
        if (address) {
            const currentBalance = await getBalance(address);
            setBalance(currentBalance || '0.00');
        }
    };
    fetchBalance();
  }, []);


  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Simulate sending transaction
    Alert.alert(
      'Transaction Sent!',
      `Sent ${amount} tokens to ${toAddress}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
                <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Send</Text>
            <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>${balance}</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>To Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter wallet address"
                        placeholderTextColor="#999"
                        value={toAddress}
                        onChangeText={setToAddress}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Amount (USD)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.flexSpacer} />

                <Text style={styles.securityText}>
                    This transaction will require Face ID authentication
                </Text>
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
      </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    balanceContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        fontWeight: '500'
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#EAECEE',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    flexSpacer: {
        flex: 1,
    },
    securityText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 10,
    },
    sendButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
}); 
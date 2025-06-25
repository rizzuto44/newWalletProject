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
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBalance, getWalletAddress, sendUSDT, getTokenBalance, getTokenPrice, resolveENS } from '../services/WalletService';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';

const formatUsd = (amount: string | number) => {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [isSending, setIsSending] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [ensError, setEnsError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
        const address = await getWalletAddress();
        if (address) {
            const tokenBalance = await getTokenBalance(address);
            const tokenPrice = await getTokenPrice();
            const usdBalance = (parseFloat(tokenBalance) * tokenPrice).toFixed(2);
            setBalance(usdBalance || '0.00');
        }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    const validateENS = async () => {
      const input = toAddress.trim();
      
      // Reset states
      setResolvedAddress(null);
      setEnsError(null);
      
      // Check if input looks like an ENS name
      if (input.includes('.eth') && input.length > 4) {
        setIsValidating(true);
        
        try {
          const resolved = await resolveENS(input);
          if (resolved) {
            setResolvedAddress(resolved);
            setEnsError(null);
          } else {
            setEnsError('Invalid ENS name');
            setResolvedAddress(null);
          }
        } catch (error) {
          setEnsError('Failed to resolve ENS');
          setResolvedAddress(null);
        } finally {
          setIsValidating(false);
        }
      } else {
        setIsValidating(false);
      }
    };
    
    // Debounce the validation to avoid too many API calls
    const timeoutId = setTimeout(validateENS, 500);
    
    return () => clearTimeout(timeoutId);
  }, [toAddress]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleSend = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!toAddress.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // If there's an ENS error, don't proceed
    if (ensError) {
      Alert.alert('Error', 'Please fix the ENS name or use a valid wallet address');
      return;
    }
    
    // Require Face ID authentication before sending
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to send USDT',
        fallbackLabel: 'Enter Passcode',
      });
      if (!result.success) {
        Alert.alert('Authentication Failed', 'Face ID authentication was not successful.');
        return;
      }
    } catch (e) {
      Alert.alert('Error', 'Face ID failed.');
      return;
    }

    let recipientAddress = toAddress.trim();
    if (toAddress.trim().includes('.eth')) {
      if (resolvedAddress) {
        recipientAddress = resolvedAddress;
      } else {
        Alert.alert('Error', 'Please wait for ENS resolution to complete');
        return;
      }
    }

    // Navigate to TransactionStatusScreen with all needed params
    navigation.navigate('TransactionStatus', {
      toAddress: toAddress.trim(),
      resolvedAddress: recipientAddress,
      amount: amount.trim(),
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              <Text style={styles.balanceAmount}>${formatUsd(balance)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>To Address</Text>
              <TextInput
                style={[styles.input, ensError && styles.inputError]}
                placeholder="Enter wallet address or ENS name (e.g., jjjjacob.eth)"
                placeholderTextColor="#999"
                value={toAddress}
                onChangeText={setToAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isValidating && (
                <Text style={styles.validatingText}>
                  Validating ENS...
                </Text>
              )}
              {ensError && (
                <Text style={styles.errorText}>
                  {ensError}
                </Text>
              )}
              {resolvedAddress && (
                <Text style={styles.resolvedAddressText}>
                  ✓ Valid ENS: {resolvedAddress}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (USDT)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <View style={styles.flexSpacer} />

            <Text style={styles.securityText}>
              This transaction will require Face ID authentication
            </Text>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isSending || isResolving || isValidating || !!ensError}>
              <Text style={styles.sendButtonText}>
                {isValidating ? 'Validating...' : isSending ? 'Sending...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    resolvedAddressText: {
        fontSize: 12,
        color: '#22c55e',
        marginTop: 5,
        fontFamily: 'monospace',
        fontWeight: '500',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 5,
    },
    validatingText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
}); 
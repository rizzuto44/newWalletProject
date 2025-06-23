import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';
import MockApplePaySheet from '../components/MockApplePaySheet';

type TabParamList = {
    Home: { newBalance?: string };
    // ... other tabs if they accept params
};
  
type RootStackParamList = {
    AddFunds: undefined;
    MainApp: NavigatorScreenParams<TabParamList>;
};

type AddFundsNavigationProp = StackNavigationProp<RootStackParamList, 'AddFunds'>;

const AddFundsScreen: React.FC = () => {
  const navigation = useNavigation<AddFundsNavigationProp>();
  const [amount, setAmount] = useState('');
  const [isPaySheetVisible, setPaySheetVisible] = useState(false);

  const handleNext = () => {
    setPaySheetVisible(true);
  };

  const handlePaymentSuccess = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to add funds',
      });
      if (result.success) {
        setPaySheetVisible(false);
        navigation.navigate('MainApp', { 
            screen: 'Home', 
            params: { newBalance: amount } 
        });
      } else {
        Alert.alert('Authentication failed');
      }
    } else {
      Alert.alert('No hardware for authentication');
      setPaySheetVisible(false);
      navigation.navigate('MainApp', { 
          screen: 'Home', 
          params: { newBalance: amount } 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Add Funds</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#6c757d"
              autoFocus={true}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, !amount ? styles.nextButtonDisabled : {}]}
            onPress={handleNext}
            disabled={!amount}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <MockApplePaySheet
        isVisible={isPaySheetVisible}
        amount={amount}
        onClose={() => setPaySheetVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'flex-start',
  },
  backButton: {
    fontSize: 16,
    color: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 100,
  },
  footer: {
    padding: 24,
  },
  nextButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFundsScreen; 
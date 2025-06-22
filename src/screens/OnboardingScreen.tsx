import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';

interface OnboardingScreenProps {
  onLogin: () => void;
  isLoading?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onLogin, isLoading = false }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>iosWalletDemo</Text>
          <Text style={styles.subtitle}>Your secure crypto wallet</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.welcomeText}>Welcome to your wallet</Text>
          
          <Text style={styles.description}>
            Create a self-custodial wallet with passkey authentication for secure, seamless access to your digital assets.
          </Text>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={onLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Wallet</Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Your keys, your crypto. We never have access to your funds.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
  },
  mainContent: {
    width: '100%',
    maxWidth: 300,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 24,
  },
}); 
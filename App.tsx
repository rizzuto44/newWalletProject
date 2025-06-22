/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { OnboardingScreen, HomeScreen, TransferScreen } from './src/screens';

type Screen = 'onboarding' | 'home' | 'transfer';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.00');

  const handleLogin = () => {
    // This will be replaced by the new wallet logic
    setWalletAddress('0x1234...5678'); // Placeholder
    setBalance('100.00'); // Placeholder
    setCurrentScreen('home');
  };

  const handleTransfer = () => {
    setCurrentScreen('transfer');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleSend = (toAddress: string, amount: string) => {
    // This will be replaced by the new wallet logic
    console.log(`Sending ${amount} USD to ${toAddress}`);
    setCurrentScreen('home');
  };

  const handleBuy = () => {
    // This will be replaced by the new wallet logic
    console.log('Opening Coinbase on-ramp');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onLogin={handleLogin} />;
      case 'home':
        return (
          <HomeScreen
            balance={balance}
            walletAddress={walletAddress}
            onTransfer={handleTransfer}
            onBuy={handleBuy}
          />
        );
      case 'transfer':
        return (
          <TransferScreen
            balance={balance}
            onSend={handleSend}
            onBack={handleBack}
          />
        );
      default:
        return <OnboardingScreen onLogin={handleLogin} />;
    }
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
    </>
  );
}

export default App;

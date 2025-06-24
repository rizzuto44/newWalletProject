/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import WalletScreen from './src/screens/WalletScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { getWalletAddress } from './src/services/WalletService';
import AddFundsScreen from './src/screens/AddFundsScreen';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212', // Match the LoadingScreen background
  },
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      const address = await getWalletAddress();
      if (address) {
        setHasWallet(true);
        setInitialRoute('Login');
      } else {
        setHasWallet(false);
        setInitialRoute('Onboarding');
      }
    };
    checkWallet();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer theme={navTheme}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator 
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="Transfer" component={TransferScreen} />
            <Stack.Screen name="AddFunds" component={AddFundsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import CubeIcon from '../components/CubeIcon';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MainApp: undefined;
  Onboarding: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in with Face ID',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        Alert.alert('Authentication Failed', 'Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Face ID failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CubeIcon />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={isAuthenticating}
        >
          <Text style={styles.buttonText}>{isAuthenticating ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
    minHeight: 0,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default LoginScreen; 
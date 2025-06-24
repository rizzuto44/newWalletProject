import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { clearWallet } from '../services/WalletService';
import * as LocalAuthentication from 'expo-local-authentication';

type RootStackParamList = {
    Onboarding: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const SettingsScreen = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();

    const handleResetWallet = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Reset Wallet",
            "This will delete your wallet and all funds. This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { 
                    text: "Reset", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Prompt for Face ID before resetting
                            const result = await LocalAuthentication.authenticateAsync({
                                promptMessage: 'Authenticate to reset your wallet',
                                fallbackLabel: 'Enter Passcode',
                            });
                            if (!result.success) {
                                Alert.alert('Authentication Failed', 'Face ID authentication was not successful.');
                                return;
                            }
                            await clearWallet();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Onboarding' }],
                            });
                        } catch (error) {
                            console.error('Error resetting wallet:', error);
                            Alert.alert("Error", "Failed to reset wallet.");
                        }
                    },
                }
            ]
        );
    };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.content}>
            <TouchableOpacity style={styles.button} onPress={handleResetWallet}>
                <Feather name="trash-2" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reset Wallet</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    button: {
        backgroundColor: '#000',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10
    }
});

export default SettingsScreen; 
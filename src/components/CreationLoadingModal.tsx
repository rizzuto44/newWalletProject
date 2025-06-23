import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { createWallet } from '../services/WalletService';

type RootStackParamList = {
    MainApp: { 
        screen: string, 
        params: { 
            address: string
        } 
    };
    Onboarding: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface CreationLoadingModalProps {
    isVisible: boolean;
    onClose: () => void;
}

type LoadingPhase = 'idle' | 'authenticating' | 'escaping' | 'created';

const CreationLoadingModal: React.FC<CreationLoadingModalProps> = ({ isVisible, onClose }) => {
    const navigation = useNavigation<NavigationProp>();
    const [phase, setPhase] = useState<LoadingPhase>('idle');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const startTime = useRef<number>(0);
    const minEscapeTime = 5000; // 5 seconds minimum for "Escaping the matrix..."

    useEffect(() => {
        if (isVisible) {
            startWalletCreation();
        }
    }, [isVisible]);

    const startWalletCreation = async () => {
        setPhase('authenticating');
        startTime.current = Date.now();

        try {
            // Authenticate with Face ID
            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to create your wallet',
                fallbackLabel: 'Use passcode',
            });

            if (!authResult.success) {
                Alert.alert('Authentication Failed', 'Please try again.');
                onClose();
                return;
            }

            setPhase('escaping');

            // Create wallet
            const wallet = await createWallet();
            setWalletAddress(wallet.address);

            // Ensure minimum time for "Escaping the matrix..." message
            const elapsed = Date.now() - startTime.current;
            const remainingTime = Math.max(0, minEscapeTime - elapsed);
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setPhase('created');

            // Show "Wallet created" for 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Navigate to main app
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'MainApp',
                        params: {
                            screen: 'Home',
                            params: {
                                address: wallet.address
                            }
                        }
                    }
                ]
            });

        } catch (error) {
            console.error('Error creating wallet:', error);
            Alert.alert('Error', 'Failed to create wallet. Please try again.');
            onClose();
        }
    };

    const getMessage = () => {
        switch (phase) {
            case 'authenticating':
                return 'Authenticating...';
            case 'escaping':
                return 'Escaping the matrix...';
            case 'created':
                return 'Wallet created';
            default:
                return '';
        }
    };

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.message}>{getMessage()}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    message: {
        color: '#fff',
        fontSize: 18,
        marginTop: 20,
        textAlign: 'center',
    },
});

export default CreationLoadingModal; 
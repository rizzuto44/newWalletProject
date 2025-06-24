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

type LoadingPhase = 'idle' | 'authenticating' | 'created' | 'escaping';

const MIN_AUTH_TIME = 1500; // 1.5 seconds

const CreationLoadingModal: React.FC<CreationLoadingModalProps> = ({ isVisible, onClose }) => {
    const navigation = useNavigation<NavigationProp>();
    const [phase, setPhase] = useState<LoadingPhase>('idle');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (phase === 'authenticating' || phase === 'escaping') {
            interval = setInterval(() => {
                setDotCount(prev => (prev % 3) + 1);
            }, 500);
        } else {
            setDotCount(1);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [phase]);

    const getDots = () => '.'.repeat(dotCount);

    useEffect(() => {
        if (isVisible) {
            startWalletCreation();
        }
    }, [isVisible]);

    const startWalletCreation = async () => {
        setPhase('authenticating');
        const authStart = Date.now();
        try {
            // Face ID authentication
            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to create your wallet',
                fallbackLabel: 'Enter Passcode',
            });
            const authElapsed = Date.now() - authStart;
            if (authElapsed < MIN_AUTH_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_AUTH_TIME - authElapsed));
            }
            if (!authResult.success) {
                Alert.alert('Authentication Failed', 'Face ID authentication was not successful.');
                setPhase('idle');
                onClose();
                return;
            }
            // Wallet creation
            const wallet = await createWallet();
            setWalletAddress(wallet.address);
            setPhase('escaping');
            // Show 'Escaping the matrix...' for 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
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
            setPhase('idle');
            onClose();
        }
    };

    const getMessage = () => {
        switch (phase) {
            case 'authenticating':
                return `Authenticating${getDots()}`;
            case 'escaping':
                return `Escaping the matrix${getDots()}`;
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
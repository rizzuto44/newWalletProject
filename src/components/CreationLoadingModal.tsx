import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { createWallet } from '../services/WalletService';

type RootStackParamList = {
    Wallet: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Wallet'>;

interface CreationLoadingModalProps {
    isVisible: boolean;
    onClose: () => void;
}

type LoadingPhase = 'idle' | 'authenticating' | 'escaping' | 'created';

const CreationLoadingModal: React.FC<CreationLoadingModalProps> = ({ isVisible, onClose }) => {
    const navigation = useNavigation<NavigationProp>();
    const [phase, setPhase] = useState<LoadingPhase>('idle');

    useEffect(() => {
        if (isVisible && phase === 'idle') {
            setPhase('authenticating');
        } else if (!isVisible) {
            setPhase('idle'); 
        }
    }, [isVisible, phase]);

    useEffect(() => {
        const executeFlow = async () => {
            if (phase === 'authenticating') {
                const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to create wallet' });
                if (result.success) {
                    setPhase('escaping');
                } else {
                    Alert.alert('Authentication failed');
                    onClose();
                }
            } else if (phase === 'escaping') {
                const minDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));
                const createWalletPromise = createWallet();
                await Promise.all([minDelayPromise, createWalletPromise]);
                setPhase('created');
            } else if (phase === 'created') {
                const navTimeout = setTimeout(() => {
                    navigation.reset({ index: 0, routes: [{ name: 'Wallet' }] });
                }, 1000);
                return () => clearTimeout(navTimeout);
            }
        };

        executeFlow().catch(err => {
            console.error(err);
            Alert.alert('An error occurred');
            onClose();
        });
    }, [phase, navigation, onClose]);


    const renderContent = () => {
        switch (phase) {
            case 'escaping':
                return (
                    <>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.text}>Escaping the matrix...</Text>
                    </>
                );
            case 'created':
                return <Text style={styles.text}>Wallet created.</Text>;
            default:
                return null; // Don't show anything during 'idle' or 'authenticating'
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.container}>
                {renderContent()}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        color: '#fff',
    },
});

export default CreationLoadingModal; 
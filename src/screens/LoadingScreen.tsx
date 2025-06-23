import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createWallet } from '../services/WalletService';

type RootStackParamList = {
    Dashboard: undefined;
};

type LoadingScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

const LoadingScreen: React.FC = () => {
    const navigation = useNavigation<LoadingScreenNavigationProp>();

    useEffect(() => {
        const setupWallet = async () => {
            try {
                await createWallet();
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                });
            } catch (error) {
                console.error('Failed to create wallet:', error);
                // Optionally, navigate back to onboarding with an error
            }
        };

        // By delaying the execution slightly, we give the UI thread time to
        // render the "Escaping the matrix" screen before starting the heavy work.
        setTimeout(setupWallet, 100);

    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>Escaping the matrix...</Text>
        </View>
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

export default LoadingScreen; 
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import CreationLoadingModal from '../components/CreationLoadingModal';

export const OnboardingScreen: React.FC = () => {
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateWallet = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsCreating(true);
    };

    const handleCloseModal = () => {
        setIsCreating(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Your Wallet</Text>
                <Text style={styles.subtitle}>
                    The easiest and most secure way to manage your crypto.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreateWallet}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            </View>
            <CreationLoadingModal 
                isVisible={isCreating} 
                onClose={handleCloseModal}
            />
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 48,
        maxWidth: 300,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 12,
        width: '100%',
        maxWidth: 340,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
    },
}); 
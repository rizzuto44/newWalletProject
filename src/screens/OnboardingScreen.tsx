import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import CreationLoadingModal from '../components/CreationLoadingModal';
import CubeIcon from '../components/CubeIcon';

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
                <CubeIcon />
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
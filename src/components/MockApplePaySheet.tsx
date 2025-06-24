import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MockApplePaySheetProps {
  isVisible: boolean;
  amount: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const MockApplePaySheet: React.FC<MockApplePaySheetProps> = ({
  isVisible,
  amount,
  onClose,
  onPaymentSuccess,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onPaymentSuccess();
      }, 3000); // Doubled delay for better UX

      return () => clearTimeout(timer); // Cleanup the timeout
    }
  }, [isVisible]);

  const handlePaymentSuccess = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPaymentSuccess();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.applePayHeader}>
            <Ionicons name="logo-apple" size={24} color="white" />
            <Text style={styles.headerText}>Pay</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={20} color="#E5E5EA" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Chime Credit Builder</Text>
          <View style={styles.cardDetails}>
            <View style={styles.cardArt}>
              <Text style={styles.cardArtText}>VISA</Text>
            </View>
            <Text style={styles.cardNumber}>•••• 1234</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#8A8A8E" style={styles.cardChevron} />
        </View>

        <View style={styles.paymentDetailsContainer}>
          <Text style={styles.payToText}>Pay NewWalletProject</Text>
          <TouchableOpacity style={styles.paymentRow}>
            <Text style={styles.amountText}>${parseFloat(amount || '0').toFixed(2)}</Text>
            <Feather name="chevron-right" size={22} color="#8A8A8E" />
          </TouchableOpacity>
        </View>

        <View style={styles.authenticatingContainer}>
          <View style={styles.faceIdIconContainer}>
            <Ionicons name="happy-outline" size={60} color="white" />
          </View>
          <Text style={styles.authenticatingText}>Face ID</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.homeIndicator} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 24,
  },
  applePayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    top: 16,
    left: 16
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  cardArt: {
    width: 50,
    height: 32,
    backgroundColor: '#1C7744',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 4,
    marginRight: 12,
  },
  cardArtText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    fontStyle: 'italic',
  },
  cardNumber: {
    color: '#E5E5EA',
    fontSize: 16,
  },
  cardChevron: {
    alignSelf: 'center',
    marginTop: 20,
  },
  paymentDetailsContainer: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payToText: {
    color: '#8A8A8E',
    fontSize: 16,
    marginBottom: 4,
  },
  amountText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  authenticatingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  faceIdIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  authenticatingText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  footer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#4A4A4A',
  }
});

export default MockApplePaySheet; 
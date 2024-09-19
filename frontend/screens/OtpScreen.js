import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber, callingCode } = route.params;
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [showResendOptions, setShowResendOptions] = useState(false);
  const inputRefs = useRef([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    inputRefs.current[0]?.focus();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(digit => digit !== '') && newOtp.join('') === '123456') {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOTP = async (enteredOtp) => {
    try {
      const isValidOtp = await verifyOtpWithServer(phoneNumber, enteredOtp);

      if (!isValidOtp) {
        alert('Invalid OTP. Please enter the correct OTP.');
        return;
      }

      const response = await axios.get(`http://192.168.1.236:5000/api/auth/check-user-exists/${phoneNumber}`);
      const { userExists } = response.data;

      const user = { phoneNumber, callingCode };

      if (userExists) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.navigate('Payment', { phoneNumber, callingCode });
      } else {
        navigation.navigate('Register', { phoneNumber, callingCode });
      }
    } catch (error) {
      console.error('Error verifying OTP or checking user existence:', error);
      alert('Failed to verify OTP or check user existence. Please try again.');
    }
  };

  const verifyOtpWithServer = async (phoneNumber, otp) => {
    return otp === '123456';
  };

  const closeModal = () => {
    setShowResendOptions(false);
  };

  const handleResendOtp = () => {
    alert('OTP sent');
    closeModal();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>We have sent an OTP code to your Phone No</Text>
        <Text style={styles.phoneNumber}>{`+${callingCode} ${phoneNumber.slice(0, 2)}* *** **${phoneNumber.slice(-2)}`}</Text>
        <Text style={styles.instruction}>Enter the OTP code below to verify.</Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={[styles.otpBox, digit && styles.otpBoxActive]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(ref) => (inputRefs.current[index] = ref)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => setShowResendOptions(true)}>
          <Text style={styles.linkText}>Didn't receive Code?</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={showResendOptions} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Resend OTP</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.modalOption}>
                <View style={styles.modalOptionIcon}>
                  <Text style={styles.modalOptionIconText}>📱</Text>
                </View>
                <Text style={styles.modalOptionText}>Change Mobile Number</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendOtp} style={styles.modalOption}>
                <View style={styles.modalOptionIcon}>
                  <Text style={styles.modalOptionIconText}>🔄</Text>
                </View>
                <Text style={styles.modalOptionText}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: (width - 96) / OTP_LENGTH,
    height: (width - 96) / OTP_LENGTH,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  otpBoxActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#E6F2FF',
  },
  linkButton: {
    alignSelf: 'center',
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: height * 0.3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999999',
    fontWeight: '300',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalOptionIconText: {
    fontSize: 18,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
});

export default OtpScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber, callingCode } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showResendOptions, setShowResendOptions] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
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

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      alert('Please enter the complete 4-digit OTP.');
      return;
    }

    try {
      const isValidOtp = await verifyOtpWithServer(phoneNumber, enteredOtp);

      if (!isValidOtp) {
        alert('Invalid OTP. Please enter the correct OTP.');
        return;
      }

      const response = await axios.get(`http://192.168.3.51:5000/api/auth/check-user-exists/${phoneNumber}`);
      const { userExists } = response.data;

      const user = { phoneNumber, callingCode };

      if (userExists) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.navigate('Payment',{ phoneNumber, callingCode });
      } else {
        navigation.navigate('Register', { phoneNumber, callingCode });
      }
    } catch (error) {
      console.error('Error verifying OTP or checking user existence:', error);
      alert('Failed to verify OTP or check user existence. Please try again.');
    }
  };

  const verifyOtpWithServer = async (phoneNumber, otp) => {
    return otp === '1234';
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.questionMarkContainer} onPress={() => navigation.navigate('Help')}>
          <Text style={styles.questionMark}>?</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Enter 4 digit OTP sent to</Text>
      <Text style={styles.phoneNumber}>{`+${callingCode} ${phoneNumber}`}</Text>
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.didntReceiveOTPContainer} onPress={() => setShowResendOptions(!showResendOptions)}>
          <Text style={styles.didntReceiveOTP}>Didn't receive OTP?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
          <Text style={styles.verifyButtonText}>VERIFY</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showResendOptions} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Other's</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>X</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.optionContainer}>
                  <Image source={require('/Users/syed/al-pay/frontend/1.png')} style={styles.optionImage} />
                  <Text style={styles.optionText}>Change Mobile Number</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResendOtp} style={styles.optionContainer}>
                  <Image source={require('/Users/syed/al-pay/frontend/1.png')} style={styles.optionImage} />
                  <Text style={styles.optionText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  questionMarkContainer: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    fontFamily: 'AnticSlab-Regular',
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#007BFF',
    fontFamily: 'AnticSlab-Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    alignSelf: 'flex-start',
    width: '85%',
  },
  otpBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
    marginRight: 10,
  },
  otpBoxActive: {
    borderColor: '#007BFF',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'AnticSlab-Regular',
  },
  didntReceiveOTPContainer: {
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  didntReceiveOTP: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'AnticSlab-Regular',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: 'bold',
    alignItems: 'center',
    textAlign: 'left',
  },
});

export default OtpScreen;

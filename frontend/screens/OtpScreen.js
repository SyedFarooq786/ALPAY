import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const OtpScreen = ({ route, navigation }) => {
  const { phoneNumber, callingCode } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
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

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      alert('Please enter the complete 4-digit OTP.');
      return;
    }

    try {
      // Replace with your actual OTP verification logic
      const isValidOtp = await verifyOtpWithServer(phoneNumber, enteredOtp);

      if (!isValidOtp) {
        alert('Invalid OTP. Please enter the correct OTP.');
        return;
      }

      const response = await axios.get(`http://10.0.2.2:5000/api/auth/check-user-exists/${phoneNumber}`);
      const { userExists } = response.data;

      if (userExists) {
        navigation.navigate('Payment');
      } else {
        navigation.navigate('Register', { phoneNumber, callingCode });
      }
    } catch (error) {
      console.error('Error verifying OTP or checking user existence:', error);
      alert('Failed to verify OTP or check user existence. Please try again.');
    }
  };

  const verifyOtpWithServer = async (phoneNumber, otp) => {
    // Implement your server-side OTP verification logic here
    // For now, we'll use a dummy implementation that always returns true for '1234'
    return otp === '1234';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.questionMark}>?</Text>
      </View>
      <Text style={styles.title}>Login as</Text>
      <Text style={styles.phoneNumber}>{`+${callingCode} ${phoneNumber}`}</Text>
      <Text style={styles.subtitle}>Enter 4 digit OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={[styles.otpBox, digit && styles.otpBoxActive]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP}>
        <Text style={styles.verifyButtonText}>VERIFY</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  questionMark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignSelf: 'center',
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  otpBoxActive: {
    borderColor: '#007BFF',
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OtpScreen;

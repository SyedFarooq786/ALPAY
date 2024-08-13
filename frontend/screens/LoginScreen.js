import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { LocationContext } from './LocationContext';
import PhoneNumber from 'libphonenumber-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { location } = useContext(LocationContext);
  const [countryCode, setCountryCode] = useState(location.countryCode);
  const [callingCode, setCallingCode] = useState(location.callingCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { phoneNumber, countryCode, callingCode } = JSON.parse(user);
          setPhoneNumber(phoneNumber);
          setCountryCode(countryCode);
          setCallingCode(callingCode);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUser();
  }, []);

  const handleProceed = async () => {
    if (phoneNumber && !phoneNumberError) {
      try {
        // Save user data to AsyncStorage
        const user = {
          phoneNumber,
          countryCode,
          callingCode,
          needsPayment: true // Set this flag as per your logic
        };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('authToken', 'your-auth-token'); // Save the auth token

        console.log('Token saved:', 'your-auth-token');
        console.log('User data saved:', user);
  
        navigation.navigate('Otp', { phoneNumber, countryCode, callingCode });
      } catch (error) {
        console.error('Failed to save user data:', error);
        alert('Failed to proceed. Please try again.');
      }
    } else {
      alert('Please enter a valid phone number');
    }
  };
  

  const onSelectCountry = (country) => {
    console.log(country);
    if (country && country.callingCode && country.callingCode.length > 0) {
      setCountryCode(country.cca2);
      setCallingCode(country.callingCode[0]);
    } else {
      console.error("Selected country data is not valid", country);
    }
  };

  const validatePhoneNumber = (number) => {
    try {
      const phoneNumberObj = PhoneNumber('+' + callingCode + number);
      if (!phoneNumberObj.isValid()) {
        setPhoneNumberError('Invalid phone number');
      } else {
        setPhoneNumberError('');
      }
    } catch (error) {
      setPhoneNumberError('Invalid phone number');
    }
    setPhoneNumber(number);
  };

  return (
    <View style={styles.container}>
      <Animatable.Image
        animation="fadeInLeft"
        source={require('/Users/syed/al-pay/frontend/1.png')}
        style={styles.logo}
      />
      <View style={styles.textContainer}>
        <Animatable.Text animation="fadeIn" style={styles.title}>
          Enter your mobile number
        </Animatable.Text>
        <Animatable.Text animation="fadeIn" style={styles.subtitle}>
          Enter mobile number linked to bank account for UPI and international payments.
        </Animatable.Text>
      </View>
      <Animatable.View animation="fadeIn" delay={500} style={styles.inputContainer}>
        <View style={styles.inputBorder}>
          <CountryPicker
            countryCode={countryCode}
            withFilter
            withFlag
            withCallingCode
            withEmoji
            onSelect={onSelectCountry}
            containerButtonStyle={styles.countryPicker}
            translation="eng"
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={validatePhoneNumber}
            maxLength={15}
          />
        </View>
        {phoneNumberError ? (
          <Text style={styles.errorText}>{phoneNumberError}</Text>
        ) : null}
      </Animatable.View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          By proceeding, you are agreeing to Al-Pay <Text style={styles.link}>Terms and Conditions</Text> &{' '}
          <Text style={styles.link}>Privacy policy</Text>
        </Text>
      </View>
      <Animatable.View animation="bounceIn" delay={1000} style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText}>PROCEED</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  textContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'left',
  },
  inputContainer: {
    width: '100%',
    height: 48,
    marginBottom: 10,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    padding: 10,
  },
  countryPicker: {
    marginRight: 10,
    borderWidth: 0,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    padding: 10,
  },
  callingCode: {
    marginRight: 10,
    fontSize: 16,
    color: '#000',
  },
  input: {
    flex: 1,
    padding: 0,
    fontSize: 16,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 68,
    width: '100%',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007BFF',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'left',
    marginTop: 6,
    marginLeft: 9,
  },
});

export default LoginScreen;

import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StatusBar
} from 'react-native';
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
        const user = {
          phoneNumber,
          countryCode,
          callingCode,
          needsPayment: true
        };
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('authToken', 'your-auth-token');

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4c669f" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.background}>
            <Animatable.Image
              animation="bounceIn"
              duration={1500}
              source={require('/Users/syed/al-pay/frontend/assets/logo.png')}
              style={styles.logo}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Enter your mobile number
              </Text>
              <Text style={styles.subtitle}>
                Enter mobile number linked to bank account for UPI and international payments.
              </Text>
            </View>
            <View style={styles.inputContainer}>
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
                  placeholderTextColor="#a0a0a0"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={validatePhoneNumber}
                  maxLength={15}
                />
              </View>
              {phoneNumberError ? (
                <Text style={styles.errorText}>
                  {phoneNumberError}
                </Text>
              ) : null}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleProceed}>
                <Text style={styles.buttonText}>PROCEED</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By proceeding, you are agreeing to Al-Pay <Text style={styles.link}>Terms and Conditions</Text> &{' '}
                <Text style={styles.link}>Privacy policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4c669f',
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4c669f',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 40,
    marginBottom: 30,
    alignSelf: 'center',
  },
  textContainer: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'ClashGrotesk-Medium' : 'ClashGrotesk-Medium',
  },
  subtitle: {
    fontSize: 12,
    color: '#e0e0e0',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'ClashGrotesk-Medium' : 'ClashGrotesk-Medium',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  countryPicker: {
    marginRight: 10,
  },
  callingCode: {
    marginRight: 10,
    fontSize: 18,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'ClashGrotesk-Medium',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 18,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'ClashGrotesk-Medium',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00a86b',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  footerContainer: {
    width: '100%',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'ClashGrotesk-Medium',
    lineHeight: 20,
  },
  link: {
    color: '#00a86b',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'left',
    marginTop: 8,
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'ClashGrotesk-Medium',
  },
});

export default LoginScreen;
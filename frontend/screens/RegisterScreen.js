import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation, route }) => {
  const { phoneNumber, callingCode } = route.params;
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const fetchCurrencyDetails = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:5000/api/country/country-code/${callingCode}`);
        const { currency } = response.data;
        setCurrencyCode(currency.currencyCode || 'N/A');
        setCurrencyName(currency.currencyName || 'N/A');
        setCurrencySymbol(currency.currencySymbol || 'N/A');
      } catch (error) {
        console.error('Error fetching currency details:', error);
      }
    };

    fetchCurrencyDetails();
  }, [callingCode]);

  const handleContinue = async () => {
    let hasError = false;

    if (!firstName) {
      setFirstNameError(true);
      hasError = true;
    }

    if (!email || !emailRegex.test(email)) {
      setEmailError(true);
      hasError = true;
    }

    if (hasError) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      const custIdResponse = await axios.get('http://10.0.2.2:5000/api/auth/next-custid');
      const newCustId = custIdResponse.data.custId;

      const apiEndpoint = 'http://10.0.2.2:5000/api/auth/save-user-details';
      const response = await axios.post(apiEndpoint, {
        phoneNumber,
        callingCode,
        firstName,
        middleName,
        lastName,
        currencyName,
        currencySymbol,
        upiID: `upi://pay?pa=${phoneNumber}@wpay&pn=${encodeURIComponent(firstName + ' ' + lastName)}&CT=${currencyCode}&custid=${newCustId}`,
        currencyCode,
        email,
      });

      console.log('Saved to database:', response.data);

      navigation.navigate('Payment', { phoneNumber, callingCode });
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Error', `${error.response.data.error}`);
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Please enter your details</Text>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <TextInput
              style={styles.phoneInput}
              value={`+${callingCode} ${phoneNumber}`}
              editable={false}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Currency</Text>
          <Text style={styles.currencyText}>{`${currencyName} (${currencySymbol})`}</Text>
        </View>

        <TextInput
          style={[styles.input, firstNameError && styles.inputError]}
          value={firstName}
          onChangeText={text => {
            setFirstName(text);
            setFirstNameError(false);
          }}
          placeholder="First Name *"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          value={middleName}
          onChangeText={setMiddleName}
          placeholder="Middle Name (optional)"
          placeholderTextColor="#999"
        />
         
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(false);
          }}
          placeholder="Email ID *"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'left',
  },
  infoItem: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  phoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  phoneInput: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  editText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
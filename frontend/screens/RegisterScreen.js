import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation, route }) => {
  const { phoneNumber, callingCode } = route.params;
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);

  useEffect(() => {
    const fetchCurrencyDetails = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:5000/api/country/country-code/${callingCode}`);
        const { currency } = response.data;

        setCurrencyName(currency.currencyName || 'N/A');
        setCurrencySymbol(currency.currencySymbol || 'N/A');
      } catch (error) {
        console.error('Error fetching currency details:', error);
      }
    };

    fetchCurrencyDetails();
  }, [callingCode]);

  const handleContinue = async () => {
    if (!firstName) {
      setFirstNameError(true);
      Alert.alert('Error', 'Please enter your first name.');
      return;
    }

    try {
      const apiEndpoint = 'http://10.0.2.2:5000/api/auth/save-user-details';
      const response = await axios.post(apiEndpoint, {
        phoneNumber,
        callingCode,
        firstName,
        middleName,
        lastName,
        currencyName,
        currencySymbol,
      });

      console.log('Saved to database:', response.data);

      navigation.navigate('Payment', { phoneNumber, callingCode });
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.error}`);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
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
        <Text style={styles.currencyLabel}>Currency</Text>
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
      />

      <TextInput
        style={styles.input}
        value={middleName}
        onChangeText={setMiddleName}
        placeholder="Middle Name (optional)"
      />

      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name"
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
    fontFamily: 'Nexa Regular',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: 'Nexa Regular',
  },
  infoItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Nexa Regular',
  },
  phoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  phoneInput: {
    flex: 1,
    color: '#333',
    fontFamily: 'Nexa Regular',
  },
  editText: {
    color: '#1E90FF',
    fontWeight: 'bold',
    fontFamily: 'Nexa Regular',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Nexa Regular',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Nexa Regular',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    fontFamily: 'Nexa Regular',
  },
  inputError: {
    borderColor: 'red',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nexa Regular',
  },
});

export default RegisterScreen;

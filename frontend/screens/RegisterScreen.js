import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const RegisterScreen = ({ navigation, route }) => {
  const { phoneNumber, callingCode } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  const handleContinue = async () => {
    try {
      const apiEndpoint = 'http://10.0.2.2:5000/api/auth/save-user-details';
      const response = await axios.post(apiEndpoint, {
        phoneNumber,
        callingCode,
        firstName,
        lastName,
        currencyCode: selectedCurrency,
      });

      console.log('Saved to database:', response.data);

      // Navigate to the next screen after successful save
      navigation.navigate('Payment');
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phone Number</Text>
      <Text>{`+${callingCode} ${phoneNumber}`}</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Enter your last name"
      />

      <Text style={styles.label}>Select Currency</Text>
      <Picker
        selectedValue={selectedCurrency}
        onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Indian Rupee (INR)" value="INR" />
        <Picker.Item label="US Dollar (USD)" value="USD" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    backgroundColor: 'blue',
    width: '100%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  picker: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
});

export default RegisterScreen;

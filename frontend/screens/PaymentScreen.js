import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const PaymentScreen = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');

  const handlePayment = () => {
    axios.post('http://10.0.2.2:5000/pay', { amount, currency })
      .then(response => {
        console.log('Payment successful', response.data);
        // Navigate to success page or display success message
        alert('Payment successful!');
      })
      .catch(error => {
        console.error('Payment failed', error);
        // Display error message
        alert('Payment failed. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Make a Payment</Text>
      <Text style={styles.paragraph}>
        Enter the amount and currency to make a payment
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Currency</Text>
        <TextInput
          style={styles.input}
          value={currency}
          onChangeText={setCurrency}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay</Text>
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
    backgroundColor: '#333', // dark gray background
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default PaymentScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';

const SendMoneyScreen = ({ route, navigation }) => {
  const { paValue } = route.params;
  const [amount, setAmount] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../assets/icons8-back-100.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
      </View>

      {/* UPI ID Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>UPI ID:</Text>
        <TextInput
          style={styles.input}
          value={paValue}
          editable={false} // UPI ID is non-editable
        />
      </View>

      {/* Amount Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter Amount:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          autoFocus={true}
        />
      </View>

      {/* Note Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Note:</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a note (optional)"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, { marginBottom: keyboardVisible ? 20 : 50 }]}
        onPress={() => alert('Money Sent!')}
        disabled={!amount}
      >
        <Text style={styles.sendButtonText}>Send Money</Text>
      </TouchableOpacity>

      {/* Footer */}
      {!keyboardVisible && (
        <View style={styles.footerContainer}>
          <Image source={require('/Users/syed/al-pay/frontend/logo.png')} style={styles.logo} />
          <Text style={styles.footerText}>BHIM  |  UPI</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: 'purple',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  footerText: {
    color: '#555',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});

export default SendMoneyScreen;

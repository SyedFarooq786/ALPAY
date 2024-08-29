import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Keyboard, Platform, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const SendMoneyScreen = ({ route }) => {
  const { paValue, ctValue, pnValue } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [recipientCurrencySymbol, setRecipientCurrencySymbol] = useState('');
  const [conversionMessage, setConversionMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.error('Error retrieving phone number from AsyncStorage:', error);
      }
    };

    const fetchUserDetails = async () => {
      try {
        if (phoneNumber) {
          const response = await axios.get(`http://192.168.3.51:5000/api/auth/user/${phoneNumber}`);
          const { currencyCode, currencySymbol } = response.data;
          setCurrencyCode(currencyCode);
          setCurrencySymbol(currencySymbol);

          const recipientSymbol = await getRecipientCurrencySymbol(ctValue);
          setRecipientCurrencySymbol(recipientSymbol);

          if (currencyCode !== ctValue) {
            const convertedAmount = await getConvertedAmount(amount, ctValue, currencyCode);
            setConversionMessage(`You will be debited ${convertedAmount} ${currencySymbol} from your account.`);
          } else {
            setConversionMessage('');
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchPhoneNumber();
    fetchUserDetails();

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
  }, [amount, phoneNumber]);

  const getRecipientCurrencySymbol = async (currencyCode) => {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/currency/${currencyCode}`);
      const currency = response.data[0].currencies[currencyCode];
      return currency?.symbol || '';
    } catch (error) {
      console.error('Error fetching recipient currency symbol:', error);
      return '';
    }
  };

  const getConvertedAmount = async (amount, fromCurrency, toCurrency) => {
    try {
      const response = await axios.get('https://api.currencyapi.com/v3/latest', {
        params: {
          base_currency: fromCurrency,
          currencies: toCurrency
        },
        headers: {
          apikey: 'cur_live_JIuSg5nbHL7rmGxyfTbW5qPEdRKm4VZeThQDV8Zp' // Replace with your API key
        }
      });
      
      const rate = response.data.data[toCurrency]?.value;
      if (!rate) {
        throw new Error('Conversion rate not found');
      }
      return (amount * rate).toFixed(2);
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      return amount;
    }
  };

  const handleAmountChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setAmount(numericText);
  };

  const handleSendMoney = async () => {
    Alert.alert(
      "Confirm Transaction",
      "Are you sure you want to send this amount?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: async () => {
            // Generate a unique transaction number
            const transactionNumber = `TXNWP${Date.now()}`;

            // Get current time
            const transactionTime = moment().format('YYYY-MM-DD HH:mm:ss');

            // Save transaction details
            const transactionDetails = {
              phoneNumber,
              transactionNumber,
              amount,
              recipientCurrencySymbol,
              recipientCurrencyCode: ctValue,
              senderCurrencySymbol: currencySymbol, // Sender's currency symbol
              senderCurrencyCode: currencyCode, 
              recipientName: pnValue,
              recipientUPI: paValue,
              transactionTime,
              phoneNumber,
              transactionType: 'debit'
,
            };

            await axios.post('http://192.168.3.51:5000/api/auth/transaction', transactionDetails);

            // Navigate to the PaymentSuccessScreen
            navigation.navigate('PaymentSuccess', { transactionDetails });
            //console.error('Error during transaction:', error);
            //Alert.alert("Transaction Failed", "There was an error processing your transaction. Please try again.");
          }
        }
      ]
    );
  };

  

  const firstLetter = pnValue.charAt(0).toUpperCase();
  const defaultProfileImage = `https://via.placeholder.com/100?text=${firstLetter}`;

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
        <TouchableOpacity onPress={() => navigation.navigate('Help')} style={styles.helpButton}>
          <Image source={require('/Users/syed/al-pay/frontend/assets/icons8-help-32.png')} style={styles.helpIcon} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: defaultProfileImage }} style={styles.profileImage} />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{pnValue}</Text>
          <Text style={styles.profileUPI}>{paValue}</Text>
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>{ctValue}</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          placeholder="Enter amount"
          value={amount}
          onChangeText={handleAmountChange}
          autoFocus={true}
        />
      </View>

      {/* Conversion Message */}
      {conversionMessage ? (
        <Text style={styles.conversionText}>{conversionMessage}</Text>
      ) : null}

      {/* Note Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Add a note (optional)"
          maxLength={100}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[styles.sendButton, { marginBottom: keyboardVisible ? 20 : 50 }]}
        onPress={handleSendMoney}
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  helpButton: {
    marginRight: 10,
  },
  helpIcon: {
    width: 30,
    height: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileUPI: {
    fontSize: 16,
    color: '#555',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 10,
    color: '#333',
  },
  conversionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  messageInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    letterSpacing: 1,
  },
});

export default SendMoneyScreen;

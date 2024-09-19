import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, KeyboardAvoidingView, Keyboard, Platform, Alert, Modal, SafeAreaView } from 'react-native';
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
  const [selectedBank, setSelectedBank] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bankPin, setBankPin] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [showSendMoneySection, setShowSendMoneySection] = useState(false);
  const [senderName, setSenderName] = useState('');

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

    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (phoneNumber) {
          const response = await axios.get(`http://192.168.1.236:5000/api/auth/user/${phoneNumber}`);
          const { currencyCode, currencySymbol, firstName, lastName } = response.data;
          setCurrencyCode(currencyCode);
          setCurrencySymbol(currencySymbol);
          setSenderName(`${firstName} ${lastName}`);

          const recipientSymbol = await getRecipientCurrencySymbol(ctValue);
          setRecipientCurrencySymbol(recipientSymbol);

          if (amount) {
            if (currencyCode !== ctValue) {
              const convertedAmount = await getConvertedAmount(amount, ctValue, currencyCode);
              setDebitAmount(convertedAmount);
              setCreditAmount(amount);
              setConversionMessage(`You will be debited ${convertedAmount} ${currencySymbol} from your account.`);
            } else {
              setDebitAmount(amount);
              setCreditAmount(amount);
              setConversionMessage('');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [phoneNumber, amount, ctValue]);

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
      return (parseFloat(amount) * rate).toFixed(2);
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      return amount;
    }
  };

  const handleAmountChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setAmount(numericText);
  };

  const handleBankSelection = (bank) => {
    setSelectedBank(bank);
    setShowSendMoneySection(true);
  };

  const handleConfirmPin = () => {
    const validPin = (selectedBank === 'HDFC' && bankPin === '1234') || (selectedBank === 'ICICI' && bankPin === '123456');
    if (!validPin) {
      Alert.alert('Invalid PIN', 'Please enter a valid PIN.');
      return;
    }
    completeTransaction();
    setModalVisible(false);
  };

  const handleSendMoney = async () => {
    setModalVisible(true);
  };


  const completeTransaction = async () => {
    const transactionNumber = `TXNWP${Date.now()}`;
    const transactionTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const transactionDetails = {
      phoneNumber,
      recipientPhoneNumber: paValue.split('@')[0],
      transactionNumber,
      amount: parseFloat(amount),
      recipientCurrencySymbol,
      recipientCurrencyCode: ctValue,
      senderCurrencySymbol: currencySymbol,
      senderCurrencyCode: currencyCode,
      recipientName: pnValue,
      recipientUPI: paValue,
      transactionTime,
      bankAccount: selectedBank,
      transactionType: 'debit',
      debitAmount: parseFloat(debitAmount),
      creditAmount: parseFloat(creditAmount),
      debitedFrom: `${selectedBank} Bank`,
      senderName,
    };

    console.log(transactionDetails);  // Log transaction details to verify

    try {
      const response = await axios.post('http://192.168.1.236:5000/api/auth/transaction', transactionDetails);
      console.log('Transaction response:', response.data);
      navigation.navigate('PaymentSuccess', { transactionDetails });
    } catch (error) {
      console.error('Error during transaction:', error.response?.data || error.message);
      Alert.alert('Transaction Failed', 'There was an error processing your transaction. Please try again.');
    }
  };

  const firstLetter = pnValue.charAt(0).toUpperCase();
  const defaultProfileImage = `https://via.placeholder.com/100?text=${firstLetter}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={require('../assets/icons8-back-100.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Help')} style={styles.helpButton}>
            <Image source={require('../assets/icons8-help-32.png')} style={styles.helpIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image source={{ uri: defaultProfileImage }} style={styles.profileImage} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{pnValue}</Text>
            <Text style={styles.profileUPI}>{paValue}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{ctValue}</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={amount}
            onChangeText={handleAmountChange}
          />
        </View>

        {conversionMessage ? <Text style={styles.conversionText}>{conversionMessage}</Text> : null}

        <View style={styles.bankContainer}>
          <Text style={styles.bankSelectionTitle}>Select Bank Account:</Text>
          <TouchableOpacity
            style={[styles.bankOption, selectedBank === 'HDFC' && styles.selectedBankOption]}
            onPress={() => handleBankSelection('HDFC')}>
            <Text style={styles.bankText}>HDFC Bank</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bankOption, selectedBank === 'ICICI' && styles.selectedBankOption]}
            onPress={() => handleBankSelection('ICICI')}>
            <Text style={styles.bankText}>ICICI Bank</Text>
          </TouchableOpacity>
        </View>

        {selectedBank && (
          <View style={styles.selectedBankContainer}>
            <Text style={styles.selectedBankText}>Selected Bank: {selectedBank}</Text>
          </View>
        )}

        {showSendMoneySection && (
          <TouchableOpacity 
            style={[styles.sendButton, { marginBottom: keyboardVisible ? 20 : 50 }]} 
            onPress={handleSendMoney} 
            disabled={!amount || !selectedBank}
          >
            <Text style={styles.sendButtonText}>Proceed Securely</Text>
          </TouchableOpacity>
        )}

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Bank PIN</Text>
              <TextInput
                style={styles.pinInput}
                keyboardType="numeric"
                placeholder="Enter PIN"
                secureTextEntry={true}
                value={bankPin}
                onChangeText={setBankPin}
              />
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPin}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
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
  amountInput: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 10,
  },
  conversionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  bankContainer: {
    marginBottom: 20,
  },
  bankSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bankOption: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedBankOption: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    backgroundColor: '#F3F4F6',
  },
  bankText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedBankContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  selectedBankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  pinInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendMoneyScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, BackHandler, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileIcon from '/Users/syed/al-pay/frontend/src/components/icons/profile';
import TransactionIcon from '/Users/syed/al-pay/frontend/src/components/icons/Transaction';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';


const extractPaValue = (upiID) => {
  // Check if the UPI ID contains query parameters
  const queryString = upiID.split('?')[1];
  if (!queryString) return null;
  const queryParams = queryString.split('&');
  for (const param of queryParams) {
    const [key, value] = param.split('='); 
    if (key === 'pa') {
      return value;
    }
  }
  return null; // Return null if 'pa' is not found
};

const PaymentScreen = ({ route }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [showQRCodePopup, setShowQRCodePopup] = useState(false); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [upiID, setUpiID] = useState(''); // Dynamic UPI ID
  const [paValue, setPaValue] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState(null); // New state for user details

  const navigation = useNavigation();

  useEffect(() => {
    if (route.params?.phoneNumber) {
      setPhoneNumber(route.params.phoneNumber);
    }
  }, [route.params?.phoneNumber]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent back navigation
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );


  useEffect(() => {
    // Fetch user's phone number and generate UPI ID
    const fetchUserDetails = async () => {
      try {
        console.log('Fetching user details for phone number:', phoneNumber);
        const response = await axios.get(`http://192.168.3.51:5000/api/auth/user/${phoneNumber}`);
        console.log('API response:', response.data); // Log the API response
        
        const user = response.data;
        
        if (!user || !user.upiID) {
          throw new Error('UPI ID is missing or incomplete');
      }

      console.log('Retrieved UPI ID:', user.upiID);
      
      // Store the full UPI ID
      setUpiID(user.upiID);
      await AsyncStorage.setItem('upiID', user.upiID);
      setPhoneNumber(user.phoneNumber);      
      await AsyncStorage.setItem('phoneNumber', user.phoneNumber);
      // Extract and set the 'pa' value
      const paValue = extractPaValue(user.upiID);
      if (!paValue) {
        throw new Error('PA value is missing in UPI ID');
      }
      setPaValue(paValue);
      fetchTransactions(); // Fetch transactions after setting user details
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };
  
    if (phoneNumber) {
      fetchUserDetails();
    }
  }, [phoneNumber]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions for phone number:', phoneNumber);
      const response = await axios.get(`http://192.168.3.51:5000/api/auth/transactions/${phoneNumber}`);
      console.log('Fetched transactions:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      fetchTransactions();
    }
  }, [phoneNumber]);

  const toggleTransactionPopup = () => {
    setShowTransactionPopup(!showTransactionPopup);
  };

  const toggleQRCodePopup = () => {
    setShowQRCodePopup(!showQRCodePopup);
  };

  

  useEffect(() => {
    const retrieveUpiID = async () => {
      try {
        const savedUpiID = await AsyncStorage.getItem('upiID');
        if (savedUpiID) {
          setUpiID(savedUpiID);
          setPaValue(extractPaValue(savedUpiID));
        } else {
          // Optionally fetch the UPI ID if not found in AsyncStorage
          fetchUserDetails();
        }
      } catch (error) {
        console.error('Failed to retrieve UPI ID:', error);
      }
    };
  
    retrieveUpiID();
  }, []);
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // Optionally refresh the UPI ID or other state when the app comes to the foreground
        //retrieveUpiID();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
    subscription.remove();
};
  }, []);


  return (
    <View style={styles.outerContainer}>
      <View style={styles.topContainer}>
        <Text style={styles.titleText}>World Pay</Text>
        <TouchableOpacity style={styles.topIcon}>
           <Icon name="help-circle" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon}>
          <Icon name="bell" size={25} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <Image
          source={{ uri: 'https://via.placeholder.com/350x150' }} 
          style={styles.banner}
        />

        <View style={styles.roundedContainer}>
          <Text style={styles.sectionTitle}>Money Transfers</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="account-circle" size={25} color="#4682B4" />
              <Text style={styles.iconText}>To Mobile Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="bank" size={25} color="#4682B4" />
              <Text style={styles.iconText}>To Bank/UPI ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="account" size={25} color="#4682B4" />
              <Text style={styles.iconText}>To Self Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="currency-inr" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Check Balance</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.upiContainer}>
            <Text style={styles.upiText}>UPI ID: {paValue}</Text>
            <TouchableOpacity style={styles.tryNowButton} onPress={toggleQRCodePopup}>
              <Text style={styles.tryNowText}>My QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roundedContainer}>
          <Text style={styles.sectionTitle}>Recharge & Pay Bills</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="cellphone" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Mobile Recharge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="currency-inr" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Loan Repayment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="gas-cylinder" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Book a Cylinder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="home" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Rent</Text>
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.roundedContainer}>
          <Text style={styles.sectionTitle}>Rewards</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="gift" size={25} color="#4682B4" />
              <Text style={styles.iconText}>Explore Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.newContainer}>
          <Text style={styles.sectionTitle}>New Feature</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="star" size={25} color="#4682B4" />
              <Text style={styles.iconText}>New Feature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingBottomContainer}>
        <TouchableOpacity style={styles.floatingIconButton} onPress={() => navigation.navigate('Profile')}>
          <ProfileIcon width={30} height={30} />
          <Text style={styles.floatingIconText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingIconScanner} onPress={()=> navigation.navigate('QRScanner')}>
          <Icon name="qrcode-scan" size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingIconButton} onPress={() => navigation.navigate('Transactions')}>
          <TransactionIcon width={30} height={30} />
          <Text style={styles.floatingIconText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {showQRCodePopup && (
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>My QR Code</Text>
            <QRCode value={upiID} size={150} />
            <TouchableOpacity onPress={toggleQRCodePopup}>
              <Text style={styles.closePopup}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  banner: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  topIcon: {
    marginLeft: 30,

  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  roundedContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '23%',
    marginBottom: 15,
  },
  iconText: {
    marginTop: 5,
    fontSize: 14,
    color: '#4682B4',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  upiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upiText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  tryNowButton: {
    padding: 10,
    backgroundColor: '#4682B4',
    borderRadius: 5,
  },
  tryNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  floatingBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 25,
    position: 'absolute',
    bottom: 40,
    width: 300,
    height: 55,
    left: '14%', // Adjust as necessary
    right: '11%', // Adjust as necessary
    shadowColor: '#000',
    shadowOffset: { width:0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  floatingIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingIconScanner: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#4682B4',
    borderRadius: 30,
    marginBottom: 25,
  },
  floatingIconText: {
    marginTop: 5,
    fontSize: 12,
    color: '#4682B4',
    textAlign: 'center',
  },
  popupContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closePopup: {
    marginTop: 15,
    color: '#4682B4',
    fontWeight: 'bold',
  },
  newContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4682B4',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  transactionList: {
    maxHeight: 200,
    width: '100%',
  },
  transactionItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  transactionText: {
    fontSize: 16,
  },
  viewMoreButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4682B4',
    borderRadius: 5,
  },
  viewMoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentScreen;

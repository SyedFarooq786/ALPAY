import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, BackHandler } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileIcon from '/Users/syed/al-pay/frontend/src/components/icons/profile';
import TransactionIcon from '/Users/syed/al-pay/frontend/src/components/icons/Transaction';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const extractPaValue = (upiID) => {
  const queryString = upiID.split('?')[1];
  if (!queryString) return null;
  const queryParams = queryString.split('&');
  for (const param of queryParams) {
    const [key, value] = param.split('='); 
    if (key === 'pa') {
      return value;
    }
  }
  return null;
};

const PaymentScreen = ({ route }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [showQRCodePopup, setShowQRCodePopup] = useState(false); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [upiID, setUpiID] = useState('');
  const [paValue, setPaValue] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

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
    const fetchUserDetails = async () => {
      try {
        console.log('Fetching user details for phone number:', phoneNumber);
        const response = await axios.get(`http://192.168.1.236:5000/api/auth/user/${phoneNumber}`);
        console.log('API response:', response.data);
        
        const user = response.data;
        
        if (!user || !user.upiID) {
          throw new Error('UPI ID is missing or incomplete');
        }

        console.log('Retrieved UPI ID:', user.upiID);
        
        setUpiID(user.upiID);
        await AsyncStorage.setItem('upiID', user.upiID);
        setPhoneNumber(user.phoneNumber);      
        await AsyncStorage.setItem('phoneNumber', user.phoneNumber);
        const paValue = extractPaValue(user.upiID);
        if (!paValue) {
          throw new Error('PA value is missing in UPI ID');
        }
        setPaValue(paValue);
        fetchTransactions();
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
      const response = await axios.get(`http://192.168.1.236:5000/api/auth/transactions/${phoneNumber}`);
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
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>World Pay</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bell" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>6</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="help-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={require('/Users/syed/al-pay/frontend/assets/icons/last2.png')}
          style={styles.banner}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Money Transfers</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('ToMobile')}>
              <View style={styles.iconCircle}>
                <Icon name="account" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>To Mobile Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="bank" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>To Bank/UPI ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="refresh" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>To Self Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="currency-inr" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>Check Balance</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.upiContainer}>
            <Text style={styles.upiText}>UPI ID: {paValue}</Text>
            <TouchableOpacity style={styles.qrButton} onPress={toggleQRCodePopup}>
              <Text style={styles.qrButtonText}>My QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recharge & Pay Bills</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="cellphone" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>Mobile Recharge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="cash" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>Loan Repayment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="gas-cylinder" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>Book a Cylinder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconItem}>
              <View style={styles.iconCircle}>
                <Icon name="home" size={24} color="#fff" />
              </View>
              <Text style={styles.iconText}>Rent</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="wallet" size={20} color="#4682B4" />
              <Text style={styles.quickActionText}>World Pay Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="gift" size={20} color="#4682B4" />
              <Text style={styles.quickActionText}>Explore Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="account-multiple" size={20} color="#4682B4" />
              <Text style={styles.quickActionText}>Invite Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Feature</Text>
          <TouchableOpacity style={styles.newFeatureButton}>
            <Icon name="star" size={24} color="#4682B4" />
            <Text style={styles.newFeatureText}>Explore New Feature</Text>
          </TouchableOpacity>
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
            <QRCode value={upiID} size={200} />
            <TouchableOpacity style={styles.closeButton} onPress={toggleQRCodePopup}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4682B4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  banner: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    color: '#4682B4',
    fontSize: 14,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4682B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  iconText: {
    fontSize: 12,
    color: '#4682B4',
    textAlign: 'center',
  },
  upiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  upiText: {
    fontSize: 14,
    color: '#000',
  },
  qrButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quickActionText: {
    marginLeft: 5,
    color: '#4682B4',
    fontSize: 12,
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
    width: 310,
    height: 60,
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
    position: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4682B4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
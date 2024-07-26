import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, BackHandler } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PaymentScreen = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);

  const navigation = useNavigation();

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

  const handlePayment = () => {
    axios.post('http://10.0.2.2:5000/pay', { amount, currency })
      .then(response => {
        console.log('Payment successful', response.data);
        alert('Payment successful!');
      })
      .catch(error => {
        console.error('Payment failed', error);
        alert('Payment failed. Please try again.');
      });
  };

  const toggleTransactionPopup = () => {
    setShowTransactionPopup(!showTransactionPopup);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.topContainer}>
      <Text style={styles.titleText}>World Pay</Text>
        <TouchableOpacity style={styles.topIcon}>
          <Icon name="help-circle" size={25} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon}>
          <Icon name="bell" size={25} color="#000" />
        </TouchableOpacity>
        

      </View>

      <ScrollView style={styles.container}>
        <Image
          source={{ uri: 'https://via.placeholder.com/350x150' }} // replace with actual image URL
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
            <Text style={styles.upiText}>UPI ID: bob6994@ybl</Text>
            <TouchableOpacity style={styles.tryNowButton}>
              <Text style={styles.tryNowText}>Try Now</Text>
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
          <Icon name="account-circle" size={20} color="#000" />
          <Text style={styles.floatingIconText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingIconScanner}>
          <Icon name="qrcode-scan" size={35} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingIconButton} onPress={toggleTransactionPopup}>
          <Icon name="cash" size={30} color="#000" />
          <Text style={styles.floatingIconText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {showTransactionPopup && (
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text style={styles.popupText}>Transactions List</Text>
            <TouchableOpacity onPress={toggleTransactionPopup}>
              <Text style={styles.closePopup}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Add your logout logic here
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.logoutText}>Logout</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const TransactionsScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <Text>Transactions</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Scanner') {
              iconName = 'qrcode-scan';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#4682B4',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Home" component={PaymentScreen} />
        <Tab.Screen name="Scanner" component={PaymentScreen} /> {/* Replace with actual Scanner component */}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#4682B4',
  },
  topIcon: {
    padding: 5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left', // Align text to the left
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    width: '100%',
    height: 150,
    marginBottom: 10,
  },
  roundedContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  upiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upiText: {
    fontSize: 14,
  },
  tryNowButton: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 5,
  },
  tryNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    elevation: 3,
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
    alignItems: 'center',
  },
  floatingIconText: {
    fontSize: 12,
    color: '#000',
  },
  floatingIconScanner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4682B4',
    width: 70,
    height: 70,
    left : 6,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  popupText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closePopup: {
    color: '#4682B4',
    marginTop: 10,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutText: {
    fontSize: 18,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 5,
  },
});

export default PaymentScreen;

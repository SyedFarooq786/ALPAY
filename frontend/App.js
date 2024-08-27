import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationProvider } from './screens/LocationContext';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PaymentScreen from './screens/PaymentScreen';
import HelpScreen from './screens/HelpScreen';
import ProfileScreen from './screens/ProfileScreen';
import QRScannerScreen from './screens/QRScanScreen';
import SendMoneyScreen from './screens/SendMoneyScreen';
import UserProfileScreen from './screens/UserProfileScreen';
const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true); // State to handle loading
  const navigationRef = useRef(null); // Reference for navigation

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('user');

        console.log('Token retrieved:', token);
        console.log('User data retrieved:', user);

        if (token) {
          // If token is found, navigate to Payment screen directly
          setInitialRoute('Payment');
        } else {
          // If no token, decide based on user data
          if (user) {
            const userData = JSON.parse(user);
            const needsPayment = userData?.needsPayment || false;
            setInitialRoute(needsPayment ? 'Payment' : 'Home');
          } else {
            setInitialRoute('Home');
          }
        }
      } catch (error) {
        console.error('Failed to check user login status:', error);
        setInitialRoute('Login');
      } finally {
        setLoading(false); // Stop loading after checking
      }
    };

    checkUserLoggedIn();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }
//<Image source={require('./assets/logo.png')} style={styles.logo} />

  return (
    <NavigationContainer ref={navigationRef}>
      <LocationProvider>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          <Stack.Screen name="Sendmoney" component={SendMoneyScreen} />
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        </Stack.Navigator>
      </LocationProvider>
    </NavigationContainer>
  );
};

export default App;

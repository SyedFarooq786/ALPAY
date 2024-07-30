import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationProvider } from './screens/LocationContext'; // Import LocationProvider
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PaymentScreen from './screens/PaymentScreen';
import HelpScreen from './screens/HelpScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Failed to check user login status:', error);
      }
    };

    checkUserLoggedIn();
  }, []);

  return (
    <NavigationContainer>
      <LocationProvider>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </LocationProvider>
    </NavigationContainer>
  );
};

export default App;

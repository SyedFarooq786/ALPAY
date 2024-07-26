import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LocationProvider } from './LocationContext'; // Import LocationProvider
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PaymentScreen from './screens/PaymentScreen';
import HelpScreen from './screens/HelpScreen'
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
       <LocationProvider>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
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
import React, { useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, SafeAreaView, StatusBar } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import { LocationContext } from './LocationContext'; // Ensure the correct path
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { setLocation } = useContext(LocationContext);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      let permissionsToRequest;

      if (Platform.OS === 'android') {
        permissionsToRequest = [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          PERMISSIONS.ANDROID.READ_CONTACTS,
        ];
      } else if (Platform.OS === 'ios') {
        permissionsToRequest = [
          PERMISSIONS.IOS.CAMERA,
          PERMISSIONS.IOS.PHOTO_LIBRARY,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          PERMISSIONS.IOS.CONTACTS,
        ];
      }

      const granted = await requestMultiple(permissionsToRequest);
      console.log('Permissions granted:', granted);

      if (granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted') {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }

      navigation.navigate('Login');
    } catch (err) {
      console.warn(err);
      navigation.navigate('Login');
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://geocode.xyz/${latitude},${longitude}?geoit=json`)
          .then((response) => response.json())
          .then((data) => {
            const country = data.prov;
            setLocation({ country });
          })
          .catch((error) => {
            console.error('Error fetching location:', error);
          });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }
    );
  };

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animatable.Image 
            animation="fadeIn" 
            duration={1500} 
            source={require('/Users/syed/al-pay/frontend/1.png')} 
            style={styles.logo} 
          />
          <Animatable.Text animation="fadeInDown" delay={500} style={styles.heading}>
            Looking for International Payments?
          </Animatable.Text>
          <Animatable.Text animation="fadeInUp" delay={1000} style={styles.paragraph}>
            Al-Pay is your gateway to seamless international money transfers. Send and receive with ease.
          </Animatable.Text>
          <Animatable.View animation="bounceIn" delay={1500}>
            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Let's Get Started</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#3b5998',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
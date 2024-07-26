import React, { useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import { LocationContext } from '/Users/syed/al-pay/frontend/LocationContext.js'; // Ensure the correct path

const HomeScreen = () => {
  const navigation = useNavigation();
  const { setLocation } = useContext(LocationContext);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Requesting permissions
      const granted = await requestMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.READ_CONTACTS,
      ]);

      console.log('Permissions granted:', granted);

      // If location permission is granted, get location
      if (granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted') {
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
      }

      // Navigate to the Login screen regardless of the permission status
      navigation.navigate('Login');
    } catch (err) {
      console.warn(err);
      // Navigate to the Login screen in case of an error as well
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
            // Update location context
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
    <View style={styles.container}>
      <Image source={require('/Users/syed/al-pay/frontend/1.png')} style={styles.logo} />
      <Text style={styles.heading}>Looking for your international Payments</Text>
      <Text style={styles.paragraph}>
        Al-Pay is a payment gateway that allows you to send and receive money internationally.
      </Text>
      <Animatable.View animation="bounceIn" delay={2000}>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#333',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});

export default HomeScreen;
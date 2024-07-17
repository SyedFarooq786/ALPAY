import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image source={require('/Users/syed/al-pay/frontend/1.png')} style={styles.logo} />
      <Text style={styles.heading}>Looking for your internatial Payments </Text>
      <Text style={styles.paragraph}>
        Al-Pay is a payment gateway that allows you to send and receive money internatially.
      </Text>
      <Animatable.View animation="bounceIn" delay={2000}>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Let's Get started.</Text>
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
    backgroundColor: '#333', // dark gray background
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
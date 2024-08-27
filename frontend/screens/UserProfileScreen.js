import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileScreen = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const phone = await AsyncStorage.getItem('phoneNumber');
        if (phone) {
          setPhoneNumber(phone);
          const response = await axios.get(`http://192.168.3.51:5000/api/auth/user/${phone}`);
          setUserDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  if (!userDetails) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image 
          style={styles.profileImage} 
          source={{ uri: 'https://via.placeholder.com/100' }} 
        />
        <Text style={styles.name}>{userDetails.firstName} {userDetails.lastName}</Text>
        <Text style={styles.email}>Email: {userDetails.email || 'Not Provided'}</Text>
        <Text style={styles.phone}>Phone: {userDetails.phoneNumber}</Text>
        <Text style={styles.currency}>
          Currency: {userDetails.currencyName} ({userDetails.currencySymbol})
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => console.log('Edit Profile')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  currency: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

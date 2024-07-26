import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Logout Cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            // Add your logout logic here
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: false }
    );
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

const styles = StyleSheet.create({
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

export default ProfileScreen;

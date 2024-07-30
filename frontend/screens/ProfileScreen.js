import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const { phoneNumber } = JSON.parse(user);
        setPhoneNumber(phoneNumber);
        const response = await axios.get(`http://192.168.1.15:5000/api/auth/user/${phoneNumber}`);
        const data = response.data;
        setUserData(data);
        setProfileImage(data.profileImage);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleChooseImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 1.0,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);

        try {
          // Upload image to Cloudinary
          const formData = new FormData();
          formData.append('file', {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName,
          });
          formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary upload preset

          const uploadResponse = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const imageUrl = uploadResponse.data.secure_url;

          // Update profile image URL in your backend
          await axios.put(`http://192.168.1.15:5000/api/auth/user/${phoneNumber}`, {
            profileImage: imageUrl,
          });

          console.log('Profile image updated successfully');
        } catch (error) {
          console.error('Error saving profile image:', error.response ? error.response.data : error.message);
          alert('Failed to update profile image. Please try again.');
        
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleChooseImage}>
          <Image
            source={profileImage ? { uri: profileImage.uri } : require('/Users/syed/al-pay/frontend/1.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.profileDetailsContainer}>
          <Text style={styles.profileName}>{userData.firstName} {userData.lastName}</Text>
          <Text style={styles.profileDetails}>{phoneNumber}</Text>
          <Text style={styles.profileDetails}>{userData.currencyCode}</Text>
        </View>
      </View>
      <View style={styles.loggedInContainer}>
        <Text style={styles.loggedInText}>Logged in as: {phoneNumber}</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileDetailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileDetails: {
    fontSize: 14,
    color: 'gray',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loggedInContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  loggedInText: {
    fontSize: 16,
    color: 'gray',
  },
  logoutButton: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

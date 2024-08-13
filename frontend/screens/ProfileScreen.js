import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callingCode, setCallingCode] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');

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
        const { phoneNumber, callingCode } = JSON.parse(user);
        setPhoneNumber(phoneNumber);
        setCallingCode(callingCode);
        const response = await axios.get(`http://192.168.1.15:5000/api/auth/user/${phoneNumber}`);
        const data = response.data;
        setUserData(data);
        setProfileImage(data.profileImage);
        fetchCurrencyInfo(callingCode);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCurrencyInfo = async (callingCode) => {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/all`);
      const countries = response.data;
      const country = countries.find((c) => c.idd.root === `+${callingCode}`);
      if (country) {
        setCurrencyName(country.currencies[Object.keys(country.currencies)[0]].name);
        setCurrencySymbol(country.currencies[Object.keys(country.currencies)[0]].symbol);
      }
    } catch (error) {
      console.error('Error fetching currency info:', error);
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
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
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
          <Text style={styles.profileDetails}>{callingCode ? `+${callingCode} ${phoneNumber}` : phoneNumber}</Text>
          <Text style={styles.profileDetails}>{`${currencySymbol} (${currencyName})`}</Text>
        </View>
      </View>
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Your QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Invite Friend</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Get Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Change Language</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#808080',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  profileDetailsContainer: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  profileDetails: {
    fontSize: 14,
    color: 'white',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  optionContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

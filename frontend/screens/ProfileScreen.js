import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import QRCode from 'react-native-qrcode-svg';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem('phoneNumber');
        const response = await axios.get(`http://192.168.3.51:5000/api/auth/user/${phoneNumber}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const extractPaValue = (upiID) => {
    if (!upiID) {
      return 'default@upi'; // Return a default value if upiID is undefined or null
    }
  
    const queryParams = upiID.split('?')[1];
    const paramsArray = queryParams.split('&');
    for (let param of paramsArray) {
      const [key, value] = param.split('=');
      if (key === 'pa') {
        return value || 'default@upi';
      }
    }
    return 'default@upi'; // Return a default value if 'pa' is not found
  };

  const handleCompleteProfile = () => {
    // Navigate to the Complete Profile screen
  };

  const handleProfileClick = () => {
    // Navigate to the Details screen
    navigation.navigate('UserProfileScreen');
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

  const renderProfileImage = () => {
    if (userData.profileImage) {
      return <Image style={styles.profileImage} source={{ uri: userData.profileImage }} />;
    } else {
      const initial = userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'J';
      return (
        <View style={styles.profileInitialContainer}>
          <Text style={styles.profileInitial}>{initial}</Text>
        </View>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.profileDetails} onPress={handleProfileClick}>
          {renderProfileImage()}
          <View style={styles.userDetailsContainer}>
            <Text style={styles.userName}>{userData.firstName || 'John Doe'}</Text>
            <Text style={styles.userPhone}>{userData.phoneNumber || '+91 7975747104'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rightArrowContainer}>
          <Text style={styles.rightArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Receive Money Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Receive Money</Text>
        <View style={styles.receiveMoneyContainer}>
          <Text style={styles.receiveMoneyText}>
            UPI ID: {extractPaValue(userData.upiID) || 'default@upi'}
          </Text>
          <TouchableOpacity onPress={() => setQrModalVisible(true)}>
            <View style={styles.qrCodeContainer}>
              <QRCode value={userData.upiID || 'upi://pay?pa=default@upi'} size={60} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Modal */}
      <Modal
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <QRCode value={userData.upiID || 'upi://pay?pa=default@upi'} size={200} />
            <TouchableOpacity onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Complete Profile Section */}
      <View style={styles.completeProfileContainer}>
        <View style={styles.completeProfileDetails}>
          <Text style={styles.completeProfileTitle}>Complete Your Profile</Text>
          <Text style={styles.completeProfileDescription}>
            Tell us more about yourself and get a personalized experience on World Pay
          </Text>
        </View>
        <TouchableOpacity style={styles.completeProfileButton} onPress={handleCompleteProfile}>
          <Text style={styles.completeProfileButtonText}>COMPLETE PROFILE</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Methods */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentMethodsContainer}>
          {[
            { name: 'Bank Accounts', icon: '🏦' },
            { name: 'Debit & Credit Cards', icon: '💳' },
            { name: 'World Pay Wallet', icon: '👜' },
            { name: 'World Pay Gift Card', icon: '🎁' },
            { name: 'UPI Lite', icon: '💸' },
            { name: 'RuPay Credit on UPI', icon: '⭐' },
            { name: 'Credit Line on UPI', icon: '📉' }
          ].map((method, index) => (
            <View key={index} style={styles.paymentMethod}>
              <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
              <Text style={styles.paymentMethodText}>{method.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Payment Management */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Payment Management</Text>
        <View style={styles.paymentManagementContainer}>
          {[
            { name: 'AutoPay', icon: '🔁' },
            { name: 'International', icon: '🌐' },
            { name: 'UPI Settings', icon: '⚙️' }
          ].map((management, index) => (
            <View key={index} style={styles.paymentManagement}>
              <Text style={styles.paymentManagementIcon}>{management.icon}</Text>
              <Text style={styles.paymentManagementText}>{management.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* World Pay Account Aggregator */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>World Pay Account </Text>
        {/* Add content for this section as needed */}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInitialContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  userDetailsContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  rightArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightArrow: {
    fontSize: 24,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  receiveMoneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  
  },
  receiveMoneyText: {
    fontSize: 16,
    color: '#333',
  },
  qrCodeContainer: {
    //marginRight: 10,
  },
  completeProfileContainer: {
    backgroundColor: '#007bff',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeProfileDetails: {
    flex: 1,
  },
  completeProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  completeProfileDescription: {
    fontSize: 14,
    color: '#f1f1f1',
    marginTop: 5,
  },
  completeProfileButton: {
    backgroundColor: '#0056b3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  completeProfileButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  paymentMethod: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
  },
  paymentManagementContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  paymentManagement: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentManagementIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  paymentManagementText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
  },
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProfileScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, PermissionsAndroid, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Contacts from 'react-native-contacts';
import axios from 'axios';

export default function PaymentScreen() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: "Contacts Permission",
            message: "This app needs access to your contacts to show them in the payment screen.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          loadContacts();
        } else {
          console.log("Contacts permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      loadContacts();
    }
  };

  const loadContacts = async () => {
    try {
      const fetchedContacts = await Contacts.getAll();
      const formattedContacts = fetchedContacts.map(contact => ({
        ...contact,
        formattedNumber: formatPhoneNumber(contact.phoneNumbers[0]?.number)
      }));

      const uniqueNumbers = new Set(formattedContacts.map(c => c.formattedNumber).filter(Boolean));
      //console.log('Unique phone numbers:', uniqueNumbers);
      const worldPayUsers = await checkWorldPayUsers(Array.from(uniqueNumbers));
      //console.log('WorldPay users:', worldPayUsers);

      const contactsWithWorldPayStatus = formattedContacts.map(contact => ({
        ...contact,
        isWorldPayUser: worldPayUsers.includes(contact.formattedNumber)
      }));

      setContacts(contactsWithWorldPayStatus);
      setFilteredContacts(contactsWithWorldPayStatus);
    } catch (e) {
      console.log('Error loading contacts:', e);
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // Remove country code (assuming it's 1 or 2 digits)
    return digitsOnly.slice(-10);
  };

  const checkWorldPayUsers = async (phoneNumbers) => {
    //console.log('Checking WorldPay users for numbers:', phoneNumbers);
    try {
      // Use GET method instead of POST, and pass phone numbers as a query parameter
      const phoneNumbersString = phoneNumbers.join(',');
      const response = await axios.get(`http://192.168.1.236:5000/api/auth/check-user-exists/${phoneNumbersString}`);
      
      //console.log('API Response:', response.data);

      if (response.data.results) {
        // Handle multiple phone numbers
        return response.data.results.filter(result => result.exists).map(result => result.phoneNumber);
      } else if (response.data.userExists !== undefined) {
        // Handle single phone number
        return response.data.userExists ? phoneNumbers : [];
      } else {
        console.error('Unexpected API response format:', response.data);
        return [];
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error request:', error.request);
      } else {
        console.error('Unexpected error:', error);
      }
      return [];
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = contacts.filter(contact => 
      contact.givenName.toLowerCase().includes(text.toLowerCase()) ||
      (contact.familyName && contact.familyName.toLowerCase().includes(text.toLowerCase())) ||
      (contact.formattedNumber && contact.formattedNumber.includes(text))
    );
    setFilteredContacts(filtered);
  };

  const handleNewPayment = () => {
    navigation.navigate('NewPayment');
  };

  const handleContactPress = (contact) => {
    navigation.navigate('TransactionContact', { contact });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={loadContacts} accessibilityLabel="Refresh contacts">
            <Icon name="refresh" size={24} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Help">
            <Icon name="help-circle-outline" size={24} color="#fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any contact / name"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            accessibilityLabel="Search contacts"
          />
        </View>

        <Text style={styles.contactsTitle}>Contacts</Text>
        {filteredContacts.map((contact, index) => (
          <TouchableOpacity key={index} onPress={() => handleContactPress(contact)}>
            <View style={styles.contactItem}>
              <View style={styles.contactLeft}>
                <View style={[styles.avatar, { backgroundColor: getRandomColor() }]}>
                  <Text style={styles.avatarText}>{contact.givenName[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{`${contact.givenName} ${contact.familyName}`}</Text>
                  <Text style={styles.contactNumber}>
                    {contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : 'No number'}
                  </Text>
                </View>
              </View>
              {contact.isWorldPayUser && (
                <Image
                  source={require('/Users/syed/al-pay/frontend/assets/icons/7644b04c-c576-483a-b431-426c06e77c53-star.png')}
                  style={styles.worldPayLogo}
                  accessibilityLabel="WorldPay user"
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.newPaymentButton} 
        onPress={handleNewPayment}
        accessibilityLabel="New Payment"
      >
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.newPaymentText}>New Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const getRandomColor = () => {
  const colors = ['#5E35B1', '#FFA000', '#E91E63', '#00BCD4', '#4CAF50'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5E35B1',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  worldPayLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  newPaymentButton: {
    position: 'absolute',
    left: '50%',
    bottom: 16,
    backgroundColor: '#5E35B1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    transform: [{ translateX: -75 }],
  },
  newPaymentText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
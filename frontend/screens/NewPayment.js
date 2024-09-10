import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NewPayment() {
  const [contacts, setContacts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch contacts from the device
    // This is a placeholder. You'll need to implement actual contact fetching
    setContacts([
      { name: 'New Phone Number', icon: 'phone-plus' },
      { name: 'Create New Group', icon: 'account-group' },
      { name: '+919513876919', phoneNumber: '+919513876919' },
      { name: '+919743036305', phoneNumber: '+919743036305' },
      { name: '555', phoneNumber: '+917090222292' },
      { name: 'Abdul Eatfit', phoneNumber: '+917339039937' },
      { name: 'Abhilash Eatfit', phoneNumber: '+919884439384' },
      { name: 'Afff', phoneNumber: '+917337778205' },
      { name: 'Afreen', phoneNumber: '+917891818871' },
      { name: 'Airtel', phoneNumber: '+918861534588' },
    ]);
  }, []);

  const handleContactPress = (contact) => {
    // Navigate to payment screen or open payment modal
    console.log('Selected contact:', contact);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To Contact</Text>
        <View style={styles.headerIcons}>
          <Icon name="refresh" size={24} color="#fff" style={styles.icon} />
          <Icon name="help-circle-outline" size={24} color="#fff" style={styles.icon} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter a mobile number or name"
            placeholderTextColor="#888"
          />
        </View>

        {contacts.map((contact, index) => (
          <TouchableOpacity key={index} onPress={() => handleContactPress(contact)}>
            <View style={styles.contactItem}>
              <View style={[styles.avatar, { backgroundColor: getRandomColor() }]}>
                {contact.icon ? (
                  <Icon name={contact.icon} size={24} color="#fff" />
                ) : (
                  <Text style={styles.avatarText}>{contact.name[0].toUpperCase()}</Text>
                )}
              </View>
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.phoneNumber && <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
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
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
});
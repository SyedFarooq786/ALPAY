import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { contact } = route.params;

  useEffect(() => {
    // Fetch transactions for this contact
    // This is a placeholder. You'll need to implement actual transaction fetching
    setTransactions([
      { amount: 20, type: 'sent', date: '28 Aug, 2024', time: '8:33 PM' },
      { amount: 22000, type: 'received', date: '31 Aug, 2024', time: '11:05 AM' },
      { amount: 17000, type: 'received', date: '7 Sep, 2024', time: '12:50 PM' },
      { amount: 90, type: 'received', date: '7 Sep, 2024', time: '7:56 PM' },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{contact.name}</Text>
          <Text style={styles.headerSubtitle}>{contact.phoneNumber}</Text>
        </View>
        <Icon name="clock-outline" size={24} color="#fff" />
        <Icon name="help-circle-outline" size={24} color="#fff" style={styles.icon} />
      </View>

      <ScrollView style={styles.content}>
        {transactions.map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionContent}>
              <Text style={styles.amount}>₹ {transaction.amount}</Text>
              <Text style={styles.transactionType}>
                {transaction.type === 'sent' ? 'Sent Securely' : 'Received Instantly'}
              </Text>
              <Icon 
                name={transaction.type === 'sent' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                size={24} 
                color={transaction.type === 'sent' ? '#E91E63' : '#4CAF50'} 
                style={styles.transactionIcon}
              />
            </View>
            <Text style={styles.transactionDate}>{transaction.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>Hi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>👋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>Send ₹1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
  },
  icon: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionType: {
    fontSize: 14,
    color: '#666',
  },
  transactionIcon: {
    marginLeft: 8,
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#5E35B1',
    borderRadius: 20,
  },
  footerButtonText: {
    color: '#5E35B1',
    fontWeight: 'bold',
  },
});
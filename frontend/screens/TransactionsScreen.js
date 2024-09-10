import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const phone = await AsyncStorage.getItem('phoneNumber');
        if (phone) {
          setPhoneNumber(phone);
        } else {
          setError('Phone number not available');
        }
      } catch (error) {
        setError('Failed to fetch phone number');
      }
    };

    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://192.168.1.236:5000/api/auth/transactions/${phoneNumber}`);
        setTransactions(response.data);
        setFilteredTransactions(response.data);  // Initialize filtered transactions
      } catch (err) {
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [phoneNumber]);

  const formatDate = (transactionDate) => {
    const date = moment(transactionDate);
    if (date.isSame(moment(), 'day')) {
      return 'Today';
    } else if (date.isSame(moment().subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else {
      return date.format('DD MMMM YYYY');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = transactions.filter(transaction => 
        transaction.recipientName.toLowerCase().includes(query.toLowerCase()) || 
        transaction.recipientPhoneNumber.includes(query)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  const handleDateChange = (event, selectedDate, isStartDate) => {
    if (selectedDate) {
      if (isStartDate) {
        setStartDate(selectedDate);
        setShowStartDatePicker(false);
      } else {
        setEndDate(selectedDate);
        setShowEndDatePicker(false);
      }
      filterByDateRange(selectedDate, isStartDate);
    }
  };

  const filterByDateRange = (selectedDate, isStartDate) => {
    const start = isStartDate ? selectedDate : startDate;
    const end = isStartDate ? endDate : selectedDate;

    const filtered = transactions.filter(transaction => {
      const transactionDate = moment(transaction.transactionTime);
      return transactionDate.isBetween(start, end, undefined, '[]');
    });
    setFilteredTransactions(filtered);
  };

  const renderTransaction = (transaction, index) => (
    <TouchableOpacity
      key={index}
      style={styles.transactionCard}
      onPress={() => navigation.navigate('TransactionDetails', { transaction })}
    >
      <View style={styles.transactionRow}>
        <View style={styles.leftColumn}>
          <Text style={styles.transactionTitle}>{`Paid to ${transaction.recipientName}`}</Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.transactionTime)}</Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.transactionAmount}>{`${transaction.recipientCurrencyCode} ${transaction.amount}`}</Text>
        </View>
      </View>
      <Text style={styles.transactionType}>{transaction.transactionType}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or phone number"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{moment(startDate).format('DD MMM YYYY')}</Text>
        </TouchableOpacity>
        <Text style={styles.toText}>to</Text>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{moment(endDate).format('DD MMM YYYY')}</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(e, selectedDate) => handleDateChange(e, selectedDate, true)}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(e, selectedDate) => handleDateChange(e, selectedDate, false)}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#4682B4" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={styles.transactionList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => renderTransaction(transaction, index))
          ) : (
            <Text style={styles.noTransactionsText}>No transactions found</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#ff0000',
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#4682B4',
  },
  toText: {
    fontSize: 16,
    color: '#888',
  },
  transactionList: {
    paddingVertical: 10,
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionDate: {
    color: '#888',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  transactionType: {
    marginTop: 5,
    color: '#888',
    fontSize: 14,
    textAlign: 'right',
  },
  noTransactionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 20,
  },
});

export default TransactionScreen;

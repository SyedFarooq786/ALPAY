import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, SafeAreaView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';

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
        setFilteredTransactions(response.data);
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
        transaction.recipientPhoneNumber.includes(query) ||
        (transaction.senderName && transaction.senderName.toLowerCase().includes(query.toLowerCase())) ||
        (transaction.senderPhoneNumber && transaction.senderPhoneNumber.includes(query))
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

  const renderTransaction = (transaction, index) => {
    const isCredit = transaction.transactionType.toLowerCase() === 'credit';
    return (
      <TouchableOpacity
        key={index}
        style={[styles.transactionCard, isCredit && styles.creditTransactionCard]}
        onPress={() => navigation.navigate('TransactionDetails', { transaction })}
      >
        <View style={styles.transactionRow}>
          <View style={styles.leftColumn}>
            <View style={[styles.iconContainer, isCredit && styles.creditIconContainer]}>
              <Icon name={isCredit ? "arrow-down" : "arrow-up"} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>
                {isCredit ? `Received from ${transaction.senderName}` : `Paid to ${transaction.recipientName}`}
              </Text>
              <Text style={styles.transactionDate}>{formatDate(transaction.transactionTime)}</Text>
            </View>
          </View>
          <View style={styles.rightColumn}>
            <Text style={[styles.transactionAmount, isCredit && styles.creditAmount]}>
              {isCredit ? '+' : '-'} {transaction.recipientCurrencyCode} {transaction.amount}
            </Text>
            <View style={[styles.transactionTypeTag, isCredit ? styles.creditTag : styles.debitTag]}>
              <Text style={styles.transactionTypeText}>
                {isCredit ? 'Credit' : 'Debit'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.searchBarContainer}>
            <Icon name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search by name or phone number"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Icon name="calendar-outline" size={20} color="#4F46E5" style={styles.calendarIcon} />
            <Text style={styles.dateText}>{moment(startDate).format('DD MMM YYYY')}</Text>
          </TouchableOpacity>
          <Icon name="arrow-forward" size={20} color="#9CA3AF" />
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Icon name="calendar-outline" size={20} color="#4F46E5" style={styles.calendarIcon} />
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
          <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#4F46E5',
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 16,
  },
  transactionList: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  creditTransactionCard: {
    backgroundColor: '#E0F2F1',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creditIconContainer: {
    backgroundColor: '#10B981',
  },
  transactionInfo: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  transactionDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  creditAmount: {
    color: '#10B981',
  },
  transactionTypeTag: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  debitTag: {
    backgroundColor: '#FEE2E2',
  },
  creditTag: {
    backgroundColor: '#D1FAE5',
  },
  transactionTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  noTransactionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 20,
  },
});

export default TransactionScreen;
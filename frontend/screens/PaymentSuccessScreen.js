import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentSuccessScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionDetails } = route.params;

  const handleDone = () => {
    navigation.navigate('Payment'); // Adjust 'Home' to your home screen route name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>Payment Sent Successfully!</Text>
      <Text style={styles.detailText}>To: {transactionDetails.pnValue}</Text>
      <Text style={styles.detailText}>Transaction No: {transactionDetails.transactionNumber}</Text>
      <Text style={styles.detailText}>Amount: {transactionDetails.amount}</Text>
      <Text style={styles.detailText}>Time: {transactionDetails.transactionTime}</Text>
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: 'purple',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSuccessScreen;

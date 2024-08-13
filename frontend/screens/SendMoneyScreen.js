import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const SendMoneyScreen = ({ route }) => {
  const { qrData } = route.params;

  const handleSendMoney = () => {
    // Implement money sending logic here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Money</Text>
      <Text style={styles.qrData}>{qrData}</Text>
      <TouchableOpacity style={styles.sendButton} onPress={handleSendMoney}>
        <Text style={styles.sendButtonText}>Send Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  qrData: {
    fontSize: 18,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendMoneyScreen;

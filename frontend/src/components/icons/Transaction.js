import React from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';


const TransactionIcon = () => (
  <FastImage
    source={require('/Users/syed/al-pay/frontend/assets/icons/Forex.gif')} // Path to your GIF
    style={styles.icon}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  icon: {
    width: 34, // Adjust size
    height: 40, // Adjust size
  },
});

export default TransactionIcon;
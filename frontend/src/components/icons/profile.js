import React from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';


const ProfileIcon = () => (
  <FastImage
    source={require('/Users/syed/al-pay/frontend/assets/icons/profile.gif')} // Path to your GIF
    style={styles.icon}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  icon: {
    width: 40, // Adjust size
    height: 40, // Adjust size
  },
});

export default ProfileIcon;
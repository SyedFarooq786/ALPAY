import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface logo {
  size?: number;
}

export default function WorldPayLogo({ size = 24 }: logo) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.5 }]}>WP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5E35B1',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
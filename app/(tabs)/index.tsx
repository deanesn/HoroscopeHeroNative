import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '@/components/HomeScreens/HomeScreen';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
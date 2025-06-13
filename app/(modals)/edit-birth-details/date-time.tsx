import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BirthDateTimeScreen } from '@/components/OnboardingScreens/BirthDateTimeScreen';

export default function EditDateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleNext = () => {
    // Navigate to location editing screen
    router.push({
      pathname: '/(modals)/edit-birth-details/location',
      params: {
        ...params, // Pass through all existing params
      }
    });
  };

  const handleBack = () => {
    // Go back to profile screen
    router.back();
  };

  return (
    <View style={styles.container}>
      <BirthDateTimeScreen 
        onNext={handleNext} 
        onBack={handleBack}
        isEditing={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
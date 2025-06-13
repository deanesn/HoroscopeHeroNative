import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BirthLocationScreen } from '@/components/OnboardingScreens/BirthLocationScreen';

export default function EditLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleNext = () => {
    // Complete editing and go back to profile
    router.back();
    router.back(); // Go back twice to get to profile
  };

  const handleBack = () => {
    // Go back to date-time editing screen
    router.back();
  };

  return (
    <View style={styles.container}>
      <BirthLocationScreen 
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
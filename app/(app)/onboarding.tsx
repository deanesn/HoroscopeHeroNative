import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BirthDateTimeScreen } from '@/components/OnboardingScreens/BirthDateTimeScreen';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    // For now, just navigate to the main app
    // Later you can add more onboarding steps
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <BirthDateTimeScreen onNext={handleNext} onBack={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
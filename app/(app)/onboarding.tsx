import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BirthDateTimeScreen } from '@/components/OnboardingScreens/BirthDateTimeScreen';
import { BirthLocationScreen } from '@/components/OnboardingScreens/BirthLocationScreen';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate to main app
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <BirthDateTimeScreen onNext={handleNext} onBack={handleBack} />;
      case 1:
        return <BirthLocationScreen onNext={handleNext} onBack={handleBack} />;
      default:
        return <BirthDateTimeScreen onNext={handleNext} onBack={handleBack} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
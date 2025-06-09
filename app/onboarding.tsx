import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BirthDateTimeScreen } from '@/components/OnboardingScreens/BirthDateTimeScreen';
import { BirthLocationScreen } from '@/components/OnboardingScreens/BirthLocationScreen';
import { OnboardingCompleteScreen } from '@/components/OnboardingScreens/OnboardingCompleteScreen';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 2) {
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
      // If on first step, redirect to main app instead of going back
      router.replace('/(tabs)');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <BirthDateTimeScreen onNext={handleNext} onBack={handleBack} />;
      case 1:
        return <BirthLocationScreen onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <OnboardingCompleteScreen onNext={handleNext} onBack={handleBack} />;
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
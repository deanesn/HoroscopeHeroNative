import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function IndexPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (loading) return; // Wait for auth to finish loading

      if (!user) {
        // User is not authenticated
        setProfileLoading(false);
        return;
      }

      // User is authenticated, check onboarding status
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_onboarding_complete')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to main app if there's an error
          setIsOnboardingComplete(true);
        } else {
          setIsOnboardingComplete(profile?.is_onboarding_complete || false);
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        // Fallback to main app
        setIsOnboardingComplete(true);
      } finally {
        setProfileLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  // Show loading while determining route
  if (loading || profileLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1A1A2E' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#8A2BE2' : '#6d28d9'} />
      </View>
    );
  }

  // Handle redirects based on auth and onboarding status
  if (!user) {
    return <Redirect href="/auth" />;
  }

  if (isOnboardingComplete === false) {
    return <Redirect href="/onboarding" />;
  }

  // User is authenticated and onboarding is complete
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
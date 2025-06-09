import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

function AppLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const router = useRouter();
  
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const determineInitialRoute = async () => {
      if (loading) return; // Wait for auth to finish loading

      if (!user) {
        // User is not authenticated
        setInitialRoute('auth');
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
          setInitialRoute('(tabs)');
        } else {
          if (profile?.is_onboarding_complete) {
            setInitialRoute('(tabs)');
          } else {
            setInitialRoute('onboarding');
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        // Fallback to main app
        setInitialRoute('(tabs)');
      } finally {
        setProfileLoading(false);
      }
    };

    determineInitialRoute();
  }, [user, loading]);

  // Navigate to the determined initial route
  useEffect(() => {
    if (initialRoute && !loading && !profileLoading) {
      router.replace(`/${initialRoute}`);
    }
  }, [initialRoute, loading, profileLoading, router]);

  // Show loading while determining route
  if (loading || profileLoading || !initialRoute) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1A1A2E' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#8A2BE2' : '#6d28d9'} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function AppLayout() {
  return <AppLayoutNav />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
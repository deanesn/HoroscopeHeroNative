import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme, colors } from '@/context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Redirect } from 'expo-router';
import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient();

if (Platform.OS !== 'web') {
  try {
    SplashScreen.preventAutoHideAsync().catch(() => {
      console.warn('Error preventing splash screen auto hide');
    });
  } catch (e) {
    console.warn('Error accessing SplashScreen:', e);
  }
}

// AuthGate component to handle routing logic
function AuthGate() {
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

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (Platform.OS !== 'web') {
        try {
          SplashScreen.hideAsync().catch(() => {
            console.warn('Error hiding splash screen');
          });
        } catch (e) {
          console.warn('Error accessing SplashScreen:', e);
        }
      }
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="splash" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
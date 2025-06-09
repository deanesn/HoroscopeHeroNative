import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

function AppLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, ensure we're on the auth screen
        router.replace('/auth');
      } else {
        // User is authenticated, check if they need onboarding
        // For now, we'll assume they can access the main app
        // In a real app, you'd check the user's onboarding status here
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1A1A2E' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#8A2BE2' : '#6d28d9'} />
      </View>
    );
  }

  // If user is not authenticated, only show auth screen
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If user is authenticated, show full app navigation
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
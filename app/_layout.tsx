import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1A1A2E' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#8A2BE2' : '#6d28d9'} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
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
            <RootLayoutNav />
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
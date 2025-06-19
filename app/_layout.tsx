import { useEffect } from 'react';
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
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationBanner } from '@/components/shared/NotificationBanner';
import { useNotificationContext } from '@/context/NotificationContext';
import { useNotifications } from '@/hooks/useNotifications';

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

function AppContent() {
  const { notification, hideNotification } = useNotificationContext();
  
  // Initialize notifications hook
  useNotifications();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Global Notification Banner */}
      {notification && (
        <NotificationBanner
          visible={!!notification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onDismiss={hideNotification}
          onPress={notification.onPress}
        />
      )}
      
      <StatusBar style="auto" />
    </>
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
          <NotificationProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </NotificationProvider>
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
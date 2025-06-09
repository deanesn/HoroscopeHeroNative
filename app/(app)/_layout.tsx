import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const router = useRouter();
  
  const [initialRouteDetermined, setInitialRouteDetermined] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const determineAndRedirect = async () => {
      if (loading) return; // Wait for auth to finish loading

      let targetRoute = '';

      if (!user) {
        // User is not authenticated
        targetRoute = '/auth';
        setProfileLoading(false);
      } else {
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
            targetRoute = '/(tabs)';
          } else {
            if (profile?.is_onboarding_complete) {
              targetRoute = '/(tabs)';
            } else {
              targetRoute = '/onboarding';
            }
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
          // Fallback to main app
          targetRoute = '/(tabs)';
        } finally {
          setProfileLoading(false);
        }
      }

      // Perform the navigation
      if (targetRoute) {
        router.replace(targetRoute);
        setInitialRouteDetermined(true);
      }
    };

    determineAndRedirect();
  }, [user, loading, router]);

  // Show loading while determining route
  if (loading || profileLoading || !initialRouteDetermined) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme === 'dark' ? '#1A1A2E' : '#F9FAFB' }]}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#8A2BE2' : '#6d28d9'} />
      </View>
    );
  }

  // Return null after redirection is complete
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
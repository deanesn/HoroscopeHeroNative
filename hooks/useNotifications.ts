import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  body: string;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const subscriptions = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Request permissions and set up listeners
    setupNotifications();

    // Set up Supabase Realtime subscriptions
    setupRealtimeSubscriptions();

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }

      // Clean up Supabase subscriptions
      subscriptions.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptions.current = [];
    };
  }, [user]);

  const setupNotifications = async () => {
    // Only request permissions on native platforms
    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }
    }

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.type) {
        handleNotificationPress(data);
      }
    });
  };

  const setupRealtimeSubscriptions = () => {
    if (!user?.id) return;

    // Subscribe to daily horoscopes
    const dailySubscription = supabase
      .channel('daily_horoscopes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Daily horoscope inserted:', payload);
          scheduleNotification({
            type: 'daily',
            title: '🌟 Your Daily Horoscope is Ready!',
            body: 'Discover what the stars have in store for you today.',
            data: { type: 'daily', payload },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Daily horoscope updated:', payload);
          scheduleNotification({
            type: 'daily',
            title: '✨ Your Daily Horoscope Updated',
            body: 'Your cosmic insights have been refreshed.',
            data: { type: 'daily', payload },
          });
        }
      )
      .subscribe();

    // Subscribe to weekly horoscopes
    const weeklySubscription = supabase
      .channel('weekly_horoscopes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weekly_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Weekly horoscope inserted:', payload);
          scheduleNotification({
            type: 'weekly',
            title: '📅 Your Weekly Horoscope is Here!',
            body: 'Plan your week with cosmic guidance.',
            data: { type: 'weekly', payload },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weekly_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Weekly horoscope updated:', payload);
          scheduleNotification({
            type: 'weekly',
            title: '🔄 Weekly Horoscope Updated',
            body: 'Your weekly cosmic forecast has been updated.',
            data: { type: 'weekly', payload },
          });
        }
      )
      .subscribe();

    // Subscribe to monthly horoscopes
    const monthlySubscription = supabase
      .channel('monthly_horoscopes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'monthly_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Monthly horoscope inserted:', payload);
          scheduleNotification({
            type: 'monthly',
            title: '🌙 Your Monthly Horoscope Awaits!',
            body: 'Explore your cosmic journey for the month ahead.',
            data: { type: 'monthly', payload },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'monthly_horoscopes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Monthly horoscope updated:', payload);
          scheduleNotification({
            type: 'monthly',
            title: '🌟 Monthly Horoscope Refreshed',
            body: 'Your monthly cosmic insights have been updated.',
            data: { type: 'monthly', payload },
          });
        }
      )
      .subscribe();

    // Store subscriptions for cleanup
    subscriptions.current = [dailySubscription, weeklySubscription, monthlySubscription];
  };

  const scheduleNotification = async (notificationData: NotificationData) => {
    try {
      // Only schedule notifications on native platforms
      if (Platform.OS === 'web') {
        // For web, we could show a toast or in-app notification instead
        console.log('Web notification:', notificationData);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleNotificationPress = (data: any) => {
    // This could be used to navigate to specific screens
    // For now, we'll just log the interaction
    console.log('Notification pressed with data:', data);
    
    // You could use expo-router to navigate:
    // import { router } from 'expo-router';
    // if (data.type === 'daily') {
    //   router.push('/(tabs)');
    // }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return { granted: true };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return { granted: finalStatus === 'granted' };
  };

  return {
    requestPermissions,
    scheduleNotification,
  };
};
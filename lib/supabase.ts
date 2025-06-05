import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

// Get the Supabase URL and key from app.json instead of environment variables
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Use different storage mechanisms for web and native platforms
const storage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => {
        try {
          const item = localStorage.getItem(key);
          return Promise.resolve(item);
        } catch (error) {
          console.error('Storage getItem error:', error);
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          console.error('Storage setItem error:', error);
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          console.error('Storage removeItem error:', error);
          return Promise.resolve();
        }
      }
    }
  : AsyncStorage;

// Create the Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-router',
    },
  },
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  try {
    if (event === 'SIGNED_OUT') {
      // Clear any cached data if needed
      storage.removeItem('supabase.auth.token');
    }
  } catch (error) {
    console.error('Auth state change error:', error);
  }
});

// Database types for your horoscope app
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_city: string | null;
  birth_country: string | null;
  zodiac_sign: string | null;
  is_subscribed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone: string | null;
  is_onboarding_complete: boolean | null;
}

export interface DailyHoroscope {
  id: string;
  user_id: string;
  content: string;
  date: string;
  created_at: string | null;
  love_score: number | null;
  mood_score: number | null;
  money_score: number | null;
}

export interface WeeklyHoroscope {
  id: string;
  user_id: string;
  content: string;
  start_date: string;
  weekly_identifier: string | null;
  week_start_date: string | null;
  week_end_date: string | null;
  created_at: string | null;
}

export interface MonthlyHoroscope {
  id: string;
  user_id: string;
  content: string;
  monthly_identifier: string;
  month_start_date: string;
  month_end_date: string;
  created_at: string | null;
}
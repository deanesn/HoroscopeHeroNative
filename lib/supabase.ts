import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

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

supabase.auth.onAuthStateChange((event, session) => {
  try {
    // Let Supabase handle session management internally
    // Removed manual token removal that was interfering with auth state
  } catch (error) {
    console.error('Auth state change error:', error);
  }
});

// Date utility functions
export function getUTCDate() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}

export function getUTCYYYYMMDD(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function getUTCWeekRange() {
  const today = getUTCDate();
  const dayOfWeek = today.getUTCDay();
  
  const weekStart = new Date(today);
  weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  
  return {
    start: getUTCYYYYMMDD(weekStart),
    end: getUTCYYYYMMDD(weekEnd)
  };
}

export function getUTCMonthRange() {
  const today = getUTCDate();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
  
  return {
    start: getUTCYYYYMMDD(monthStart),
    end: getUTCYYYYMMDD(monthEnd)
  };
}

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

export interface Planet {
  id: number;
  name: string;
  orbit_period_days: number | null;
  avg_retrograde_duration_days: number | null;
  retrograde_frequency: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RetrogradeDetail {
  id: string;
  planet_name: string;
  retrograde_start_date: string;
  retrograde_start_degree: number;
  start_degree_sign: string | null;
  start_zodiac_sign: string | null;
  station_retrograde_date: string | null;
  station_retrograde_degree: number | null;
  station_direct_date: string | null;
  station_direct_degree: number | null;
  retrograde_end_date: string;
  retrograde_end_degree: number;
  end_degree_sign: string | null;
  end_zodiac_sign: string | null;
  duration_days: number | null;
  pre_shadow_start_date: string | null;
  post_shadow_end_date: string | null;
  apparent_speed_at_start: number | null;
  apparent_speed_at_end: number | null;
  notes: string | null;
  reference_source: string | null;
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
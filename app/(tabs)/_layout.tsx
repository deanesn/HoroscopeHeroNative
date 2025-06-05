import React from 'react';
import { Tabs } from 'expo-router';
import { Chrome as Home, Sun, Heart, Globe } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          paddingBottom: insets.bottom + 12,
          height: 64 + insets.bottom + 12,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8,
          backgroundColor: themeColors.surface,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="zodiac"
        options={{
          title: 'Zodiac',
          tabBarIcon: ({ color, size }) => (
            <Sun size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planets"
        options={{
          title: 'Planets',
          tabBarIcon: ({ color, size }) => (
            <Globe size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, size }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
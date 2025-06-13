import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const colors = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#6d28d9',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#22C55E',
    accentBackground: '#EDE9FE',
    accentText: '#5B21B6',
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    gradientStart: '#9333EA',
    gradientEnd: '#6d28d9',
    shadowColor: '#000000',
    errorBackground: '#FEF2F2',
    successBackground: '#F0FDF4',
  },
  dark: {
    background: '#1A1A2E',
    surface: '#2C2C40',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    primary: '#8A2BE2',
    border: '#404058',
    error: '#EF4444',
    success: '#22C55E',
    accentBackground: '#2D1B69',
    accentText: '#B794F4',
    cardBackground: '#2C2C40',
    cardBorder: '#404058',
    gradientStart: '#4C1D95',
    gradientEnd: '#5B21B6',
    shadowColor: '#000000',
    errorBackground: '#2D1B1B',
    successBackground: '#1B2D1B',
  },
};
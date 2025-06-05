import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showProfile?: boolean;
  profileInitial?: string;
  leftAction?: () => void;
  leftIcon?: React.ComponentType<{ size: number; color: string }>;
}

export const Header = ({ 
  title, 
  subtitle, 
  showProfile = true, 
  profileInitial,
  leftAction,
  leftIcon: LeftIcon
}: HeaderProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={[styles.header, { 
      backgroundColor: themeColors.surface,
      borderBottomColor: themeColors.border 
    }]}>
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          {leftAction && LeftIcon && (
            <TouchableOpacity style={styles.leftButton} onPress={leftAction}>
              <LeftIcon size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>}
          </View>
        </View>
        {showProfile && (
          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: theme === 'dark' ? 'rgba(138, 43, 226, 0.2)' : '#F3E8FF' }]}
            onPress={() => router.push('/profile')}
          >
            {profileInitial ? (
              <Text style={[styles.profileInitial, { color: themeColors.primary }]}>
                {profileInitial}
              </Text>
            ) : (
              <User size={20} color={themeColors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  profileInitial: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
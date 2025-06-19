import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { Bell, BellOff, Settings } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { Platform } from 'react-native';

export const NotificationSettings = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { requestPermissions } = useNotifications();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);
  const [monthlyEnabled, setMonthlyEnabled] = useState(true);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      setNotificationsEnabled(true);
      return;
    }

    try {
      const { granted } = await requestPermissions();
      setNotificationsEnabled(granted);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !notificationsEnabled) {
      // Request permissions
      const { granted } = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive horoscope updates.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setNotificationsEnabled(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Settings size={20} color={themeColors.primary} />
          <Text style={[styles.title, { color: themeColors.text }]}>
            Notification Settings
          </Text>
        </View>
        {notificationsEnabled ? (
          <Bell size={20} color={themeColors.success} />
        ) : (
          <BellOff size={20} color={themeColors.textSecondary} />
        )}
      </View>

      <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingTitle, { color: themeColors.text }]}>
            Push Notifications
          </Text>
          <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
            Receive notifications when new horoscopes are available
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      {notificationsEnabled && (
        <>
          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                Daily Horoscopes
              </Text>
              <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                Get notified about your daily cosmic insights
              </Text>
            </View>
            <Switch
              value={dailyEnabled}
              onValueChange={setDailyEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={dailyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                Weekly Horoscopes
              </Text>
              <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                Receive weekly cosmic guidance notifications
              </Text>
            </View>
            <Switch
              value={weeklyEnabled}
              onValueChange={setWeeklyEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={weeklyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: themeColors.text }]}>
                Monthly Horoscopes
              </Text>
              <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                Get monthly horoscope update notifications
              </Text>
            </View>
            <Switch
              value={monthlyEnabled}
              onValueChange={setMonthlyEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={monthlyEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </>
      )}

      {Platform.OS === 'web' && (
        <View style={[styles.infoContainer, { 
          backgroundColor: themeColors.accentBackground,
          borderLeftColor: themeColors.primary
        }]}>
          <Text style={[styles.infoText, { color: themeColors.text }]}>
            💡 Web notifications are limited. For the best experience, use the mobile app to receive push notifications.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  infoContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});
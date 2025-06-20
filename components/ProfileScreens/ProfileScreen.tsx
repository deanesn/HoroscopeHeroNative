import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { Profile, supabase } from '@/lib/supabase';
import { LogOut, User, CreditCard as Edit, Calendar, MapPin, Clock, Moon, Sun, X, ExternalLink, Lock } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { NotificationSettings } from '@/components/shared/NotificationSettings';
import * as Linking from 'expo-linking';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const themeColors = colors[theme];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchProfile();
      }
    }, [user])
  );

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't show alert for missing profile, just log it
        if (error.code !== 'PGRST116') {
          Alert.alert('Error', 'Failed to load profile information');
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBirthDetails = () => {
    // Navigate to edit birth details modal with current profile data
    router.push({
      pathname: '/(modals)/edit-birth-details/date-time',
      params: {
        birthDate: profile?.birth_date || '',
        birthTime: profile?.birth_time || '',
        birthCity: profile?.birth_city || '',
        birthCountry: profile?.birth_country || '',
        birthLatitude: profile?.birth_latitude?.toString() || '',
        birthLongitude: profile?.birth_longitude?.toString() || '',
        birthTimezone: profile?.birth_timezone || '',
      }
    });
  };

  const handleChangePassword = () => {
    router.push('/(modals)/change-password');
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://horoscopehero.app/privacy-policy');
    } catch (error) {
      console.error('Error opening privacy policy:', error);
      Alert.alert('Error', 'Unable to open privacy policy. Please try again later.');
    }
  };

  const handleOpenTermsOfService = async () => {
    try {
      await Linking.openURL('https://horoscopehero.app/terms-of-service');
    } catch (error) {
      console.error('Error opening terms of service:', error);
      Alert.alert('Error', 'Unable to open terms of service. Please try again later.');
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, clear local state and navigate
      setProfile(null);
      router.replace('/auth');
    } finally {
      setSigningOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Safe text rendering helpers
  const getDisplayName = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return 'Cosmic Explorer';
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getZodiacSign = () => {
    return profile?.zodiac_sign || '';
  };

  const getBirthDate = () => {
    return profile?.birth_date ? formatDate(profile.birth_date) : 'Not set';
  };

  const getBirthTime = () => {
    return profile?.birth_time ? formatTime(profile.birth_time) : 'Not set';
  };

  const getBirthLocation = () => {
    if (profile?.birth_city && profile?.birth_country) {
      return `${profile.birth_city}, ${profile.birth_country}`;
    }
    return 'Not set';
  };

  const getCoordinates = () => {
    if (profile?.birth_latitude && profile?.birth_longitude) {
      return `${profile.birth_latitude.toFixed(4)}°, ${profile.birth_longitude.toFixed(4)}°`;
    }
    return '';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.profileImagePlaceholder}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.name}>{getDisplayName()}</Text>
            <Text style={styles.email}>{getUserEmail()}</Text>
            {getZodiacSign() ? (
              <Text style={styles.zodiacSign}>{getZodiacSign()}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <>
          <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Theme</Text>
              <View style={styles.themeSwitch}>
                <Moon size={20} color={themeColors.textSecondary} />
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: themeColors.primary }}
                  thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
                />
                <Sun size={20} color={themeColors.textSecondary} />
              </View>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Birth Information</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditBirthDetails}
              >
                <Edit size={16} color={themeColors.primary} />
                <Text style={[styles.editButtonText, { color: themeColors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <Calendar size={20} color={themeColors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Birth Date</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>
                  {getBirthDate()}
                </Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <Clock size={20} color={themeColors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Birth Time</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>
                  {getBirthTime()}
                </Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <MapPin size={20} color={themeColors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Birth Location</Text>
                <Text style={[styles.infoText, { color: themeColors.text }]}>
                  {getBirthLocation()}
                </Text>
                {getCoordinates() ? (
                  <Text style={[styles.coordinatesText, { color: themeColors.textSecondary }]}>
                    {getCoordinates()}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.sectionContainer}>
            <NotificationSettings />
          </View>

          <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Account Settings</Text>
            </View>

            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}
              onPress={handleChangePassword}
            >
              <View style={styles.settingsItemContent}>
                <View style={styles.settingsItemLeft}>
                  <Lock size={20} color={themeColors.primary} />
                  <Text style={[styles.settingsText, { color: themeColors.text }]}>Change Password</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}
              onPress={handleOpenPrivacyPolicy}
            >
              <View style={styles.settingsItemContent}>
                <Text style={[styles.settingsText, { color: themeColors.text }]}>Privacy Policy</Text>
                <ExternalLink size={16} color={themeColors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}
              onPress={handleOpenTermsOfService}
            >
              <View style={styles.settingsItemContent}>
                <Text style={[styles.settingsText, { color: themeColors.text }]}>Terms of Service</Text>
                <ExternalLink size={16} color={themeColors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]} 
              onPress={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <LogOut size={20} color="#FFFFFF" />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  zodiacSign: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Medium',
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  coordinatesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  settingsItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  signOutButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
});
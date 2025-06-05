import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { Profile, supabase } from '@/lib/supabase';
import { LogOut, User, CreditCard as Edit, Calendar, MapPin, Clock, Moon, Sun, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
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
            <Text style={styles.name}>{profile?.first_name || 'Cosmic'} {profile?.last_name || 'Explorer'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
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
              <TouchableOpacity style={styles.editButton}>
                <Edit size={16} color={themeColors.primary} />
                <Text style={[styles.editButtonText, { color: themeColors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <Calendar size={20} color={themeColors.primary} />
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                {profile?.birth_date || 'Add your birth date'}
              </Text>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <Clock size={20} color={themeColors.primary} />
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                {profile?.birth_time || 'Add your birth time'}
              </Text>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: themeColors.border }]}>
              <MapPin size={20} color={themeColors.primary} />
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                {profile?.birth_city && profile?.birth_country 
                  ? `${profile.birth_city}, ${profile.birth_country}` 
                  : 'Add your birth location'}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Account Settings</Text>
            </View>

            <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.settingsText, { color: themeColors.text }]}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.settingsText, { color: themeColors.text }]}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.settingsText, { color: themeColors.text }]}>Privacy Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]} 
              onPress={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <ActivityIndicator color="#FFFFFF\" size="small" />
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
  },
  editButtonText: {
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  settingsItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
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
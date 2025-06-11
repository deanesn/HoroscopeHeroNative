import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Profile, supabase, getUTCYYYYMMDD, getUTCWeekRange, getUTCMonthRange } from '@/lib/supabase';
import { Heart, DollarSign, Moon, RefreshCw, Lock, User, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme, colors } from '@/context/ThemeContext';
import { Header } from '@/components/shared/Header';
import { zodiacSigns } from '@/app/(tabs)/zodiac/data';
import { Flame as Aries, Mountain as Taurus, Users as Gemini, Moon as Cancer, Sun as Leo, Wheat as Virgo, Scale as Libra, Bug as Scorpio, Target as Sagittarius, Mountain as Capricorn, Waves as Aquarius, Fish as Pisces } from 'lucide-react-native';

type HoroscopeType = 'daily' | 'weekly' | 'monthly';

interface HoroscopeData {
  content: string;
  date?: string;
  love_score?: number;
  mood_score?: number;
  money_score?: number;
  week_start_date?: string;
  week_end_date?: string;
  month_start_date?: string;
  month_end_date?: string;
}

const getZodiacIcon = (name: string, size: number, color: string) => {
  const icons = {
    'Aries': <Aries size={size} color={color} />,
    'Taurus': <Taurus size={size} color={color} />,
    'Gemini': <Gemini size={size} color={color} />,
    'Cancer': <Cancer size={size} color={color} />,
    'Leo': <Leo size={size} color={color} />,
    'Virgo': <Virgo size={size} color={color} />,
    'Libra': <Libra size={size} color={color} />,
    'Scorpio': <Scorpio size={size} color={color} />,
    'Sagittarius': <Sagittarius size={size} color={color} />,
    'Capricorn': <Capricorn size={size} color={color} />,
    'Aquarius': <Aquarius size={size} color={color} />,
    'Pisces': <Pisces size={size} color={color} />
  };
  return icons[name] || null;
};

export const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<HoroscopeType | null>(null);

  const fetchHoroscope = async (zodiacSign: string, type: HoroscopeType | null) => {
    if (!zodiacSign) return null;
    
    try {
      const today = getUTCYYYYMMDD();
      let { data, error } = { data: null, error: null };

      if (!type || !profile?.is_subscribed) {
        ({ data, error } = await supabase
          .from('horoscopes')
          .select('content')
          .eq('zodiac_sign', zodiacSign)
          .lte('date', today)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle());
      } else {
        switch (type) {
          case 'daily': {
            ({ data, error } = await supabase
              .from('daily_horoscopes')
              .select('content, love_score, mood_score, money_score, date')
              .eq('user_id', user?.id)
              .lte('date', today)
              .order('date', { ascending: false })
              .limit(1)
              .maybeSingle());
            break;
          }
          case 'weekly': {
            const { start: weekStart, end: weekEnd } = getUTCWeekRange();
            ({ data, error } = await supabase
              .from('weekly_horoscopes')
              .select('content, week_start_date, week_end_date')
              .eq('user_id', user?.id)
              .gte('week_start_date', weekStart)
              .lte('week_end_date', weekEnd)
              .order('week_start_date', { ascending: false })
              .limit(1)
              .maybeSingle());
            break;
          }
          case 'monthly': {
            const { start: monthStart, end: monthEnd } = getUTCMonthRange();
            ({ data, error } = await supabase
              .from('monthly_horoscopes')
              .select('content, month_start_date, month_end_date')
              .eq('user_id', user?.id)
              .gte('month_start_date', monthStart)
              .lte('month_end_date', monthEnd)
              .order('month_start_date', { ascending: false })
              .limit(1)
              .maybeSingle());
            break;
          }
        }
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} horoscope:`, error);
      return null;
    }
  };

  const fetchProfileAndHoroscope = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
        if (profileData?.zodiac_sign) {
          const horoscopeData = await fetchHoroscope(profileData.zodiac_sign, selectedType);
          setHoroscope(horoscopeData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileAndHoroscope();
  }, [user, selectedType]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProfileAndHoroscope();
  }, [selectedType]);

  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header 
        title="HoroscopeHero"
        subtitle="Your daily cosmic insights"
        profileInitial={profile?.first_name?.[0]?.toUpperCase()}
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
      >
        <View style={[styles.welcomeSection, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.greeting, { color: themeColors.text }]}>
            Good day, {profile?.first_name || 'Stargazer'}
          </Text>
          <View style={styles.zodiacContainer}>
            {profile?.zodiac_sign ? 
              getZodiacIcon(profile.zodiac_sign, 20, themeColors.primary)
              : <Moon color={themeColors.primary} size={20} />
            }
            <Text style={[styles.zodiacText, { color: themeColors.textSecondary }]}>
              {profile?.zodiac_sign || 'Complete your profile'}
            </Text>
          </View>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>{formattedDate}</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.typeSelector, { backgroundColor: themeColors.border }]}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === 'daily' && [styles.selectedType, { backgroundColor: themeColors.surface }]
              ]}
              onPress={() => setSelectedType(selectedType === 'daily' ? null : 'daily')}
            >
              <View style={styles.typeButtonContent}>
                <Text style={[
                  styles.typeText,
                  { color: themeColors.textSecondary },
                  selectedType === 'daily' && { color: themeColors.primary }
                ]}>Daily</Text>
                {!profile?.is_subscribed && <Lock size={12} color={selectedType === 'daily' ? themeColors.primary : themeColors.textSecondary} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === 'weekly' && [styles.selectedType, { backgroundColor: themeColors.surface }]
              ]}
              onPress={() => setSelectedType(selectedType === 'weekly' ? null : 'weekly')}
            >
              <View style={styles.typeButtonContent}>
                <Text style={[
                  styles.typeText,
                  { color: themeColors.textSecondary },
                  selectedType === 'weekly' && { color: themeColors.primary }
                ]}>Weekly</Text>
                {!profile?.is_subscribed && <Lock size={12} color={selectedType === 'weekly' ? themeColors.primary : themeColors.textSecondary} />}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === 'monthly' && [styles.selectedType, { backgroundColor: themeColors.surface }]
              ]}
              onPress={() => setSelectedType(selectedType === 'monthly' ? null : 'monthly')}
            >
              <View style={styles.typeButtonContent}>
                <Text style={[
                  styles.typeText,
                  { color: themeColors.textSecondary },
                  selectedType === 'monthly' && { color: themeColors.primary }
                ]}>Monthly</Text>
                {!profile?.is_subscribed && <Lock size={12} color={selectedType === 'monthly' ? themeColors.primary : themeColors.textSecondary} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.dailyHoroscopeCard, { 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.cardBorder
          }]}>
            <View style={styles.horoscopeHeader}>
              <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                {selectedType ? `Your ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Horoscope` : `${profile?.zodiac_sign || 'Your'} Horoscope`}
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <RefreshCw size={20} color={themeColors.primary} />
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            ) : (
              <>
                {!profile?.zodiac_sign ? (
                  <Text style={[styles.noHoroscopeText, { color: themeColors.textSecondary }]}>
                    Set your zodiac sign to view your horoscope
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.horoscopeText, { color: themeColors.textSecondary }]}>
                      {horoscope?.content || 'No horoscope available'}
                    </Text>
                    {selectedType === 'daily' && profile.is_subscribed && horoscope?.love_score && (
                      <View style={[styles.scoreContainer, { borderTopColor: themeColors.border }]}>
                        <View style={styles.scoreItem}>
                          <Heart color="#FF6B6B" size={24} />
                          <Text style={[styles.scoreValue, { color: themeColors.text }]}>
                            {horoscope.love_score}/10
                          </Text>
                          <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>
                            Love
                          </Text>
                        </View>
                        <View style={styles.scoreItem}>
                          <Moon color="#4A90E2" size={24} />
                          <Text style={[styles.scoreValue, { color: themeColors.text }]}>
                            {horoscope.mood_score}/10
                          </Text>
                          <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>
                            Mood
                          </Text>
                        </View>
                        <View style={styles.scoreItem}>
                          <DollarSign color="#2ECC71" size={24} />
                          <Text style={[styles.scoreValue, { color: themeColors.text }]}>
                            {horoscope.money_score}/10
                          </Text>
                          <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>
                            Money
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>

          <View style={[styles.exploreSignsSection, { backgroundColor: themeColors.surface }]}>
            <View style={styles.exploreSignsHeader}>
              <Text style={[styles.exploreSignsTitle, { color: themeColors.text }]}>
                Explore Other Signs
              </Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/zodiac')}
              >
                <Text style={[styles.seeAllText, { color: themeColors.primary }]}>See All</Text>
                <ChevronRight size={16} color={themeColors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.zodiacCardsGrid}>
              {zodiacSigns.slice(0, 4).map((sign) => (
                <TouchableOpacity
                  key={sign.name}
                  style={[styles.zodiacCard, { backgroundColor: themeColors.border }]}
                  onPress={() => router.push(`/zodiac/${sign.name.toLowerCase()}`)}
                >
                  {getZodiacIcon(sign.name, 24, sign.color)}
                  <Text style={[styles.zodiacCardName, { color: themeColors.text }]}>
                    {sign.name}
                  </Text>
                  <Text style={[styles.zodiacCardDates, { color: themeColors.textSecondary }]}>
                    {sign.dates}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {(!profile?.birth_date || !profile?.birth_time || !profile?.birth_city) && (
            <View style={[styles.completeProfileCard, { backgroundColor: themeColors.accentBackground }]}>
              <Text style={[styles.completeProfileTitle, { color: themeColors.accentText }]}>
                Complete Your Birth Chart
              </Text>
              <Text style={[styles.completeProfileText, { color: themeColors.textSecondary }]}>
                Add your birth details to get personalized horoscope readings.
              </Text>
              <TouchableOpacity 
                style={[styles.completeProfileButton, { backgroundColor: themeColors.primary }]}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  zodiacText: {
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  typeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  selectedType: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typeText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  dailyHoroscopeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  horoscopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  refreshButton: {
    padding: 8,
  },
  horoscopeText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  noHoroscopeText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Inter-Regular',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreValue: {
    fontSize: 18,
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  completeProfileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  completeProfileTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  completeProfileText: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  completeProfileButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeProfileButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  exploreSignsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exploreSignsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exploreSignsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  zodiacCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  zodiacCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  zodiacCardName: {
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Inter-SemiBold',
  },
  zodiacCardDates: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
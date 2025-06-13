import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Star, Sparkles, ChevronRight, Calendar, MapPin, Clock } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, Profile } from '@/lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface OnboardingCompleteScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingCompleteScreen = ({ onNext, onBack }: OnboardingCompleteScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  // Animation values
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const sparkle1Opacity = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0);

  React.useEffect(() => {
    // Fetch profile data
    fetchProfile();

    // Animate check mark first
    checkOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
    
    checkScale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) })
    );

    // Animate content
    contentOpacity.value = withDelay(300, withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    }));
    
    contentTranslateY.value = withDelay(300, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));

    // Animate sparkles with staggered timing
    sparkle1Opacity.value = withDelay(600, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 800 }),
      withTiming(1, { duration: 400 })
    ));

    sparkle2Opacity.value = withDelay(800, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 800 }),
      withTiming(1, { duration: 400 })
    ));

    sparkle3Opacity.value = withDelay(1000, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0.3, { duration: 800 }),
      withTiming(1, { duration: 400 })
    ));
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    try {
      // Mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          is_onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Navigate to main app
      onNext();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
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

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const sparkle1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
  }));

  const sparkle2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
  }));

  const sparkle3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle3Opacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>Complete!</Text>
          </View>
        </View>

        {/* Success Animation */}
        <View style={styles.successContainer}>
          <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
            <View style={styles.checkBackground}>
              <CheckCircle size={80} color="#22C55E" />
            </View>
          </Animated.View>

          {/* Floating Sparkles */}
          <Animated.View style={[styles.sparkle, styles.sparkle1, sparkle1AnimatedStyle]}>
            <Sparkles size={24} color="#FFD700" />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle2, sparkle2AnimatedStyle]}>
            <Star size={20} color="#8A2BE2" />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkle3, sparkle3AnimatedStyle]}>
            <Sparkles size={18} color="#FF6B9D" />
          </Animated.View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>Welcome to the Stars!</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Your cosmic profile is complete. Get ready to discover personalized insights about your celestial journey!
            </Text>
          </View>

          {/* Profile Summary */}
          {profile && (
            <View style={styles.profileSummaryContainer}>
              <Text style={[styles.profileSummaryTitle, { color: themeColors.text }]}>Your Cosmic Profile</Text>
              
              <View style={[styles.profileSummaryCard, { 
                backgroundColor: themeColors.surface,
                shadowColor: themeColors.shadowColor
              }]}>
                <View style={styles.zodiacHeader}>
                  <Star size={24} color={themeColors.primary} />
                  <Text style={[styles.zodiacSign, { color: themeColors.primary }]}>{profile.zodiac_sign || 'Unknown'}</Text>
                </View>

                <View style={styles.profileDetails}>
                  {profile.birth_date && (
                    <View style={styles.profileDetailItem}>
                      <Calendar size={16} color={themeColors.textSecondary} />
                      <Text style={[styles.profileDetailText, { color: themeColors.textSecondary }]}>
                        Born {formatDate(profile.birth_date)}
                        {profile.birth_time && ` at ${formatTime(profile.birth_time)}`}
                      </Text>
                    </View>
                  )}

                  {profile.birth_city && profile.birth_country && (
                    <View style={styles.profileDetailItem}>
                      <MapPin size={16} color={themeColors.textSecondary} />
                      <Text style={[styles.profileDetailText, { color: themeColors.textSecondary }]}>
                        {profile.birth_city}, {profile.birth_country}
                      </Text>
                    </View>
                  )}

                  {profile.birth_latitude && profile.birth_longitude && (
                    <View style={styles.profileDetailItem}>
                      <Clock size={16} color={themeColors.textSecondary} />
                      <Text style={[styles.profileDetailText, { color: themeColors.textSecondary }]}>
                        {profile.birth_latitude.toFixed(4)}°, {profile.birth_longitude.toFixed(4)}°
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={[styles.featuresContainer, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.shadowColor
          }]}>
            <Text style={[styles.featuresTitle, { color: themeColors.text }]}>What's Next?</Text>
            
            <View style={[styles.featureItem, { borderBottomColor: themeColors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: themeColors.accentBackground }]}>
                <Star size={24} color={themeColors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: themeColors.text }]}>Daily Horoscopes</Text>
                <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
                  Personalized daily insights based on your unique birth chart
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, { borderBottomColor: themeColors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: themeColors.accentBackground }]}>
                <Sparkles size={24} color="#22C55E" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: themeColors.text }]}>Cosmic Compatibility</Text>
                <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
                  Discover your compatibility with friends, family, and partners
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, { borderBottomColor: themeColors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: themeColors.accentBackground }]}>
                <CheckCircle size={24} color="#FF6B9D" />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: themeColors.text }]}>Planetary Insights</Text>
                <Text style={[styles.featureDescription, { color: themeColors.textSecondary }]}>
                  Track planetary movements and their influence on your life
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.celebrationContainer, { 
            backgroundColor: themeColors.accentBackground,
            borderColor: themeColors.primary
          }]}>
            <Text style={[styles.celebrationText, { color: themeColors.text }]}>
              ✨ Your cosmic adventure begins now! ✨
            </Text>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.getStartedButton, loading && styles.getStartedButtonDisabled]}
            onPress={handleCompleteOnboarding}
            disabled={loading}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.getStartedButtonText}>Enter HoroscopeHero</Text>
                  <ChevronRight size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    position: 'relative',
    marginVertical: 40,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    right: 40,
  },
  sparkle2: {
    bottom: 30,
    left: 30,
  },
  sparkle3: {
    top: 60,
    left: 20,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  profileSummaryContainer: {
    marginBottom: 32,
  },
  profileSummaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileSummaryCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  zodiacSign: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  profileDetails: {
    gap: 12,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  featuresContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  celebrationContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  celebrationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  getStartedButtonDisabled: {
    opacity: 0.7,
  },
  getStartedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
});
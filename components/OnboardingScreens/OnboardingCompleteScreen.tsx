import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Star, Sparkles, ChevronRight } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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

  const handleCompleteOnboarding = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Mark onboarding as complete and determine zodiac sign
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
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
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
        colors={['#1A1A2E', '#16213E', '#0F3460']}
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
            <Text style={styles.progressText}>4 of 5</Text>
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
            <Text style={styles.title}>Congratulations!</Text>
            <Text style={styles.subtitle}>
              Your cosmic profile is now complete. Get ready to discover personalized insights about your future!
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Star size={24} color="#8A2BE2" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Daily Horoscopes</Text>
                <Text style={styles.featureDescription}>
                  Personalized daily insights based on your birth chart
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Sparkles size={24} color="#22C55E" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Cosmic Compatibility</Text>
                <Text style={styles.featureDescription}>
                  Discover your compatibility with friends and partners
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <CheckCircle size={24} color="#FF6B9D" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Planetary Insights</Text>
                <Text style={styles.featureDescription}>
                  Track planetary movements and their influence on your life
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.celebrationContainer}>
            <Text style={styles.celebrationText}>
              🌟 Welcome to your cosmic journey! 🌟
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
              colors={['#8A2BE2', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
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
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  celebrationContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  celebrationText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
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
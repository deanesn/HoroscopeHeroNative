import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, colors } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, X, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for input navigation
  const emailRef = useRef<TextInput>(null);

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);

  React.useEffect(() => {
    // Animate form entrance
    formOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    
    formTranslateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    // Clear any existing error
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[themeColors.gradientStart, themeColors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Password Reset</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Success Content */}
          <Animated.View style={[styles.content, formAnimatedStyle]}>
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={80} color="#22C55E" />
              </View>
              
              <Text style={[styles.successTitle, { color: themeColors.text }]}>
                Check Your Email
              </Text>
              
              <Text style={[styles.successMessage, { color: themeColors.textSecondary }]}>
                We've sent a password reset link to:
              </Text>
              
              <Text style={[styles.emailText, { color: themeColors.primary }]}>
                {email}
              </Text>
              
              <View style={[styles.instructionsContainer, { 
                backgroundColor: themeColors.accentBackground,
                borderLeftColor: themeColors.primary
              }]}>
                <Text style={[styles.instructionsTitle, { color: themeColors.text }]}>
                  What's next?
                </Text>
                <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                  1. Check your email inbox (and spam folder){'\n'}
                  2. Click the reset link in the email{'\n'}
                  3. Create a new password{'\n'}
                  4. Sign in with your new password
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: themeColors.primary }]}
                onPress={() => router.back()}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Reset Password</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, formAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Forgot Your Password?
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={[styles.formContainer, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.shadowColor
          }]}>
            {/* Error Message */}
            {error && (
              <View style={[styles.errorContainer, { 
                backgroundColor: themeColors.errorBackground,
                borderLeftColor: themeColors.error
              }]}>
                <AlertCircle size={16} color={themeColors.error} />
                <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Email Address</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  emailFocused && [
                    styles.inputWrapperFocused,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                activeOpacity={1}
                onPress={() => emailRef.current?.focus()}
              >
                <Mail size={20} color={emailFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { color: themeColors.text }]}
                  placeholder="Enter your email address"
                  placeholderTextColor={themeColors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onSubmitEditing={handleResetPassword}
                />
              </TouchableOpacity>
            </View>

            {/* Info Note */}
            <View style={[styles.infoContainer, { 
              backgroundColor: themeColors.accentBackground,
              borderLeftColor: themeColors.primary
            }]}>
              <Text style={[styles.infoText, { color: themeColors.text }]}>
                💡 Make sure to check your spam folder if you don't see the email in your inbox. 
                The reset link will expire in 1 hour for security reasons.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Send Reset Email Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.resetButton, 
              (!email.trim() || !validateEmail(email.trim())) && styles.resetButtonDisabled,
              loading && styles.resetButtonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={!email.trim() || !validateEmail(email.trim()) || loading}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resetButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Mail size={20} color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>
                    Send Reset Email
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backToSignInButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backToSignInText, { color: themeColors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <Text style={[styles.backToSignInLink, { color: themeColors.primary }]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  placeholder: {
    width: 44,
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapperFocused: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    paddingVertical: 0,
  },
  infoContainer: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  backToSignInButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToSignInText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  backToSignInLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  // Success screen styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 32,
  },
  instructionsContainer: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    marginBottom: 32,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
});
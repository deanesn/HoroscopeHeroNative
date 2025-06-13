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
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme, colors } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const NewAuthScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Refs for input navigation
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  // Animation values
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const logoScale = useSharedValue(0.8);

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

    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
  }, []);

  const handleAuth = async () => {
    // Clear any existing error
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      setFormError('Please enter your first and last name');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUp(email, password, firstName.trim(), lastName.trim())
        : await signIn(email, password);

      if (error) {
        setFormError(error.message);
      }
    } catch (error) {
      setFormError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

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
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={true}
        bounces={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoBackground}>
              <Image 
                source={require('@/assets/images/logo-small.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
          
          <Text style={[styles.title, { color: themeColors.text }]}>Welcome to HoroscopeHero</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {isSignUp ? 'Create your account to start your cosmic journey' : 'Sign in to continue your cosmic journey'}
          </Text>
        </View>

        {/* Form Section */}
        <Animated.View style={[styles.formContainer, formAnimatedStyle, { 
          backgroundColor: themeColors.surface,
          shadowColor: themeColors.shadowColor
        }]}>
          <View style={styles.form}>
            {/* Error Message */}
            {formError && (
              <View style={[styles.errorContainer, { 
                backgroundColor: themeColors.errorBackground,
                borderLeftColor: themeColors.error
              }]}>
                <Text style={[styles.errorText, { color: themeColors.error }]}>{formError}</Text>
              </View>
            )}

            {/* Name Inputs - Only show during sign up */}
            {isSignUp && (
              <>
                {/* First Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>First Name</Text>
                  <TouchableOpacity 
                    style={[
                      styles.inputWrapper,
                      { 
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.border
                      },
                      firstNameFocused && [
                        styles.inputWrapperFocused,
                        { 
                          borderColor: themeColors.primary,
                          backgroundColor: themeColors.surface,
                          shadowColor: themeColors.primary
                        }
                      ]
                    ]}
                    activeOpacity={1}
                    onPress={() => firstNameRef.current?.focus()}
                  >
                    <User size={20} color={firstNameFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={firstNameRef}
                      style={[styles.input, { color: themeColors.text }]}
                      placeholder="Enter your first name"
                      placeholderTextColor={themeColors.textSecondary}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onFocus={() => setFirstNameFocused(true)}
                      onBlur={() => setFirstNameFocused(false)}
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                    />
                  </TouchableOpacity>
                </View>

                {/* Last Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: themeColors.text }]}>Last Name</Text>
                  <TouchableOpacity 
                    style={[
                      styles.inputWrapper,
                      { 
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.border
                      },
                      lastNameFocused && [
                        styles.inputWrapperFocused,
                        { 
                          borderColor: themeColors.primary,
                          backgroundColor: themeColors.surface,
                          shadowColor: themeColors.primary
                        }
                      ]
                    ]}
                    activeOpacity={1}
                    onPress={() => lastNameRef.current?.focus()}
                  >
                    <User size={20} color={lastNameFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={lastNameRef}
                      style={[styles.input, { color: themeColors.text }]}
                      placeholder="Enter your last name"
                      placeholderTextColor={themeColors.textSecondary}
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onFocus={() => setLastNameFocused(true)}
                      onBlur={() => setLastNameFocused(false)}
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </TouchableOpacity>
                </View>
              </>
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
                  placeholder="Enter your email"
                  placeholderTextColor={themeColors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </TouchableOpacity>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Password</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  passwordFocused && [
                    styles.inputWrapperFocused,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                activeOpacity={1}
                onPress={() => passwordRef.current?.focus()}
              >
                <Lock size={20} color={passwordFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.passwordInput, { color: themeColors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={themeColors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onSubmitEditing={handleAuth}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={themeColors.textSecondary} />
                  ) : (
                    <Eye size={20} color={themeColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPasswordContainer} activeOpacity={0.7}>
                <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Sign In/Up Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[themeColors.primary, themeColors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle Sign Up/In */}
            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleText, { color: themeColors.textSecondary }]}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} activeOpacity={0.7}>
                <Text style={[styles.toggleButtonText, { color: themeColors.primary }]}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
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
    marginBottom: 40,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    gap: 20,
  },
  errorContainer: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    transition: 'all 0.2s ease',
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
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
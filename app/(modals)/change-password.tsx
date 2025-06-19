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
import { Eye, EyeOff, Lock, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useNotificationContext } from '@/context/NotificationContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { showNotification } = useNotificationContext();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Refs for input navigation
  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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

  React.useEffect(() => {
    // Calculate password strength
    if (newPassword) {
      let strength = 0;
      if (newPassword.length >= 8) strength += 25;
      if (/[A-Z]/.test(newPassword)) strength += 25;
      if (/[a-z]/.test(newPassword)) strength += 25;
      if (/[0-9]/.test(newPassword)) strength += 12.5;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength += 12.5;
      setPasswordStrength(Math.min(strength, 100));
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const validateForm = () => {
    if (!currentPassword.trim()) {
      setFormError('Please enter your current password');
      return false;
    }

    if (!newPassword.trim()) {
      setFormError('Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      setFormError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // First, verify current password by attempting to sign in
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('Unable to verify user email');
      }

      // Attempt to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      });

      if (signInError) {
        setFormError('Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Show success notification
      showNotification({
        title: 'Password Changed Successfully',
        message: 'Your password has been updated securely.',
        type: 'success',
        duration: 4000,
      });

      // Close modal
      router.back();
    } catch (error: any) {
      console.error('Error changing password:', error);
      setFormError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#EF4444';
    if (passwordStrength < 50) return '#F59E0B';
    if (passwordStrength < 75) return '#10B981';
    return '#059669';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
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
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Change Password</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, formAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Update Your Password
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Choose a strong password to keep your account secure
            </Text>
          </View>

          <View style={[styles.formContainer, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.shadowColor
          }]}>
            {/* Error Message */}
            {formError && (
              <View style={[styles.errorContainer, { 
                backgroundColor: themeColors.errorBackground,
                borderLeftColor: themeColors.error
              }]}>
                <AlertCircle size={16} color={themeColors.error} />
                <Text style={[styles.errorText, { color: themeColors.error }]}>{formError}</Text>
              </View>
            )}

            {/* Current Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Current Password</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  currentPasswordFocused && [
                    styles.inputWrapperFocused,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                activeOpacity={1}
                onPress={() => currentPasswordRef.current?.focus()}
              >
                <Lock size={20} color={currentPasswordFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={currentPasswordRef}
                  style={[styles.input, styles.passwordInput, { color: themeColors.text }]}
                  placeholder="Enter your current password"
                  placeholderTextColor={themeColors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onFocus={() => setCurrentPasswordFocused(true)}
                  onBlur={() => setCurrentPasswordFocused(false)}
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  activeOpacity={0.7}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color={themeColors.textSecondary} />
                  ) : (
                    <Eye size={20} color={themeColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>New Password</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  newPasswordFocused && [
                    styles.inputWrapperFocused,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                activeOpacity={1}
                onPress={() => newPasswordRef.current?.focus()}
              >
                <Lock size={20} color={newPasswordFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={newPasswordRef}
                  style={[styles.input, styles.passwordInput, { color: themeColors.text }]}
                  placeholder="Enter your new password"
                  placeholderTextColor={themeColors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={themeColors.textSecondary} />
                  ) : (
                    <Eye size={20} color={themeColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                    {getPasswordStrengthText()}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Confirm New Password</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  confirmPasswordFocused && [
                    styles.inputWrapperFocused,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                activeOpacity={1}
                onPress={() => confirmPasswordRef.current?.focus()}
              >
                <Lock size={20} color={confirmPasswordFocused ? themeColors.primary : themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, styles.passwordInput, { color: themeColors.text }]}
                  placeholder="Confirm your new password"
                  placeholderTextColor={themeColors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  onSubmitEditing={handleChangePassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={themeColors.textSecondary} />
                  ) : (
                    <Eye size={20} color={themeColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  {newPassword === confirmPassword ? (
                    <View style={styles.matchIndicator}>
                      <CheckCircle size={16} color={themeColors.success} />
                      <Text style={[styles.matchText, { color: themeColors.success }]}>
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchIndicator}>
                      <AlertCircle size={16} color={themeColors.error} />
                      <Text style={[styles.matchText, { color: themeColors.error }]}>
                        Passwords do not match
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Password Requirements */}
            <View style={[styles.requirementsContainer, { 
              backgroundColor: themeColors.accentBackground,
              borderLeftColor: themeColors.primary
            }]}>
              <Text style={[styles.requirementsTitle, { color: themeColors.text }]}>
                Password Requirements:
              </Text>
              <Text style={[styles.requirementsText, { color: themeColors.textSecondary }]}>
                • At least 6 characters long{'\n'}
                • Mix of uppercase and lowercase letters{'\n'}
                • Include numbers and special characters{'\n'}
                • Different from your current password
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Change Password Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.changePasswordButton, 
              (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) && styles.changePasswordButtonDisabled,
              loading && styles.changePasswordButtonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || loading}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.changePasswordButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Lock size={20} color="#FFFFFF" />
                  <Text style={styles.changePasswordButtonText}>
                    Change Password
                  </Text>
                </>
              )}
            </LinearGradient>
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
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
  matchContainer: {
    marginTop: 8,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  requirementsContainer: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  changePasswordButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  changePasswordButtonDisabled: {
    opacity: 0.5,
  },
  changePasswordButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  changePasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
});
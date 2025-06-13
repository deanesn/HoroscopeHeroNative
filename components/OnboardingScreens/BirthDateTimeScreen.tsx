import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, getZodiacSignFromDate } from '@/lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';

// Import native date picker for iOS/Android
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (error) {
    console.warn('DateTimePicker not available:', error);
  }
}

const { width, height } = Dimensions.get('window');

interface BirthDateTimeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const BirthDateTimeScreen = ({ onNext, onBack }: BirthDateTimeScreenProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Web-specific states
  const [webDateInput, setWebDateInput] = useState('');
  const [webTimeInput, setWebTimeInput] = useState('');
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = colors[theme];

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Native date picker handlers
  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
    }
  };

  // Web input handlers
  const handleWebDateChange = (dateString: string) => {
    setWebDateInput(dateString);
    if (dateString) {
      const date = new Date(dateString);
      setSelectedDate(date);
    }
  };

  const handleWebTimeChange = (timeString: string) => {
    setWebTimeInput(timeString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      setSelectedTime(date);
    }
  };

  const handleSaveBirthInfo = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both your birth date and time.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Format date and time for database
      const birthDate = selectedDate.toISOString().split('T')[0];
      const birthTime = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}:00`;

      // Calculate zodiac sign from birth date
      const zodiacSign = getZodiacSignFromDate(selectedDate);

      const { error } = await supabase
        .from('profiles')
        .update({
          birth_date: birthDate,
          birth_time: birthTime,
          zodiac_sign: zodiacSign,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onNext();
    } catch (error) {
      console.error('Error saving birth info:', error);
      Alert.alert('Error', 'Failed to save birth information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  // Get minimum and maximum dates for native picker
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    return minDate;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 13);
    return maxDate;
  };

  const renderNativeDatePicker = () => {
    if (Platform.OS === 'web' || !DateTimePicker) {
      return (
        <View style={styles.webInputContainer}>
          <TextInput
            style={[styles.webInput, { 
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
              color: themeColors.text
            }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={themeColors.textSecondary}
            value={webDateInput}
            onChangeText={handleWebDateChange}
            keyboardType="numeric"
          />
        </View>
      );
    }

    return (
      <>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || getMaxDate()}
            mode="date"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={onDateChange}
            minimumDate={getMinDate()}
            maximumDate={getMaxDate()}
          />
        )}
      </>
    );
  };

  const renderNativeTimePicker = () => {
    if (Platform.OS === 'web' || !DateTimePicker) {
      return (
        <View style={styles.webInputContainer}>
          <TextInput
            style={[styles.webInput, { 
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
              color: themeColors.text
            }]}
            placeholder="HH:MM AM/PM"
            placeholderTextColor={themeColors.textSecondary}
            value={webTimeInput}
            onChangeText={handleWebTimeChange}
            keyboardType="numeric"
          />
        </View>
      );
    }

    return (
      <>
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={onTimeChange}
          />
        )}
      </>
    );
  };

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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>1 of 5</Text>
          </View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, formAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>When were you born?</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Your birth date and time help us create your personalized horoscope and determine your zodiac sign
            </Text>
          </View>

          <View style={[styles.formContainer, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.shadowColor
          }]}>
            {/* Birth Date Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Birth Date</Text>
              <TouchableOpacity 
                style={[
                  styles.inputButton, 
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  selectedDate && [
                    styles.inputButtonSelected,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                onPress={() => {
                  if (Platform.OS === 'web' || !DateTimePicker) {
                    // For web, focus on the input field
                    return;
                  }
                  setShowDatePicker(true);
                }}
              >
                <Calendar size={20} color={selectedDate ? themeColors.primary : themeColors.textSecondary} />
                <Text style={[
                  styles.inputButtonText,
                  { color: themeColors.textSecondary },
                  selectedDate && [styles.inputButtonTextSelected, { color: themeColors.text }]
                ]}>
                  {selectedDate ? formatDate(selectedDate) : 'Select your birth date'}
                </Text>
                {Platform.OS !== 'web' && DateTimePicker && (
                  <ChevronRight size={20} color={themeColors.textSecondary} />
                )}
              </TouchableOpacity>

              {renderNativeDatePicker()}
            </View>

            {/* Birth Time Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Birth Time</Text>
              <TouchableOpacity 
                style={[
                  styles.inputButton, 
                  { 
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.border
                  },
                  selectedTime && [
                    styles.inputButtonSelected,
                    { 
                      borderColor: themeColors.primary,
                      backgroundColor: themeColors.surface,
                      shadowColor: themeColors.primary
                    }
                  ]
                ]}
                onPress={() => {
                  if (Platform.OS === 'web' || !DateTimePicker) {
                    // For web, focus on the input field
                    return;
                  }
                  setShowTimePicker(true);
                }}
              >
                <Clock size={20} color={selectedTime ? themeColors.primary : themeColors.textSecondary} />
                <Text style={[
                  styles.inputButtonText,
                  { color: themeColors.textSecondary },
                  selectedTime && [styles.inputButtonTextSelected, { color: themeColors.text }]
                ]}>
                  {selectedTime ? formatTime(selectedTime) : 'Select your birth time'}
                </Text>
                {Platform.OS !== 'web' && DateTimePicker && (
                  <ChevronRight size={20} color={themeColors.textSecondary} />
                )}
              </TouchableOpacity>

              {renderNativeTimePicker()}
            </View>

            {/* Zodiac Sign Preview */}
            {selectedDate && (
              <View style={[styles.zodiacPreview, { 
                backgroundColor: themeColors.accentBackground,
                borderColor: themeColors.primary
              }]}>
                <Text style={[styles.zodiacPreviewLabel, { color: themeColors.text }]}>Your Zodiac Sign:</Text>
                <Text style={[styles.zodiacPreviewSign, { color: themeColors.primary }]}>
                  {getZodiacSignFromDate(selectedDate)}
                </Text>
              </View>
            )}

            {/* Info Note */}
            <View style={[styles.infoContainer, { 
              backgroundColor: themeColors.accentBackground,
              borderLeftColor: themeColors.primary
            }]}>
              <Text style={[styles.infoText, { color: themeColors.text }]}>
                💡 Don't know your exact birth time? Check your birth certificate or ask a family member. 
                The more accurate your birth time, the more precise your horoscope will be.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              (!selectedDate || !selectedTime) && styles.continueButtonDisabled,
              loading && styles.continueButtonDisabled
            ]}
            onPress={handleSaveBirthInfo}
            disabled={!selectedDate || !selectedTime || loading}
          >
            <LinearGradient
              colors={[themeColors.primary, themeColors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 20,
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
    backgroundColor: '#8A2BE2',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
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
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  inputButtonSelected: {
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  inputButtonTextSelected: {
    fontFamily: 'Inter-Medium',
  },
  webInputContainer: {
    marginTop: 12,
  },
  webInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  zodiacPreview: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  zodiacPreviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  zodiacPreviewSign: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
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
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
});
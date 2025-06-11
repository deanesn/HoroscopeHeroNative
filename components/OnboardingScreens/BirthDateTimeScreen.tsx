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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface BirthDateTimeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const BirthDateTimeScreen = ({ onNext, onBack }: BirthDateTimeScreenProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
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

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    const startYear = today.getFullYear() - 100;
    const endYear = today.getFullYear() - 13; // Minimum age 13

    // Generate all dates from most recent to oldest
    for (let year = endYear; year >= startYear; year--) {
      for (let month = 11; month >= 0; month--) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = daysInMonth; day >= 1; day--) {
          const date = new Date(year, month, day);
          if (date <= today) {
            dates.push(date);
          }
        }
      }
    }
    return dates;
  };

  const generateTimeOptions = () => {
    const times = [];
    // Generate time options in 1-minute intervals for more precision
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute++) {
        times.push({ hour, minute });
      }
    }
    return times;
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
      const birthTime = `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')}:00`;

      const { error } = await supabase
        .from('profiles')
        .update({
          birth_date: birthDate,
          birth_time: birthTime,
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

  const dateOptions = generateDateOptions();
  const timeOptions = generateTimeOptions();

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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '20%' }]} />
            </View>
            <Text style={styles.progressText}>1 of 5</Text>
          </View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, formAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>When were you born?</Text>
            <Text style={styles.subtitle}>
              Your birth date and time help us create your personalized horoscope
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Birth Date Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <TouchableOpacity 
                style={[styles.inputButton, selectedDate && styles.inputButtonSelected]}
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar size={20} color={selectedDate ? '#8A2BE2' : '#9CA3AF'} />
                <Text style={[
                  styles.inputButtonText,
                  selectedDate && styles.inputButtonTextSelected
                ]}>
                  {selectedDate ? formatDate(selectedDate) : 'Select your birth date'}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerHeaderText}>Select Birth Date</Text>
                    <TouchableOpacity 
                      style={styles.pickerCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.pickerCloseText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.picker} showsVerticalScrollIndicator={true}>
                    {dateOptions.map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          selectedDate?.getTime() === date.getTime() && styles.pickerItemSelected
                        ]}
                        onPress={() => {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedDate?.getTime() === date.getTime() && styles.pickerItemTextSelected
                        ]}>
                          {formatDate(date)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Birth Time Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Birth Time</Text>
              <TouchableOpacity 
                style={[styles.inputButton, selectedTime && styles.inputButtonSelected]}
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <Clock size={20} color={selectedTime ? '#8A2BE2' : '#9CA3AF'} />
                <Text style={[
                  styles.inputButtonText,
                  selectedTime && styles.inputButtonTextSelected
                ]}>
                  {selectedTime ? formatTime(selectedTime.hour, selectedTime.minute) : 'Select your birth time'}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {showTimePicker && (
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerHeaderText}>Select Birth Time</Text>
                    <TouchableOpacity 
                      style={styles.pickerCloseButton}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={styles.pickerCloseText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.picker} showsVerticalScrollIndicator={true}>
                    {timeOptions.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.pickerItem,
                          selectedTime?.hour === time.hour && selectedTime?.minute === time.minute && styles.pickerItemSelected
                        ]}
                        onPress={() => {
                          setSelectedTime(time);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedTime?.hour === time.hour && selectedTime?.minute === time.minute && styles.pickerItemTextSelected
                        ]}>
                          {formatTime(time.hour, time.minute)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Info Note */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
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
              colors={['#8A2BE2', '#6d28d9']}
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
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
    color: '#374151',
    marginBottom: 12,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  inputButtonSelected: {
    borderColor: '#8A2BE2',
    backgroundColor: '#FFFFFF',
    shadowColor: '#8A2BE2',
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
    color: '#9CA3AF',
  },
  inputButtonTextSelected: {
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  pickerHeaderText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  pickerCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
  },
  pickerCloseText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  picker: {
    maxHeight: 250,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  pickerItemTextSelected: {
    color: '#8A2BE2',
    fontFamily: 'Inter-Medium',
  },
  infoContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
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
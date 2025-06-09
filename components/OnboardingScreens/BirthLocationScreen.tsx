import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ChevronRight, ArrowLeft, Search } from 'lucide-react-native';
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

interface BirthLocationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Popular cities for quick selection
const popularCities = [
  { city: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { city: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { city: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
];

export const BirthLocationScreen = ({ onNext, onBack }: BirthLocationScreenProps) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [countryFocused, setCountryFocused] = useState(false);
  
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

  const handleCitySelection = (selectedCity: typeof popularCities[0]) => {
    setCity(selectedCity.city);
    setCountry(selectedCity.country);
    setShowSuggestions(false);
  };

  const handleSaveBirthLocation = async () => {
    if (!city.trim() || !country.trim()) {
      Alert.alert('Missing Information', 'Please enter both your birth city and country.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll use placeholder coordinates and timezone
      // In a production app, you would integrate with a geocoding service
      const selectedCityData = popularCities.find(
        c => c.city.toLowerCase() === city.toLowerCase() && 
             c.country.toLowerCase() === country.toLowerCase()
      );

      const latitude = selectedCityData?.lat || 0;
      const longitude = selectedCityData?.lng || 0;
      const timezone = selectedCityData?.timezone || 'UTC';

      const { error } = await supabase
        .from('profiles')
        .update({
          birth_city: city.trim(),
          birth_country: country.trim(),
          birth_latitude: latitude,
          birth_longitude: longitude,
          birth_timezone: timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onNext();
    } catch (error) {
      console.error('Error saving birth location:', error);
      Alert.alert('Error', 'Failed to save birth location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const filteredCities = popularCities.filter(cityData =>
    cityData.city.toLowerCase().includes(city.toLowerCase()) ||
    cityData.country.toLowerCase().includes(city.toLowerCase())
  );

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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>3 of 5</Text>
          </View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, formAnimatedStyle]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Where were you born?</Text>
            <Text style={styles.subtitle}>
              Your birth location helps us calculate accurate planetary positions for your chart
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Birth City Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Birth City</Text>
              <View style={[
                styles.inputWrapper,
                cityFocused && styles.inputWrapperFocused
              ]}>
                <Search size={20} color={cityFocused ? '#8A2BE2' : '#9CA3AF'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your birth city"
                  placeholderTextColor="#9CA3AF"
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    setShowSuggestions(text.length > 0);
                  }}
                  onFocus={() => {
                    setCityFocused(true);
                    setShowSuggestions(city.length > 0);
                  }}
                  onBlur={() => {
                    setCityFocused(false);
                    // Delay hiding suggestions to allow for selection
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  autoCorrect={false}
                />
              </View>

              {/* City Suggestions */}
              {showSuggestions && filteredCities.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestions} nestedScrollEnabled>
                    {filteredCities.slice(0, 5).map((cityData, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleCitySelection(cityData)}
                      >
                        <MapPin size={16} color="#8A2BE2" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionCity}>{cityData.city}</Text>
                          <Text style={styles.suggestionCountry}>{cityData.country}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Birth Country Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Birth Country</Text>
              <View style={[
                styles.inputWrapper,
                countryFocused && styles.inputWrapperFocused
              ]}>
                <MapPin size={20} color={countryFocused ? '#8A2BE2' : '#9CA3AF'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your birth country"
                  placeholderTextColor="#9CA3AF"
                  value={country}
                  onChangeText={setCountry}
                  onFocus={() => setCountryFocused(true)}
                  onBlur={() => setCountryFocused(false)}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Popular Cities Quick Select */}
            {!showSuggestions && (
              <View style={styles.popularCitiesSection}>
                <Text style={styles.popularCitiesTitle}>Popular Cities</Text>
                <View style={styles.popularCitiesGrid}>
                  {popularCities.slice(0, 6).map((cityData, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularCityButton}
                      onPress={() => handleCitySelection(cityData)}
                    >
                      <Text style={styles.popularCityText}>{cityData.city}</Text>
                      <Text style={styles.popularCountryText}>{cityData.country}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Info Note */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                🌍 We use your birth location to calculate the exact planetary positions at the time of your birth. 
                This ensures your horoscope is as accurate as possible.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              (!city.trim() || !country.trim()) && styles.continueButtonDisabled,
              loading && styles.continueButtonDisabled
            ]}
            onPress={handleSaveBirthLocation}
            disabled={!city.trim() || !country.trim() || loading}
          >
            <LinearGradient
              colors={['#8A2BE2', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF\" size="small" />
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
    position: 'relative',
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapperFocused: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
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
  suggestions: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionCity: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  suggestionCountry: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  popularCitiesSection: {
    marginBottom: 24,
  },
  popularCitiesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  popularCitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularCityButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '30%',
    alignItems: 'center',
  },
  popularCityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  popularCountryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
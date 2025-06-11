import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ChevronRight, ArrowLeft, Search, AlertCircle } from 'lucide-react-native';
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

interface LocationResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  admin1?: string; // State/Province
}

// Popular cities for quick selection
const popularCities = [
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
];

export const BirthLocationScreen = ({ onNext, onBack }: BirthLocationScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for input focus handling
  const searchInputRef = useRef<TextInput>(null);
  
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

  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const locations: LocationResult[] = data.results.map((result: any) => ({
          name: result.name,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone,
          admin1: result.admin1,
        }));
        setSearchResults(locations);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setError('Failed to search locations. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && showSuggestions) {
        searchLocation(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSuggestions]);

  const handleLocationSelection = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchQuery(`${location.name}, ${location.country}`);
    setShowSuggestions(false);
    setSearchResults([]);
    setError(null);
  };

  const handlePopularCitySelection = (city: typeof popularCities[0]) => {
    const location: LocationResult = {
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
    };
    handleLocationSelection(location);
  };

  const handleSaveBirthLocation = async () => {
    if (!selectedLocation) {
      setError('Please select a birth location');
      return;
    }

    if (!user?.id) {
      setError('User not found. Please try again.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          birth_city: selectedLocation.name,
          birth_country: selectedLocation.country,
          birth_latitude: selectedLocation.latitude,
          birth_longitude: selectedLocation.longitude,
          birth_timezone: selectedLocation.timezone || 'UTC',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onNext();
    } catch (error) {
      console.error('Error saving birth location:', error);
      setError('Failed to save birth location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
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
              Your birth location helps us calculate accurate planetary positions for your astrological chart
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Location Search Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Search for your birth city</Text>
              <TouchableOpacity 
                style={[
                  styles.inputWrapper,
                  searchFocused && styles.inputWrapperFocused
                ]}
                activeOpacity={1}
                onPress={() => searchInputRef.current?.focus()}
              >
                <Search size={20} color={searchFocused ? '#8A2BE2' : '#9CA3AF'} style={styles.inputIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={styles.input}
                  placeholder="Enter city name (e.g., New York, London)"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setShowSuggestions(text.length > 0);
                    if (text.length === 0) {
                      setSelectedLocation(null);
                      setError(null);
                    }
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    setShowSuggestions(searchQuery.length > 0);
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    // Delay hiding suggestions to allow for selection
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
                {loading && (
                  <ActivityIndicator size="small" color="#8A2BE2" style={styles.loadingIcon} />
                )}
              </TouchableOpacity>

              {/* Search Results */}
              {showSuggestions && searchResults.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={styles.suggestions} nestedScrollEnabled>
                    {searchResults.map((location, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleLocationSelection(location)}
                      >
                        <MapPin size={16} color="#8A2BE2" />
                        <View style={styles.suggestionText}>
                          <Text style={styles.suggestionCity}>
                            {location.name}
                            {location.admin1 && `, ${location.admin1}`}
                          </Text>
                          <Text style={styles.suggestionCountry}>{location.country}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* No Results Message */}
              {showSuggestions && searchQuery.length > 2 && searchResults.length === 0 && !loading && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    No locations found. Try a different search term.
                  </Text>
                </View>
              )}
            </View>

            {/* Selected Location Display */}
            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
                <View style={styles.selectedLocationCard}>
                  <MapPin size={20} color="#22C55E" />
                  <View style={styles.selectedLocationText}>
                    <Text style={styles.selectedLocationName}>
                      {selectedLocation.name}
                      {selectedLocation.admin1 && `, ${selectedLocation.admin1}`}
                    </Text>
                    <Text style={styles.selectedLocationCountry}>{selectedLocation.country}</Text>
                    <Text style={styles.selectedLocationCoords}>
                      {selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}°
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Popular Cities Quick Select */}
            {!showSuggestions && !selectedLocation && (
              <View style={styles.popularCitiesSection}>
                <Text style={styles.popularCitiesTitle}>Popular Cities</Text>
                <View style={styles.popularCitiesGrid}>
                  {popularCities.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.popularCityButton}
                      onPress={() => handlePopularCitySelection(city)}
                    >
                      <Text style={styles.popularCityText}>{city.name}</Text>
                      <Text style={styles.popularCountryText}>{city.country}</Text>
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
              !selectedLocation && styles.continueButtonDisabled,
              saving && styles.continueButtonDisabled
            ]}
            onPress={handleSaveBirthLocation}
            disabled={!selectedLocation || saving}
          >
            <LinearGradient
              colors={['#8A2BE2', '#6d28d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              {saving ? (
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    flex: 1,
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
  loadingIcon: {
    marginLeft: 8,
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
  noResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedLocationContainer: {
    marginBottom: 24,
  },
  selectedLocationLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22C55E',
    gap: 12,
  },
  selectedLocationText: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  selectedLocationCountry: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  selectedLocationCoords: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#22C55E',
    marginTop: 4,
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
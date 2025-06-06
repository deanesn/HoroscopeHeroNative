import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Share2, Printer, RefreshCw, Star, Heart, TriangleAlert as AlertTriangle, Users } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTheme, colors } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame as Aries, Mountain as Taurus, Users as Gemini, Moon as Cancer, Sun as Leo, Wheat as Virgo, Scale as Libra, Bug as Scorpio, Target as Sagittarius, Mountain as Capricorn, Waves as Aquarius, Fish as Pisces } from 'lucide-react-native';
import { zodiacDetails } from './data';

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

export default function ZodiacSignScreen() {
  const { sign } = useLocalSearchParams();
  const [horoscope, setHoroscope] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const themeColors = colors[theme];
  
  const signName = typeof sign === 'string' ? sign.toLowerCase() : '';
  const details = zodiacDetails[signName];

  useEffect(() => {
    if (details) {
      fetchHoroscope();
    }
  }, [sign, details]);

  const fetchHoroscope = async () => {
    if (!details) return;
    
    try {
      setLoading(true);
      const today = getUTCYYYYMMDD();
      
      const { data, error } = await supabase
        .from('horoscopes')
        .select('content')
        .eq('zodiac_sign', details.name)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      setHoroscope(data?.content || null);
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      setHoroscope(null);
    } finally {
      setLoading(false);
    }
  };

  if (!details) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.errorText, { color: themeColors.error }]}>Zodiac sign not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {getZodiacIcon(details.name, 48, '#FFFFFF')}
        <Text style={styles.title}>{details.name}</Text>
        <Text style={styles.dates}>{details.dates}</Text>
      </LinearGradient>

      <View style={[styles.infoCard, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Element:</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{details.element}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Modality:</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{details.modality}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Ruling Planet:</Text>
          <Text style={[styles.value, { color: themeColors.text }]}>{details.rulingPlanet}</Text>
        </View>
      </View>

      <View style={[styles.section, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>About {details.name}</Text>
        <Text style={[styles.aboutText, { color: themeColors.textSecondary }]}>{details.about}</Text>
      </View>

      <View style={[styles.horoscopeCard, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={styles.horoscopeHeader}>
          <Text style={[styles.horoscopeTitle, { color: themeColors.text }]}>Today's Horoscope</Text>
          <View style={styles.horoscopeActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Printer size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={fetchHoroscope}>
              <RefreshCw size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.primary} />
        ) : (
          <Text style={[styles.horoscopeText, { color: themeColors.textSecondary }]}>
            {horoscope || 'No horoscope available for today'}
          </Text>
        )}
      </View>

      <View style={[styles.section, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={styles.sectionHeader}>
          <Star size={20} color={themeColors.success} />
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Positive Traits</Text>
        </View>
        <View style={styles.traitsContainer}>
          {details.positiveTraits.map((trait, index) => (
            <View key={index} style={[styles.traitTag, { backgroundColor: themeColors.successBackground }]}>
              <Text style={[styles.traitText, { color: themeColors.success }]}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color={themeColors.error} />
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Areas to Watch</Text>
        </View>
        <View style={styles.traitsContainer}>
          {details.areasToWatch.map((trait, index) => (
            <View key={index} style={[styles.traitTag, styles.warningTag, { backgroundColor: themeColors.errorBackground }]}>
              <Text style={[styles.traitText, styles.warningText, { color: themeColors.error }]}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={styles.sectionHeader}>
          <Heart size={20} color={themeColors.primary} />
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Best Matches</Text>
        </View>
        <View style={styles.matchesContainer}>
          {details.bestMatches.map((match, index) => (
            <View key={index} style={[styles.matchCard, { backgroundColor: themeColors.accentBackground }]}>
              <Text style={[styles.matchText, { color: themeColors.primary }]}>{match}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { 
        backgroundColor: themeColors.surface,
        shadowColor: themeColors.shadowColor
      }]}>
        <View style={styles.sectionHeader}>
          <Users size={20} color={themeColors.primary} />
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Famous {details.name} People</Text>
        </View>
        <View style={styles.famousPeopleContainer}>
          {details.famousPeople.map((person, index) => (
            <View key={index} style={[styles.personCard, { backgroundColor: themeColors.border }]}>
              <Text style={[styles.personName, { color: themeColors.text }]}>{person}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dates: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  horoscopeCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 16,
  },
  horoscopeTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  horoscopeActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  horoscopeText: {
    fontSize: 16,
    lineHeight: 24,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  traitTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  traitText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningTag: {
    backgroundColor: '#FEF2F2',
  },
  warningText: {
    color: '#EF4444',
  },
  matchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  matchCard: {
    padding: 12,
    borderRadius: 8,
    margin: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  famousPeopleContainer: {
    marginTop: 8,
  },
  personCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
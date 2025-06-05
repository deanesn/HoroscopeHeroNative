import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header } from '@/components/shared/Header';
import { useTheme, colors } from '@/context/ThemeContext';
import { Heart, ArrowRight, X } from 'lucide-react-native';
import { Flame as Aries, Mountain as Taurus, Users as Gemini, Moon as Cancer, Sun as Leo, Wheat as Virgo, Scale as Libra, Bug as Scorpio, Target as Sagittarius, Mountain as Capricorn, Waves as Aquarius, Fish as Pisces } from 'lucide-react-native';

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

const zodiacSigns = [
  { name: 'Aries', dates: 'Mar 21 - Apr 19', color: '#FF6B6B' },
  { name: 'Taurus', dates: 'Apr 20 - May 20', color: '#4CAF50' },
  { name: 'Gemini', dates: 'May 21 - Jun 20', color: '#FFD700' },
  { name: 'Cancer', dates: 'Jun 21 - Jul 22', color: '#00BCD4' },
  { name: 'Leo', dates: 'Jul 23 - Aug 22', color: '#FFA726' },
  { name: 'Virgo', dates: 'Aug 23 - Sep 22', color: '#8BC34A' },
  { name: 'Libra', dates: 'Sep 23 - Oct 22', color: '#9C27B0' },
  { name: 'Scorpio', dates: 'Oct 23 - Nov 21', color: '#7E57C2' },
  { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', color: '#FF5722' },
  { name: 'Capricorn', dates: 'Dec 22 - Jan 19', color: '#795548' },
  { name: 'Aquarius', dates: 'Jan 20 - Feb 18', color: '#2196F3' },
  { name: 'Pisces', dates: 'Feb 19 - Mar 20', color: '#3F51B5' },
];

const getCompatibilityScore = (sign1: string, sign2: string) => {
  const elements = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };

  const qualities = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
  };

  let score = 0;
  
  if (elements[sign1] === elements[sign2]) score += 40;
  else if (
    (elements[sign1] === 'Fire' && elements[sign2] === 'Air') ||
    (elements[sign1] === 'Air' && elements[sign2] === 'Fire') ||
    (elements[sign1] === 'Earth' && elements[sign2] === 'Water') ||
    (elements[sign1] === 'Water' && elements[sign2] === 'Earth')
  ) score += 30;
  else score += 15;

  if (qualities[sign1] === qualities[sign2]) score += 20;
  else score += 30;

  score += Math.floor(Math.random() * 20);

  return Math.min(Math.max(score, 40), 100);
};

export default function MatchScreen() {
  const [selectedSign1, setSelectedSign1] = useState(null);
  const [selectedSign2, setSelectedSign2] = useState(null);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const handleViewCompatibility = async () => {
    if (selectedSign1 && selectedSign2) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCompatibility(true);
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedSign1(null);
    setSelectedSign2(null);
    setShowCompatibility(false);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.primary }]}>
          Calculating Compatibility...
        </Text>
      </View>
    );
  }

  if (showCompatibility && selectedSign1 && selectedSign2) {
    const compatibilityScore = getCompatibilityScore(selectedSign1.name, selectedSign2.name);
    
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header title="Compatibility Results" leftAction={resetSelection} leftIcon={X} />
        <ScrollView style={styles.content}>
          <View style={[styles.compatibilityContainer, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.signPairContainer}>
              <View style={[styles.signBadge, { backgroundColor: selectedSign1.color }]}>
                {getZodiacIcon(selectedSign1.name, 24, '#FFFFFF')}
                <Text style={styles.signBadgeText}>{selectedSign1.name}</Text>
              </View>
              <Heart size={24} color="#E879F9" style={styles.heartIcon} />
              <View style={[styles.signBadge, { backgroundColor: selectedSign2.color }]}>
                {getZodiacIcon(selectedSign2.name, 24, '#FFFFFF')}
                <Text style={styles.signBadgeText}>{selectedSign2.name}</Text>
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel, { color: themeColors.textSecondary }]}>
                Compatibility Score
              </Text>
              <Text style={[styles.scoreValue, { color: themeColors.primary }]}>
                {compatibilityScore}%
              </Text>
              <View style={[styles.scoreBar, { backgroundColor: themeColors.border }]}>
                <View 
                  style={[
                    styles.scoreProgress, 
                    { 
                      width: `${compatibilityScore}%`,
                      backgroundColor: themeColors.primary 
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={[styles.compatibilityDetails, { backgroundColor: themeColors.cardBackground }]}>
              <Text style={[styles.detailsTitle, { color: themeColors.text }]}>
                Relationship Dynamics
              </Text>
              <Text style={[styles.detailsText, { color: themeColors.textSecondary }]}>
                {selectedSign1.name} and {selectedSign2.name} create a{' '}
                {compatibilityScore >= 80 ? 'powerful' : compatibilityScore >= 60 ? 'balanced' : 'challenging'} 
                {' '}connection. This pairing brings together unique qualities that can{' '}
                {compatibilityScore >= 70 ? 'complement' : 'challenge'} each other.
              </Text>

              <Text style={[styles.detailsTitle, { color: themeColors.text }]}>Strengths</Text>
              <Text style={[styles.detailsText, { color: themeColors.textSecondary }]}>
                • Mutual understanding and respect{'\n'}
                • Complementary communication styles{'\n'}
                • Shared goals and aspirations
              </Text>

              <Text style={[styles.detailsTitle, { color: themeColors.text }]}>Areas for Growth</Text>
              <Text style={[styles.detailsText, { color: themeColors.textSecondary }]}>
                • Managing different emotional needs{'\n'}
                • Balancing independence and togetherness{'\n'}
                • Developing patience and understanding
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, { backgroundColor: themeColors.primary }]} 
              onPress={resetSelection}
            >
              <Text style={styles.resetButtonText}>Try Another Match</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header 
        title="Zodiac Match" 
        subtitle="Find your cosmic connection"
      />
      <ScrollView style={styles.content}>
        <View style={styles.matchContainer}>
          <View style={styles.selectionContainer}>
            <Text style={[styles.selectionTitle, { color: themeColors.text }]}>Select First Sign</Text>
            <View style={styles.signGrid}>
              {zodiacSigns.map((sign) => (
                <TouchableOpacity
                  key={sign.name}
                  style={[
                    styles.signCard,
                    { backgroundColor: themeColors.cardBackground },
                    selectedSign1?.name === sign.name && [
                      styles.selectedCard,
                      { backgroundColor: themeColors.primary }
                    ],
                  ]}
                  onPress={() => setSelectedSign1(sign)}
                >
                  {getZodiacIcon(
                    sign.name, 
                    24, 
                    selectedSign1?.name === sign.name ? '#FFFFFF' : sign.color
                  )}
                  <Text style={[
                    styles.signName,
                    { color: themeColors.text },
                    selectedSign1?.name === sign.name && styles.selectedText
                  ]}>
                    {sign.name}
                  </Text>
                  <Text style={[
                    styles.signDates,
                    { color: themeColors.textSecondary },
                    selectedSign1?.name === sign.name && styles.selectedText
                  ]}>
                    {sign.dates}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider}>
            <Heart size={32} color="#E879F9" />
          </View>

          <View style={styles.selectionContainer}>
            <Text style={[styles.selectionTitle, { color: themeColors.text }]}>Select Second Sign</Text>
            <View style={styles.signGrid}>
              {zodiacSigns.map((sign) => (
                <TouchableOpacity
                  key={sign.name}
                  style={[
                    styles.signCard,
                    { backgroundColor: themeColors.cardBackground },
                    selectedSign2?.name === sign.name && [
                      styles.selectedCard,
                      { backgroundColor: themeColors.primary }
                    ],
                  ]}
                  onPress={() => setSelectedSign2(sign)}
                >
                  {getZodiacIcon(
                    sign.name, 
                    24, 
                    selectedSign2?.name === sign.name ? '#FFFFFF' : sign.color
                  )}
                  <Text style={[
                    styles.signName,
                    { color: themeColors.text },
                    selectedSign2?.name === sign.name && styles.selectedText
                  ]}>
                    {sign.name}
                  </Text>
                  <Text style={[
                    styles.signDates,
                    { color: themeColors.textSecondary },
                    selectedSign2?.name === sign.name && styles.selectedText
                  ]}>
                    {sign.dates}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.matchButton,
              { backgroundColor: themeColors.primary },
              (!selectedSign1 || !selectedSign2) && [
                styles.matchButtonDisabled,
                { backgroundColor: themeColors.border }
              ]
            ]}
            disabled={!selectedSign1 || !selectedSign2}
            onPress={handleViewCompatibility}
          >
            <Text style={styles.matchButtonText}>View Compatibility</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  matchContainer: {
    padding: 16,
  },
  selectionContainer: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  signGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  signCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#7E22CE',
  },
  signName: {
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Inter-SemiBold',
  },
  signDates: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 24,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  matchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
  },
  compatibilityContainer: {
    padding: 16,
    borderRadius: 16,
  },
  signPairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  heartIcon: {
    marginHorizontal: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  scoreValue: {
    fontSize: 48,
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  scoreBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  compatibilityDetails: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/shared/Header';
import { useTheme, colors } from '@/context/ThemeContext';
import { Flame as Aries, Mountain as Taurus, Users as Gemini, Moon as Cancer, Sun as Leo, Wheat as Virgo, Scale as Libra, Bug as Scorpio, Target as Sagittarius, Mountain as Capricorn, Waves as Aquarius, Fish as Pisces } from 'lucide-react-native';
import { zodiacSigns } from './data';

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

export default function ZodiacScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header 
        title="Zodiac Signs" 
        subtitle="Explore the characteristics of each zodiac sign"
      />
      <ScrollView style={styles.content}>
        {zodiacSigns.map((sign) => (
          <TouchableOpacity
            key={sign.name}
            style={[
              styles.signCard, 
              { 
                backgroundColor: themeColors.cardBackground,
                borderLeftColor: sign.color,
                shadowColor: themeColors.shadowColor,
              }
            ]}
            onPress={() => router.push(`/zodiac/${sign.name.toLowerCase()}`)}
          >
            <View style={styles.signHeader}>
              <View style={styles.signTitleContainer}>
                {getZodiacIcon(sign.name, 32, sign.color)}
                <View style={styles.signTitleText}>
                  <Text style={[styles.signName, { color: themeColors.text }]}>{sign.name}</Text>
                  <Text style={[styles.signDates, { color: themeColors.textSecondary }]}>{sign.dates}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.signDetails, { backgroundColor: themeColors.border }]}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Element:</Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>{sign.element}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Modality:</Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>{sign.modality}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Ruling Planet:</Text>
                <Text style={[styles.detailValue, { color: themeColors.text }]}>{sign.rulingPlanet}</Text>
              </View>
            </View>
            <Text style={[styles.signDescription, { color: themeColors.textSecondary }]}>{sign.description}</Text>
          </TouchableOpacity>
        ))}
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
  signCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  signHeader: {
    marginBottom: 12,
  },
  signTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signTitleText: {
    marginLeft: 12,
  },
  signName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  signDates: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  signDetails: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontFamily: 'Inter-SemiBold',
  },
  signDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});
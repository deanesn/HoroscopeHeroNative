import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Header } from '@/components/shared/Header';
import { useTheme, colors } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { Planet, RetrogradeDetail } from '@/lib/supabase';
import { Calendar, Clock, MapPin, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlanetsScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [retrogrades, setRetrogrades] = useState<RetrogradeDetail[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanets();
    fetchRetrogrades();
  }, []);

  useEffect(() => {
    fetchRetrogrades();
  }, [selectedPlanet]);

  const fetchPlanets = async () => {
    try {
      const { data, error } = await supabase
        .from('planets')
        .select('*')
        .order('id');

      if (error) throw error;
      setPlanets(data || []);
    } catch (error) {
      console.error('Error fetching planets:', error);
    }
  };

  const fetchRetrogrades = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('retrograde_details')
        .select('*')
        .order('retrograde_start_date', { ascending: true });

      if (selectedPlanet) {
        query = query.eq('planet_name', selectedPlanet);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRetrogrades(data || []);
    } catch (error) {
      console.error('Error fetching retrogrades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCurrentlyRetrograde = (retrograde: RetrogradeDetail) => {
    const now = new Date();
    const startDate = new Date(retrograde.retrograde_start_date);
    const endDate = new Date(retrograde.retrograde_end_date);
    return now >= startDate && now <= endDate;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.gradientStart, themeColors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Header 
          title="Planets" 
          subtitle="Explore planetary movements and retrogrades"
        />
        
        <View style={[styles.filterButtonsContainer, { backgroundColor: themeColors.border }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedPlanet && [
                  styles.selectedFilterButton,
                  { backgroundColor: themeColors.surface }
                ],
                !selectedPlanet || { backgroundColor: 'transparent' }
              ]}
              onPress={() => setSelectedPlanet(null)}
            >
              <Text style={[
                styles.filterButtonText, 
                { color: !selectedPlanet ? themeColors.primary : themeColors.textSecondary }
              ]}>
                All Planets
              </Text>
            </TouchableOpacity>
            {planets.map((planet) => (
              <TouchableOpacity
                key={planet.id}
                style={[
                  styles.filterButton,
                  selectedPlanet === planet.name && [
                    styles.selectedFilterButton,
                    { backgroundColor: themeColors.surface }
                  ],
                  selectedPlanet === planet.name || { backgroundColor: 'transparent' }
                ]}
                onPress={() => setSelectedPlanet(planet.name)}
              >
                <Text style={[
                  styles.filterButtonText, 
                  { color: selectedPlanet === planet.name ? themeColors.primary : themeColors.textSecondary }
                ]}>
                  {planet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {retrogrades.map((retrograde) => {
            const isRetrograde = isCurrentlyRetrograde(retrograde);
            return (
              <View
                key={retrograde.id}
                style={[
                  styles.retrogradeCard,
                  { 
                    backgroundColor: themeColors.surface,
                  },
                ]}
              >
                {isRetrograde && (
                  <LinearGradient
                    colors={[themeColors.gradientStart, themeColors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeIndicator}
                  />
                )}
                
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.planetName, { color: themeColors.text }]}>
                      {retrograde.planet_name}
                    </Text>
                    {retrograde.duration_days && (
                      <Text style={[styles.duration, { color: themeColors.textSecondary }]}>
                        {retrograde.duration_days} days
                      </Text>
                    )}
                  </View>
                  {isRetrograde && (
                    <View style={[styles.activeTag, { backgroundColor: themeColors.primary }]}>
                      <Text style={styles.activeTagText}>Active</Text>
                    </View>
                  )}
                </View>

                <View style={styles.dateSection}>
                  <View style={styles.dateRow}>
                    <Calendar size={16} color={themeColors.primary} />
                    <Text style={[styles.dateLabel, { color: themeColors.textSecondary }]}>
                      Retrograde Period
                    </Text>
                  </View>
                  <Text style={[styles.dateText, { color: themeColors.text }]}>
                    {formatDate(retrograde.retrograde_start_date)} - {formatDate(retrograde.retrograde_end_date)}
                  </Text>
                </View>

                {(retrograde.pre_shadow_start_date || retrograde.post_shadow_end_date) && (
                  <View style={[styles.shadowPeriod, { backgroundColor: themeColors.accentBackground }]}>
                    <AlertTriangle size={16} color={themeColors.primary} />
                    <View style={styles.shadowDates}>
                      {retrograde.pre_shadow_start_date && (
                        <Text style={[styles.shadowText, { color: themeColors.text }]}>
                          Pre-Shadow: {formatDate(retrograde.pre_shadow_start_date)}
                        </Text>
                      )}
                      {retrograde.post_shadow_end_date && (
                        <Text style={[styles.shadowText, { color: themeColors.text }]}>
                          Post-Shadow: {formatDate(retrograde.post_shadow_end_date)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.detailsContainer}>
                  {retrograde.start_zodiac_sign && (
                    <View style={styles.detailRow}>
                      <MapPin size={16} color={themeColors.primary} />
                      <Text style={[styles.detailText, { color: themeColors.text }]}>
                        Starts in {retrograde.start_zodiac_sign} at {retrograde.retrograde_start_degree}°
                      </Text>
                    </View>
                  )}
                  {retrograde.end_zodiac_sign && (
                    <View style={styles.detailRow}>
                      <MapPin size={16} color={themeColors.primary} />
                      <Text style={[styles.detailText, { color: themeColors.text }]}>
                        Ends in {retrograde.end_zodiac_sign} at {retrograde.retrograde_end_degree}°
                      </Text>
                    </View>
                  )}
                  {retrograde.station_retrograde_date && (
                    <View style={styles.detailRow}>
                      <Clock size={16} color={themeColors.primary} />
                      <Text style={[styles.detailText, { color: themeColors.text }]}>
                        Stations Retrograde: {formatDate(retrograde.station_retrograde_date)}
                      </Text>
                    </View>
                  )}
                  {retrograde.station_direct_date && (
                    <View style={styles.detailRow}>
                      <Clock size={16} color={themeColors.primary} />
                      <Text style={[styles.detailText, { color: themeColors.text }]}>
                        Stations Direct: {formatDate(retrograde.station_direct_date)}
                      </Text>
                    </View>
                  )}
                </View>

                {retrograde.notes && (
                  <Text style={[styles.notes, { color: themeColors.textSecondary }]}>
                    {retrograde.notes}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  filterContent: {
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedFilterButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  retrogradeCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planetName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  activeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  dateSection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 24,
  },
  shadowPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  shadowDates: {
    flex: 1,
  },
  shadowText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  notes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
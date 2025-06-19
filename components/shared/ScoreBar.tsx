import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing
} from 'react-native-reanimated';

interface ScoreBarProps {
  score: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export const ScoreBar = ({ score, label, icon, color, delay = 0 }: ScoreBarProps) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  
  // Animation values
  const progressWidth = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate the progress bar (score is already 0-100, so use it directly for percentage)
    progressWidth.value = withDelay(
      delay,
      withTiming(score, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Animate the score text
    scoreOpacity.value = withDelay(
      delay + 600,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      })
    );
  }, [score, delay]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header with icon and score */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
          <Text style={[styles.scoreValue, { color: themeColors.text }]}>
            {score}
          </Text>
          <Text style={[styles.scoreMax, { color: themeColors.textSecondary }]}>
            /100
          </Text>
        </Animated.View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: themeColors.border }]}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { backgroundColor: color },
              progressAnimatedStyle
            ]} 
          />
        </View>
      </View>

      {/* Label */}
      <Text style={[styles.label, { color: themeColors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  scoreMax: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 2,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
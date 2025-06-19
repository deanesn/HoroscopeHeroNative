import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme, colors } from '@/context/ThemeContext';
import { Bell, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface NotificationBannerProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss: () => void;
  onPress?: () => void;
}

export const NotificationBanner = ({
  visible,
  title,
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
  onPress,
}: NotificationBannerProps) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  
  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });

      // Auto dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideBanner();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [visible, duration]);

  const hideBanner = () => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    });
    opacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.quad),
    }, () => {
      runOnJS(onDismiss)();
    });
  };

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: '#10B981',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'warning':
        return {
          background: '#F59E0B',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      case 'error':
        return {
          background: '#EF4444',
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
      default:
        return {
          background: themeColors.primary,
          text: '#FFFFFF',
          icon: '#FFFFFF',
        };
    }
  };

  const typeColors = getTypeColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: typeColors.background },
        animatedStyle
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={styles.iconContainer}>
          <Bell size={20} color={typeColors.icon} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: typeColors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.message, { color: typeColors.text }]} numberOfLines={2}>
            {message}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={hideBanner}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={typeColors.icon} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});
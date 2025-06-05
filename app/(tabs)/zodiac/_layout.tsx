import { Stack } from 'expo-router';
import { useTheme, colors } from '@/context/ThemeContext';

export default function ZodiacLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        contentStyle: {
          backgroundColor: themeColors.background
        },
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          presentation: 'card',
          animation: 'default'
        }}
      />
      <Stack.Screen 
        name="[sign]"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
    </Stack>
  );
}
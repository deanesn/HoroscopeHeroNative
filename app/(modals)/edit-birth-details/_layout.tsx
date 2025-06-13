import { Stack } from 'expo-router';
import { useTheme, colors } from '@/context/ThemeContext';

export default function EditBirthDetailsLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: themeColors.background
        },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="date-time"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="location"
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
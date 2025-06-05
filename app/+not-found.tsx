import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, colors } from '@/context/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.text, { color: themeColors.text }]}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={{ color: themeColors.primary }}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
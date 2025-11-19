
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { CovoiturageProvider } from '@/contexts/CovoiturageContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ProfileProvider>
      <CovoiturageProvider>
        <WidgetProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="wallet" options={{ headerShown: false }} />
            <Stack.Screen name="covoiturage/publish-ride" options={{ headerShown: false }} />
            <Stack.Screen name="covoiturage/my-rides" options={{ headerShown: false }} />
            <Stack.Screen name="covoiturage/search-ride" options={{ headerShown: false }} />
            <Stack.Screen name="covoiturage/search-results" options={{ headerShown: false }} />
            <Stack.Screen name="covoiturage/my-reservations" options={{ headerShown: false }} />
          </Stack>
        </WidgetProvider>
      </CovoiturageProvider>
    </ProfileProvider>
  );
}

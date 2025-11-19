
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { CovoiturageProvider } from '@/contexts/CovoiturageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <WidgetProvider>
      <ProfileProvider>
        <NotificationProvider>
          <CovoiturageProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="wallet" />
              <Stack.Screen name="covoiturage/publish-ride" />
              <Stack.Screen name="covoiturage/search-ride" />
              <Stack.Screen name="covoiturage/search-results" />
              <Stack.Screen name="covoiturage/my-rides" />
              <Stack.Screen name="covoiturage/my-reservations" />
            </Stack>
          </CovoiturageProvider>
        </NotificationProvider>
      </ProfileProvider>
    </WidgetProvider>
  );
}

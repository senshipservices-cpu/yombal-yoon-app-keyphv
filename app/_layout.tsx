
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ColisProvider } from '@/contexts/ColisContext';
import { CovoiturageProvider } from '@/contexts/CovoiturageContext';
import { LivraisonProvider } from '@/contexts/LivraisonContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OTPProvider } from '@/contexts/OTPContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <ProfileProvider>
          <OTPProvider>
            <ColisProvider>
              <CovoiturageProvider>
                <LivraisonProvider>
                  <DeliveryProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="onboarding" />
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="colis/my-parcels" />
                      <Stack.Screen name="colis/track-parcel" />
                      <Stack.Screen name="covoiturage/publish-ride" />
                      <Stack.Screen name="covoiturage/search-ride" />
                      <Stack.Screen name="covoiturage/search-results" />
                      <Stack.Screen name="covoiturage/my-rides" />
                      <Stack.Screen name="covoiturage/my-reservations" />
                      <Stack.Screen name="delivery/pending-assignments" />
                      <Stack.Screen name="delivery/active-delivery" />
                      <Stack.Screen name="wallet" />
                      <Stack.Screen name="notifications" />
                      <Stack.Screen name="feedback" />
                    </Stack>
                  </DeliveryProvider>
                </LivraisonProvider>
              </CovoiturageProvider>
            </ColisProvider>
          </OTPProvider>
        </ProfileProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

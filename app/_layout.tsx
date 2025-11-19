
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { CovoiturageProvider } from '@/contexts/CovoiturageContext';
import { ColisProvider } from '@/contexts/ColisContext';
import { LivraisonProvider } from '@/contexts/LivraisonContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/styles/commonStyles';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('onboardingDone');
      const isDone = onboardingStatus === 'true';
      console.log('Onboarding status:', isDone);
      setIsOnboardingDone(isDone);
      
      // Hide splash screen after checking status
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingDone(false);
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    if (isOnboardingDone === null) {
      // Still loading
      return;
    }

    const inOnboarding = segments[0] === 'onboarding';

    if (!isOnboardingDone && !inOnboarding) {
      // User hasn't completed onboarding, redirect to onboarding
      console.log('Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (isOnboardingDone && inOnboarding) {
      // User has completed onboarding but is on onboarding screen, redirect to home
      console.log('Redirecting to home');
      router.replace('/(tabs)/(home)/');
    }
  }, [isOnboardingDone, segments, router]);

  // Show loading screen while checking onboarding status
  if (isOnboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="covoiturage/publish-ride" />
      <Stack.Screen name="covoiturage/search-ride" />
      <Stack.Screen name="covoiturage/search-results" />
      <Stack.Screen name="covoiturage/my-rides" />
      <Stack.Screen name="covoiturage/my-reservations" />
      <Stack.Screen name="colis/track-parcel" />
      <Stack.Screen name="colis/my-parcels" />
      <Stack.Screen name="delivery/pending-assignments" />
      <Stack.Screen name="delivery/active-delivery" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <WidgetProvider>
      <ProfileProvider>
        <NotificationProvider>
          <DeliveryProvider>
            <CovoiturageProvider>
              <ColisProvider>
                <LivraisonProvider>
                  <RootLayoutNav />
                </LivraisonProvider>
              </ColisProvider>
            </CovoiturageProvider>
          </DeliveryProvider>
        </NotificationProvider>
      </ProfileProvider>
    </WidgetProvider>
  );
}

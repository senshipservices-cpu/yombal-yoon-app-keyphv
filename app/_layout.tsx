
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ColisProvider } from '@/contexts/ColisContext';
import { CovoiturageProvider } from '@/contexts/CovoiturageContext';
import { LivraisonProvider } from '@/contexts/LivraisonContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { OTPProvider } from '@/contexts/OTPContext';
import * as Network from 'expo-network';
import { initializeNotificationHandlers } from '@/utils/notificationSetup';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.log('SplashScreen.preventAutoHideAsync error:', error);
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [networkError, setNetworkError] = useState(false);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Load fonts with error handling - simplified to just SpaceMono Regular
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Handle font loading errors gracefully
  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
      console.warn('⚠️ Continuing with system fonts as fallback');
      // Mark app as ready even if fonts fail - we'll use system fonts
      setAppReady(true);
    } else if (fontsLoaded) {
      console.log('✅ Fonts loaded successfully');
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Initialize notification system on app start
  useEffect(() => {
    console.log('🚀 Initializing notification system...');
    initializeNotificationHandlers();
    console.log('✅ Notification system initialized');
  }, []);

  // Check network connectivity
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        console.log('Network state:', networkState);
        
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          setNetworkError(true);
        } else {
          setNetworkError(false);
        }
      } catch (error) {
        console.log('Network check error:', error);
        // Don't block the app if network check fails
        setNetworkError(false);
      } finally {
        setIsCheckingNetwork(false);
      }
    };

    checkNetwork();
  }, []);

  // Hide splash screen when everything is ready
  useEffect(() => {
    if (appReady && !isCheckingNetwork) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden');
        } catch (err) {
          console.log('Error hiding splash screen:', err);
        }
      };
      // Small delay to ensure smooth transition
      setTimeout(hideSplash, 100);
    }
  }, [appReady, isCheckingNetwork]);

  // Show loading state while fonts are loading or network is being checked
  if (!appReady || isCheckingNetwork) {
    return null;
  }

  // Show network error if no connection
  if (networkError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Problème de connexion</Text>
        <Text style={styles.errorMessage}>
          Veuillez vérifier votre connexion Internet et réessayer.
        </Text>
        <ActivityIndicator size="large" color="#008000" style={styles.loader} />
      </View>
    );
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
                      <Stack.Screen name="test-visual-consistency" />
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

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loader: {
    marginTop: 20,
  },
});

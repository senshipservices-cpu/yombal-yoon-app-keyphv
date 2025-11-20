
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  title: string;
  text: string;
  icon: { ios: string; android: string };
  color: string;
}

const slides: Slide[] = [
  {
    title: 'Covoiturage Yombal Yoon',
    text: 'Partagez vos trajets au Sénégal et économisez sur vos déplacements.',
    icon: { ios: 'car.fill', android: 'directions-car' },
    color: '#FF8C00',
  },
  {
    title: 'Envoi de colis',
    text: 'Envoyez vos colis dans Dakar avec des livreurs de confiance.',
    icon: { ios: 'shippingbox.fill', android: 'local-shipping' },
    color: colors.accent,
  },
  {
    title: 'Livraison 14 régions',
    text: 'Préparez vos envois vers toutes les régions du Sénégal.',
    icon: { ios: 'bolt.fill', android: 'flash-on' },
    color: colors.secondary,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
    console.log('Current slide:', slideIndex);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentSlide(index);
    console.log('Navigating to slide:', index);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
      console.log('Moving to next slide:', currentSlide + 1);
    } else {
      console.log('Already on last slide, finishing onboarding');
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('onboardingDone', 'true');
      console.log('Onboarding completed, navigating to home');
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🇸🇳</Text>
          <Text style={styles.logoText}>Yombal Yoon</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.slideContent}>
              <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
                <IconSymbol
                  ios_icon_name={slide.icon.ios}
                  android_material_icon_name={slide.icon.android}
                  size={80}
                  color={slide.color}
                />
              </View>

              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideText}>{slide.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={`pagination-dot-${index}`}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.paginationDot,
                  currentSlide === index && styles.paginationDotActive,
                  { backgroundColor: currentSlide === index ? colors.primary : colors.border },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleFinish}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Passer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
              </Text>
              <IconSymbol
                ios_icon_name={currentSlide === slides.length - 1 ? 'arrow.right' : 'chevron.right'}
                android_material_icon_name={currentSlide === slides.length - 1 ? 'arrow-forward' : 'chevron-right'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    maxWidth: 500,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paginationDotActive: {
    width: 24,
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

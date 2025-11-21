
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
import { useProfile } from '@/contexts/ProfileContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

type UserMainRole = 'Conducteur' | 'Passager' | 'Envoyeur de colis' | 'Livreur' | null;

const roleOptions = [
  {
    id: 'Conducteur',
    label: 'Conducteur',
    icon: { ios: 'car.fill', android: 'directions-car' },
    color: colors.primary,
  },
  {
    id: 'Passager',
    label: 'Passager',
    icon: { ios: 'person.2.fill', android: 'people' },
    color: '#FF8C00',
  },
  {
    id: 'Envoyeur de colis',
    label: 'Envoyeur de colis',
    icon: { ios: 'shippingbox.fill', android: 'local-shipping' },
    color: colors.accent,
  },
  {
    id: 'Livreur',
    label: 'Livreur / Coursier',
    icon: { ios: 'bolt.fill', android: 'flash-on' },
    color: colors.secondary,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserMainRole>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { updateProfile } = useProfile();

  const totalSlides = slides.length + 1;

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
    if (currentSlide < totalSlides - 1) {
      const nextSlide = currentSlide + 1;
      goToSlide(nextSlide);
      console.log('Moving to next slide:', nextSlide);
    } else {
      console.log('Already on last slide');
    }
  };

  const handleSkip = async () => {
    try {
      console.log('Skip button pressed - navigating to home');
      await AsyncStorage.setItem('onboardingDone', 'true');
      
      await updateProfile({
        roles: {
          driver: true,
          passenger: true,
          sender: false,
          delivery: false,
        },
      });
      
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const handleFinish = async () => {
    try {
      console.log('Finish button pressed - completing onboarding');
      await AsyncStorage.setItem('onboardingDone', 'true');
      
      if (selectedRole) {
        await AsyncStorage.setItem('userMainRole', selectedRole);
        console.log('User main role saved:', selectedRole);
      }

      const roles = {
        driver: true,
        passenger: true,
        sender: selectedRole === 'Envoyeur de colis',
        delivery: selectedRole === 'Livreur',
      };

      await updateProfile({ roles });
      console.log('Roles synced to Supabase:', roles);
      
      console.log('Onboarding completed, navigating to home');
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleRoleSelect = (role: UserMainRole) => {
    setSelectedRole(role);
    console.log('Role selected:', role);
  };

  const isOnRoleSelectionSlide = currentSlide === slides.length;

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
          <View key={`slide-${index}`} style={[styles.slide, { width: SCREEN_WIDTH }]}>
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

        {/* Role Selection Slide */}
        <View key="role-selection-slide" style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <ScrollView 
            style={styles.roleSlideScrollView}
            contentContainerStyle={styles.roleSlideContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account-circle"
                size={80}
                color={colors.primary}
              />
            </View>

            <Text style={styles.slideTitle}>Vous utilisez Yombal Yoon surtout comme :</Text>
            <Text style={styles.slideText}>
              Choisissez votre rôle principal pour personnaliser votre expérience
            </Text>

            <View style={styles.roleOptionsContainer}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.roleOption,
                    selectedRole === option.id && styles.roleOptionSelected,
                    { borderColor: selectedRole === option.id ? option.color : colors.border },
                  ]}
                  onPress={() => handleRoleSelect(option.id as UserMainRole)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.roleIconContainer, { backgroundColor: option.color + '20' }]}>
                    <IconSymbol
                      ios_icon_name={option.icon.ios}
                      android_material_icon_name={option.icon.android}
                      size={32}
                      color={option.color}
                    />
                  </View>
                  <Text style={[styles.roleOptionText, selectedRole === option.id && styles.roleOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {selectedRole === option.id && (
                    <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {Array.from({ length: totalSlides }).map((_, index) => (
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
          {!isOnRoleSelectionSlide ? (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Passer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextButtonText}>Suivant</Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.finishButton,
                { backgroundColor: selectedRole ? colors.primary : colors.border },
              ]}
              onPress={handleFinish}
              activeOpacity={0.7}
              disabled={!selectedRole}
            >
              <Text style={[styles.finishButtonText, { opacity: selectedRole ? 1 : 0.5 }]}>
                Commencer avec Yombal Yoon
              </Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
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
  roleSlideScrollView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  roleSlideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: SCREEN_HEIGHT * 0.6,
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
  roleOptionsContainer: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  roleOptionSelected: {
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  roleOptionTextSelected: {
    fontWeight: '700',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: colors.background,
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
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

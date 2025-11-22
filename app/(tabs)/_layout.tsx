
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import YombalBanner from '@/components/YombalBanner';

export default function TabLayout() {
  // Define the tabs configuration for Yombal Yoon
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Accueil',
    },
    {
      name: 'covoiturage',
      route: '/(tabs)/covoiturage',
      icon: 'directions-car',
      label: 'Covoiturage',
    },
    {
      name: 'colis',
      route: '/(tabs)/colis',
      icon: 'local-shipping',
      label: 'Colis',
    },
    {
      name: 'livraison',
      route: '/(tabs)/livraison',
      icon: 'flash-on',
      label: 'Livraison',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profil',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="covoiturage" name="covoiturage" />
        <Stack.Screen key="colis" name="colis" />
        <Stack.Screen key="livraison" name="livraison" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <YombalBanner />
      <FloatingTabBar tabs={tabs} containerWidth={380} />
    </>
  );
}

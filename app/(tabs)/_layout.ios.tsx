
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={isDark ? colors.darkTextSecondary : colors.textSecondary}
      backgroundColor={isDark ? colors.darkCard : colors.card}
    >
      <NativeTabs.Trigger name="(home)">
        <Label style={{ fontSize: 11, fontWeight: '600' }}>ACCUEIL</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="covoiturage">
        <Label style={{ fontSize: 10, fontWeight: '600' }}>COVOITURAGE</Label>
        <Icon sf="car.fill" />
      </NativeTabs.Trigger>
      
      {/* DISABLED: Envoi de colis module */}
      {/* <NativeTabs.Trigger name="colis">
        <Label style={{ fontSize: 11, fontWeight: '600' }}>COLIS</Label>
        <Icon sf="shippingbox.fill" />
      </NativeTabs.Trigger> */}
      
      <NativeTabs.Trigger name="livraison">
        <Label style={{ fontSize: 9, fontWeight: '600' }}>LIVRAISON COLIS REGIONS</Label>
        <Icon sf="bolt.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="profile">
        <Label style={{ fontSize: 11, fontWeight: '600' }}>PROFIL</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

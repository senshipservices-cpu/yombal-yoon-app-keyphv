
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
        <Label>Accueil</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="covoiturage">
        <Label>Covoiturage</Label>
        <Icon sf="car.fill" />
      </NativeTabs.Trigger>
      
      {/* DISABLED: Envoi de colis module */}
      {/* <NativeTabs.Trigger name="colis">
        <Label>Colis</Label>
        <Icon sf="shippingbox.fill" />
      </NativeTabs.Trigger> */}
      
      <NativeTabs.Trigger name="livraison">
        <Label>LIVRAISON COLIS INTER-REGION</Label>
        <Icon sf="bolt.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="profile">
        <Label>Profil</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

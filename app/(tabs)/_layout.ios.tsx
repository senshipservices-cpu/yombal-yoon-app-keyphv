
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
        <Label style={{ fontSize: 12, fontWeight: '600' }}>Accueil</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="covoiturage">
        <Label style={{ fontSize: 12, fontWeight: '600' }}>Covoiturage</Label>
        <Icon sf="car.fill" />
      </NativeTabs.Trigger>
      
      {/* DISABLED: Envoi de colis module */}
      {/* <NativeTabs.Trigger name="colis">
        <Label style={{ fontSize: 12, fontWeight: '600' }}>Colis</Label>
        <Icon sf="shippingbox.fill" />
      </NativeTabs.Trigger> */}
      
      <NativeTabs.Trigger name="livraison">
        <Label style={{ fontSize: 11, fontWeight: '600' }}>LIVRAISON INTER-REGION</Label>
        <Icon sf="bolt.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="profile">
        <Label style={{ fontSize: 12, fontWeight: '600' }}>Profil</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

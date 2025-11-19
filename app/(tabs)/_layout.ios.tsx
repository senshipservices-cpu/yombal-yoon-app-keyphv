
import React from 'react';
import { Tabs } from 'expo-router/unstable-native-tabs';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.darkTextSecondary : colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.darkCard : colors.card,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="house.fill"
              android_material_icon_name="home"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="covoiturage"
        options={{
          title: 'Covoiturage',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="colis"
        options={{
          title: 'Colis',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="shippingbox.fill"
              android_material_icon_name="local-shipping"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="livraison"
        options={{
          title: 'Livraison',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="bolt.fill"
              android_material_icon_name="flash-on"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

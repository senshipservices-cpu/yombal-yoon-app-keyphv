
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { NAVIGATION_TABS, getTabBarConfig } from '@/config/navigationConfig';

export default function TabLayout() {
  // Get tabs configuration from centralized config
  const tabs = getTabBarConfig();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        {NAVIGATION_TABS.map((tab) => (
          <Stack.Screen key={tab.id} name={tab.id} />
        ))}
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={380} />
    </>
  );
}

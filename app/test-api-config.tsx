
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import ApiConfigTest from '@/components/ApiConfigTest';
import { colors } from '@/styles/commonStyles';

export default function TestApiConfigScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Test Configuration API',
          headerStyle: {
            backgroundColor: colors.accent,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <ApiConfigTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
});

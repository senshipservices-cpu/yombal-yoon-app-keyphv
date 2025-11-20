
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';

export default function YombalBanner() {
  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.banner}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>YOMBAL YOON</Text>
          <Text style={styles.subtitle1}>
            Le 1ere application de mobilité intelligente au Sénégal et en Afrique
          </Text>
          <Text style={styles.subtitle2}>
            Patriotisme national, fierté sénégalaise
          </Text>
        </View>
        <View style={styles.flagContainer}>
          <View style={styles.flag}>
            <View style={[styles.flagStripe, { backgroundColor: colors.primary }]} />
            <View style={[styles.flagStripe, { backgroundColor: colors.secondary }]} />
            <View style={[styles.flagStripe, { backgroundColor: colors.accent }]} />
            <View style={styles.starContainer}>
              <Text style={styles.star}>⭐</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  subtitle1: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle2: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  flagContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    width: 60,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
    elevation: 4,
    position: 'relative',
  },
  flagStripe: {
    flex: 1,
    width: '100%',
  },
  starContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 20,
    color: colors.primary,
  },
});

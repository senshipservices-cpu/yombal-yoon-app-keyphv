
/**
 * YombalYoonHeader - Header with Logo Integration
 * 
 * Displays the Yombal Yoon logo in headers across the app
 * 
 * ✨ NOUVELLE VERSION AVEC LOGO ET DÉGRADÉS
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { YYTheme } from '@/styles/theme';

interface YombalYoonHeaderProps {
  /**
   * Header title
   */
  title?: string;
  
  /**
   * Show logo
   */
  showLogo?: boolean;
  
  /**
   * Use gradient background
   */
  gradient?: boolean;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Custom title style
   */
  titleStyle?: TextStyle;
}

export const YombalYoonHeader: React.FC<YombalYoonHeaderProps> = ({
  title,
  showLogo = true,
  gradient = false,
  style,
  titleStyle,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      {showLogo && (
        <Image
          source={require('@/assets/images/final_quest_240x240.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      {title && (
        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
      )}
    </View>
  );
  
  if (gradient) {
    return (
      <LinearGradient
        colors={['#F7F8FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        {content}
      </LinearGradient>
    );
  }
  
  return content;
};

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
});

export default YombalYoonHeader;


import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { IconSymbol } from '@/components/IconSymbol';
import { 
  designColors, 
  typography, 
  componentStyles,
  createResponsiveStyle,
  createThemedStyle,
} from '@/styles/designSystem';
import { 
  PlatformUtils, 
  ResponsiveUtils, 
  LayoutUtils,
  testVisualConsistency,
} from '@/utils/platformUtils';

/**
 * Test Visual Consistency Screen
 * Demonstrates all cross-platform components and utilities
 */
export default function TestVisualConsistencyScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const deviceType = ResponsiveUtils.getDeviceType();
  const screenSize = ResponsiveUtils.getScreenDimensions();

  useEffect(() => {
    // Test visual consistency on mount (dev only)
    if (__DEV__) {
      testVisualConsistency();
    }
  }, []);

  const backgroundColor = createThemedStyle(
    designColors.background.light.primary,
    designColors.background.dark.primary,
    isDark
  );

  const textColor = createThemedStyle(
    designColors.text.light.primary,
    designColors.text.dark.primary,
    isDark
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth="desktop" padding="md">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
            
            <CrossPlatformText variant="h1" weight="bold" style={{ color: textColor }}>
              Test Cohérence Visuelle
            </CrossPlatformText>
          </View>

          {/* Platform Info */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.infoCard]}>
            <CrossPlatformText variant="h3" weight="semibold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.sm }}>
              Informations Plateforme
            </CrossPlatformText>
            
            <View style={styles.infoRow}>
              <CrossPlatformText variant="body-medium" weight="medium" style={{ color: textColor }}>
                Plateforme:
              </CrossPlatformText>
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                {Platform.OS} {PlatformUtils.isWeb ? '(Web)' : '(Native)'}
              </CrossPlatformText>
            </View>

            <View style={styles.infoRow}>
              <CrossPlatformText variant="body-medium" weight="medium" style={{ color: textColor }}>
                Type d'appareil:
              </CrossPlatformText>
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                {deviceType}
              </CrossPlatformText>
            </View>

            <View style={styles.infoRow}>
              <CrossPlatformText variant="body-medium" weight="medium" style={{ color: textColor }}>
                Taille écran:
              </CrossPlatformText>
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                {Math.round(screenSize.width)} x {Math.round(screenSize.height)}
              </CrossPlatformText>
            </View>

            <View style={styles.infoRow}>
              <CrossPlatformText variant="body-medium" weight="medium" style={{ color: textColor }}>
                Thème:
              </CrossPlatformText>
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                {isDark ? 'Sombre' : 'Clair'}
              </CrossPlatformText>
            </View>
          </CrossPlatformView>

          {/* Typography Examples */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.section]}>
            <CrossPlatformText variant="h2" weight="bold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              Typographie
            </CrossPlatformText>

            <CrossPlatformText variant="display-large" style={{ color: textColor }}>
              Display Large
            </CrossPlatformText>
            <CrossPlatformText variant="display-medium" style={{ color: textColor }}>
              Display Medium
            </CrossPlatformText>
            <CrossPlatformText variant="display-small" style={{ color: textColor }}>
              Display Small
            </CrossPlatformText>

            <View style={styles.divider} />

            <CrossPlatformText variant="h1" style={{ color: textColor }}>
              Heading 1
            </CrossPlatformText>
            <CrossPlatformText variant="h2" style={{ color: textColor }}>
              Heading 2
            </CrossPlatformText>
            <CrossPlatformText variant="h3" style={{ color: textColor }}>
              Heading 3
            </CrossPlatformText>
            <CrossPlatformText variant="h4" style={{ color: textColor }}>
              Heading 4
            </CrossPlatformText>

            <View style={styles.divider} />

            <CrossPlatformText variant="body-large" style={{ color: textColor }}>
              Body Large - Lorem ipsum dolor sit amet
            </CrossPlatformText>
            <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
              Body Medium - Lorem ipsum dolor sit amet
            </CrossPlatformText>
            <CrossPlatformText variant="body-small" style={{ color: textColor }}>
              Body Small - Lorem ipsum dolor sit amet
            </CrossPlatformText>

            <View style={styles.divider} />

            <CrossPlatformText variant="label-large" style={{ color: textColor }}>
              Label Large
            </CrossPlatformText>
            <CrossPlatformText variant="label-medium" style={{ color: textColor }}>
              Label Medium
            </CrossPlatformText>
            <CrossPlatformText variant="label-small" style={{ color: textColor }}>
              Label Small
            </CrossPlatformText>

            <View style={styles.divider} />

            <CrossPlatformText variant="caption" style={{ color: textColor }}>
              Caption text
            </CrossPlatformText>
          </CrossPlatformView>

          {/* Shadow Examples */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.section]}>
            <CrossPlatformText variant="h2" weight="bold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              Ombres
            </CrossPlatformText>

            <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }} gap="md">
              <CrossPlatformView shadow="sm" style={[styles.shadowBox, { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }]}>
                <CrossPlatformText variant="label-medium" style={{ color: textColor, textAlign: 'center' }}>
                  Small
                </CrossPlatformText>
              </CrossPlatformView>

              <CrossPlatformView shadow="md" style={[styles.shadowBox, { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }]}>
                <CrossPlatformText variant="label-medium" style={{ color: textColor, textAlign: 'center' }}>
                  Medium
                </CrossPlatformText>
              </CrossPlatformView>

              <CrossPlatformView shadow="lg" style={[styles.shadowBox, { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }]}>
                <CrossPlatformText variant="label-medium" style={{ color: textColor, textAlign: 'center' }}>
                  Large
                </CrossPlatformText>
              </CrossPlatformView>

              <CrossPlatformView shadow="xl" style={[styles.shadowBox, { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }]}>
                <CrossPlatformText variant="label-medium" style={{ color: textColor, textAlign: 'center' }}>
                  Extra Large
                </CrossPlatformText>
              </CrossPlatformView>
            </ResponsiveGrid>
          </CrossPlatformView>

          {/* Color Examples */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.section]}>
            <CrossPlatformText variant="h2" weight="bold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              Couleurs
            </CrossPlatformText>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.brand.primary }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Primary (Vert)
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.brand.secondary }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Secondary (Jaune)
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.brand.accent }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Accent (Rouge)
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.semantic.success }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Success
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.semantic.warning }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Warning
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.semantic.error }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Error
              </CrossPlatformText>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: designColors.semantic.info }]} />
              <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
                Info
              </CrossPlatformText>
            </View>
          </CrossPlatformView>

          {/* Responsive Grid Example */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.section]}>
            <CrossPlatformText variant="h2" weight="bold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              Grille Responsive
            </CrossPlatformText>

            <CrossPlatformText variant="body-medium" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              1 colonne (mobile), 2 colonnes (tablet), 3 colonnes (desktop)
            </CrossPlatformText>

            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <CrossPlatformView
                  key={item}
                  shadow="sm"
                  style={[
                    styles.gridItem,
                    { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }
                  ]}
                >
                  <CrossPlatformText variant="h3" style={{ color: textColor }}>
                    {item}
                  </CrossPlatformText>
                </CrossPlatformView>
              ))}
            </ResponsiveGrid>
          </CrossPlatformView>

          {/* Spacing Examples */}
          <CrossPlatformView shadow="md" style={[componentStyles.card.base, styles.section]}>
            <CrossPlatformText variant="h2" weight="bold" style={{ color: textColor, marginBottom: LayoutUtils.spacing.md }}>
              Espacement
            </CrossPlatformText>

            {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((size) => (
              <View key={size} style={styles.spacingRow}>
                <CrossPlatformText variant="label-medium" style={{ color: textColor, width: 60 }}>
                  {size.toUpperCase()}
                </CrossPlatformText>
                <View
                  style={[
                    styles.spacingBar,
                    { 
                      width: LayoutUtils.spacing[size],
                      backgroundColor: designColors.brand.primary,
                    }
                  ]}
                />
                <CrossPlatformText variant="caption" style={{ color: textColor, marginLeft: LayoutUtils.spacing.sm }}>
                  {LayoutUtils.spacing[size]}px
                </CrossPlatformText>
              </View>
            ))}
          </CrossPlatformView>

          {/* Success Message */}
          <CrossPlatformView
            shadow="lg"
            style={[
              componentStyles.card.elevated,
              styles.successCard,
              { backgroundColor: designColors.semantic.success + '20', borderLeftColor: designColors.semantic.success }
            ]}
          >
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={32}
              color={designColors.semantic.success}
            />
            <View style={{ flex: 1 }}>
              <CrossPlatformText variant="h4" weight="semibold" style={{ color: textColor }}>
                Système de cohérence visuelle actif
              </CrossPlatformText>
              <CrossPlatformText variant="body-small" style={{ color: textColor, marginTop: LayoutUtils.spacing.xs }}>
                Tous les composants utilisent le design system pour garantir la cohérence cross-platform.
              </CrossPlatformText>
            </View>
          </CrossPlatformView>

        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LayoutUtils.spacing.lg,
    gap: LayoutUtils.spacing.md,
  },
  backButton: {
    padding: LayoutUtils.spacing.xs,
  },
  infoCard: {
    marginBottom: LayoutUtils.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: LayoutUtils.spacing.xs,
  },
  section: {
    marginBottom: LayoutUtils.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: designColors.border.light,
    marginVertical: LayoutUtils.spacing.md,
  },
  shadowBox: {
    padding: LayoutUtils.spacing.lg,
    borderRadius: LayoutUtils.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LayoutUtils.spacing.sm,
    gap: LayoutUtils.spacing.md,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: LayoutUtils.borderRadius.sm,
  },
  gridItem: {
    padding: LayoutUtils.spacing.lg,
    borderRadius: LayoutUtils.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LayoutUtils.spacing.sm,
  },
  spacingBar: {
    height: 24,
    borderRadius: LayoutUtils.borderRadius.sm,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: LayoutUtils.spacing.md,
    borderLeftWidth: 4,
    marginTop: LayoutUtils.spacing.lg,
  },
});


import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

export default function ColisScreen() {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: '#FF8C00' }]}>
          <Text style={styles.headerEmoji}>🇸🇳</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Envoi de Colis</Text>
            <Text style={styles.headerSubtitle}>Thiak Thiak</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="shippingbox.fill"
                android_material_icon_name="local-shipping"
                size={48}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.title, { color: isDark ? colors.darkText : colors.text }]}>
              Module Envoi de Colis
            </Text>
            <Text style={[styles.description, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Envoyez vos colis en toute sécurité partout au Sénégal.
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
            <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
              Fonctionnalités à venir :
            </Text>
            <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              - Envoi de colis entre particuliers{'\n'}
              - Suivi en temps réel{'\n'}
              - Estimation des tarifs{'\n'}
              - Assurance colis{'\n'}
              - Historique des envois
            </Text>
          </View>
        </View>
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
    paddingTop: Platform.OS === 'android' ? 48 : 0,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 24,
  },
});

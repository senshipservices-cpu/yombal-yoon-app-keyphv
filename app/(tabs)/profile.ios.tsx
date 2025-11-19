
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme.dark;

  const menuItems = [
    {
      id: 1,
      title: "Mes Trajets",
      icon: "clock.fill" as const,
      color: colors.primary,
    },
    {
      id: 2,
      title: "Paiements",
      icon: "creditcard.fill" as const,
      color: colors.accent,
    },
    {
      id: 3,
      title: "Paramètres",
      icon: "gearshape.fill" as const,
      color: colors.textSecondary,
    },
    {
      id: 4,
      title: "Aide & Support",
      icon: "questionmark.circle.fill" as const,
      color: colors.primary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.darkBackground : colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={48} 
              color="#FFFFFF" 
            />
          </LinearGradient>
          <Text style={[styles.name, { color: isDark ? colors.darkText : colors.text }]}>
            Utilisateur Yombal
          </Text>
          <Text style={[styles.email, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            utilisateur@yombalyoon.sn
          </Text>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Trajets
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? colors.darkTextSecondary + '30' : colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Livraisons
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: isDark ? colors.darkTextSecondary + '30' : colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
              Points
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: isDark ? colors.darkCard : colors.card }]}
                activeOpacity={0.7}
                onPress={() => console.log(`Menu item ${item.title} pressed`)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                  <IconSymbol
                    ios_icon_name={item.icon}
                    android_material_icon_name="star"
                    size={24}
                    color={item.color}
                  />
                </View>
                <Text style={[styles.menuTitle, { color: isDark ? colors.darkText : colors.text }]}>
                  {item.title}
                </Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={24}
                  color={isDark ? colors.darkTextSecondary : colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.darkCard : colors.card }]}>
          <Text style={[styles.infoTitle, { color: isDark ? colors.darkText : colors.text }]}>
            Yombal Yoon
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.infoText, { color: isDark ? colors.darkTextSecondary : colors.textSecondary }]}>
            © 2024 Yombal Yoon. Tous droits réservés.
          </Text>
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
  contentContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 32,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 128, 0, 0.3)',
    elevation: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});

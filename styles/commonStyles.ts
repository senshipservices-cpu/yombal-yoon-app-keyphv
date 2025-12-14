
import { StyleSheet, Platform } from 'react-native';

/**
 * Couleurs globales Yombal Yoon
 * PARTIE 1 — STRUCTURE GLOBALE & PRINCIPES UI (COMMUNS)
 * 
 * Vision UI globale:
 * - Moderne, dynamique, professionnelle
 * - Ancrée au Sénégal 🇸🇳 sans être "chargée drapeau"
 * 
 * 👉 Le VERT porte la marque
 * 👉 Le JAUNE déclenche l'action
 * 👉 Le ROUGE signale (alertes, badges)
 */
export const colors = {
  // Couleurs principales - NOUVELLE PALETTE OFFICIELLE
  primary: '#0B7A3B',      // Vert marque - LE VERT PORTE LA MARQUE
  primaryDark: '#064A26',  // Vert foncé
  secondary: '#F7C948',    // Jaune CTA - LE JAUNE DÉCLENCHE L'ACTION
  accent: '#E53935',       // Rouge alerte - LE ROUGE SIGNALE
  
  // Couleurs de fond
  background: '#F7F8FA',   // Fond principal
  backgroundAlt: '#FFFFFF', // Fond alternatif
  darkBackground: '#1A1A1A',
  
  // Couleurs de carte
  card: '#FFFFFF',         // Cards blanches
  darkCard: '#2A2A2A',
  
  // Couleurs de texte
  text: '#101828',         // Texte principal
  darkText: '#FFFFFF',
  textSecondary: '#666666',
  darkTextSecondary: '#CCCCCC',
  
  // Couleurs d'état
  success: '#0B7A3B',      // Vert marque (succès = toast vert)
  error: '#E53935',        // Rouge alerte (erreur = toast rouge)
  warning: '#F7C948',      // Jaune
  info: '#0066CC',
  
  // Couleurs de bordure
  border: '#E0E0E0',
  darkBorder: '#404040',
  
  // Couleurs de statut
  pending: '#F7C948',      // Jaune
  accepted: '#0B7A3B',     // Vert
  refused: '#E53935',      // Rouge
  cancelled: '#999999',
  
  // Couleurs de module
  covoiturage: '#0B7A3B',  // Vert
  livraison: '#E53935',    // Rouge
  colis: '#0066CC',
  
  // Couleur de surbrillance
  highlight: '#E0E0E0',
};

// Font family with fallbacks for when custom fonts fail to load
export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: 'System',
  }),
};

/**
 * Common Styles - Design System Officiel
 * Cards: radius 18–20, ombre douce
 * Boutons: Primaire JAUNE plein, Secondaire contour VERT, Destructif texte ROUGE
 */
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  // Cards: radius 18-20, ombre douce
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08, // Ombre douce
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  // Bouton primaire: JAUNE plein
  button: {
    backgroundColor: colors.secondary, // JAUNE
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text, // Texte foncé sur jaune
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  // Bouton secondaire: contour VERT
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary, // Contour VERT
  },
  buttonSecondaryText: {
    color: colors.primary, // Texte VERT
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  // Bouton destructif: texte ROUGE
  buttonDestructive: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDestructiveText: {
    color: colors.accent, // Texte ROUGE
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fontFamily.bold,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    fontFamily: fontFamily.bold,
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 8,
    fontFamily: fontFamily.bold,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    fontFamily: fontFamily.regular,
  },
  darkSubtitle: {
    fontSize: 16,
    color: colors.darkTextSecondary,
    marginBottom: 16,
    fontFamily: fontFamily.regular,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    fontFamily: fontFamily.regular,
  },
  darkInput: {
    backgroundColor: colors.darkCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    marginBottom: 16,
    color: colors.darkText,
    fontFamily: fontFamily.regular,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08, // Ombre douce
    shadowRadius: 4,
    elevation: 2,
  },
  darkShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

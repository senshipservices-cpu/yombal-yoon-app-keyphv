
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
 * 
 * ✨ NOUVELLE VERSION AVEC DÉGRADÉS ET ANIMATIONS
 */
export const colors = {
  // Couleurs principales - NOUVELLE PALETTE OFFICIELLE ENRICHIE
  primary: '#0B7A3B',      // Vert marque - LE VERT PORTE LA MARQUE
  primaryDark: '#064A26',  // Vert foncé
  primaryLight: '#10A854', // Vert clair pour dégradés
  secondary: '#F7C948',    // Jaune CTA - LE JAUNE DÉCLENCHE L'ACTION
  secondaryLight: '#FFD966', // Jaune clair pour dégradés
  accent: '#E53935',       // Rouge alerte - LE ROUGE SIGNALE
  accentDark: '#C62828',   // Rouge foncé pour dégradés
  
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
 * Enhanced Shadow System - Ombres optimisées
 */
export const shadows = {
  // Subtle shadow for cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // Medium elevation for floating elements
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  // Strong elevation for modals
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  // Colored shadows for brand elements
  brandGreen: {
    shadowColor: '#0B7A3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  brandYellow: {
    shadowColor: '#F7C948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandRed: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

/**
 * Common Styles - Design System Officiel avec Ombres Optimisées
 * Cards: radius 18–20, ombre douce optimisée
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
  // Cards: radius 18-20, ombre douce optimisée
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...shadows.card,
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
  // Card avec élévation forte
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...shadows.floating,
  },
  // Card avec ombre colorée (vert)
  cardBrandGreen: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...shadows.brandGreen,
  },
  // Bouton primaire: JAUNE plein avec ombre colorée
  button: {
    backgroundColor: colors.secondary, // JAUNE
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brandYellow,
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
  // Bouton accent: VERT plein avec ombre colorée
  buttonAccent: {
    backgroundColor: colors.primary, // VERT
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brandGreen,
  },
  buttonAccentText: {
    color: colors.card, // Texte blanc sur vert
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
  // Input avec focus (ombre colorée)
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.brandGreen,
  },
  shadow: {
    ...shadows.card,
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
  // Nouvelles ombres
  shadowFloating: {
    ...shadows.floating,
  },
  shadowModal: {
    ...shadows.modal,
  },
});

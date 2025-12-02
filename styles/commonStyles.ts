
import { StyleSheet } from 'react-native';

// Couleurs globales Yombal Yoon (drapeau Sénégal)
export const colors = {
  // Couleurs principales (drapeau Sénégal)
  primary: '#00853F',      // Vert
  secondary: '#FDEF42',    // Jaune
  accent: '#E31B23',       // Rouge
  
  // Couleurs de fond
  background: '#F5F5F5',
  darkBackground: '#1A1A1A',
  
  // Couleurs de carte
  card: '#FFFFFF',
  darkCard: '#2A2A2A',
  
  // Couleurs de texte
  text: '#1A1A1A',
  darkText: '#FFFFFF',
  textSecondary: '#666666',
  darkTextSecondary: '#AAAAAA',
  
  // Couleurs d'état
  success: '#00853F',
  error: '#E31B23',
  warning: '#FFA500',
  info: '#0066CC',
  
  // Couleurs de bordure
  border: '#E0E0E0',
  darkBorder: '#404040',
  
  // Couleurs de statut
  pending: '#FFA500',
  accepted: '#00853F',
  refused: '#E31B23',
  cancelled: '#999999',
  
  // Couleurs de module
  covoiturage: '#00853F',
  livraison: '#E31B23',
  colis: '#0066CC',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  darkSubtitle: {
    fontSize: 16,
    color: colors.darkTextSecondary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
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
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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

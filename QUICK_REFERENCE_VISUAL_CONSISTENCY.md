
# Guide Rapide - Cohérence Visuelle Cross-Platform

## 🚀 Démarrage Rapide

### Importer les utilitaires

```typescript
// Utilitaires de plateforme
import { PlatformUtils, ResponsiveUtils, LayoutUtils, ShadowUtils } from '@/utils/platformUtils';

// Design system
import { designColors, typography, componentStyles } from '@/styles/designSystem';

// Composants cross-platform
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
```

---

## 📱 Détection de Plateforme

```typescript
// Vérifier la plateforme
PlatformUtils.isWeb      // true sur web
PlatformUtils.isIOS      // true sur iOS
PlatformUtils.isAndroid  // true sur Android
PlatformUtils.isNative   // true sur iOS ou Android

// Sélectionner une valeur
const value = PlatformUtils.select({
  web: 'valeur web',
  ios: 'valeur iOS',
  android: 'valeur Android',
  native: 'valeur native (iOS + Android)',
  default: 'valeur par défaut',
});
```

---

## 📐 Responsive Design

```typescript
// Type d'appareil
const deviceType = ResponsiveUtils.getDeviceType();
// 'mobile' | 'tablet' | 'desktop'

// Valeur responsive
const columns = ResponsiveUtils.getResponsiveValue({
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
});

// Vérifier un breakpoint
if (ResponsiveUtils.matchesBreakpoint('tablet')) {
  // Code pour tablette
}
```

---

## 📏 Espacement

```typescript
// Espacement standard
LayoutUtils.spacing.xs   // 4px
LayoutUtils.spacing.sm   // 8px
LayoutUtils.spacing.md   // 16px
LayoutUtils.spacing.lg   // 24px
LayoutUtils.spacing.xl   // 32px
LayoutUtils.spacing.xxl  // 48px

// Espacement responsive (adapté au type d'appareil)
const padding = LayoutUtils.getSpacing('md');
```

---

## 🔤 Typographie

```typescript
// Tailles de police
LayoutUtils.fontSize.xs    // 12px
LayoutUtils.fontSize.sm    // 14px
LayoutUtils.fontSize.md    // 16px
LayoutUtils.fontSize.lg    // 18px
LayoutUtils.fontSize.xl    // 20px
LayoutUtils.fontSize.xxl   // 24px
LayoutUtils.fontSize.xxxl  // 32px

// Taille responsive
const fontSize = LayoutUtils.getFontSize('lg');

// Border radius
LayoutUtils.borderRadius.sm   // 8px
LayoutUtils.borderRadius.md   // 12px
LayoutUtils.borderRadius.lg   // 16px
LayoutUtils.borderRadius.xl   // 24px
LayoutUtils.borderRadius.full // 9999px
```

---

## 🎨 Couleurs

```typescript
// Couleurs de marque (drapeau Sénégal)
designColors.brand.primary    // Vert
designColors.brand.secondary  // Jaune
designColors.brand.accent     // Rouge

// Couleurs sémantiques
designColors.semantic.success  // Vert
designColors.semantic.warning  // Jaune
designColors.semantic.error    // Rouge
designColors.semantic.info     // Bleu

// Fond (light/dark)
designColors.background.light.primary
designColors.background.dark.primary

// Texte (light/dark)
designColors.text.light.primary
designColors.text.dark.primary
```

---

## 🌑 Ombres

```typescript
// Obtenir une ombre cross-platform
const shadow = ShadowUtils.getShadow('md');
// Web: { boxShadow: '...' }
// Native: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }

// Niveaux disponibles
ShadowUtils.getShadow('sm')  // Petite
ShadowUtils.getShadow('md')  // Moyenne
ShadowUtils.getShadow('lg')  // Grande
ShadowUtils.getShadow('xl')  // Extra grande
```

---

## 🧩 Composants

### CrossPlatformView

```typescript
<CrossPlatformView
  shadow="md"
  webStyle={{ /* styles web */ }}
  iosStyle={{ /* styles iOS */ }}
  androidStyle={{ /* styles Android */ }}
  nativeStyle={{ /* styles iOS + Android */ }}
  style={{ /* styles communs */ }}
>
  {/* contenu */}
</CrossPlatformView>
```

### CrossPlatformText

```typescript
<CrossPlatformText
  variant="h1"           // display-large, h1, body-medium, etc.
  weight="bold"          // regular, medium, semibold, bold
  webStyle={{ /* ... */ }}
  iosStyle={{ /* ... */ }}
  androidStyle={{ /* ... */ }}
  style={{ /* ... */ }}
>
  Mon texte
</CrossPlatformText>
```

**Variantes disponibles :**
- Display: `display-large`, `display-medium`, `display-small`
- Headings: `h1`, `h2`, `h3`, `h4`
- Body: `body-large`, `body-medium`, `body-small`
- Labels: `label-large`, `label-medium`, `label-small`
- Caption: `caption`

### ResponsiveContainer

```typescript
<ResponsiveContainer
  maxWidth="desktop"     // ou nombre en pixels
  centered={true}
  padding="md"
  scrollable={false}
>
  {/* contenu */}
</ResponsiveContainer>
```

### ResponsiveGrid

```typescript
<ResponsiveGrid
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="md"
>
  <View>{/* item 1 */}</View>
  <View>{/* item 2 */}</View>
  <View>{/* item 3 */}</View>
</ResponsiveGrid>
```

---

## 🎯 Styles de Composants

```typescript
// Cards
componentStyles.card.base
componentStyles.card.elevated
componentStyles.card.outlined

// Buttons
componentStyles.button.base
componentStyles.button.primary
componentStyles.button.secondary
componentStyles.button.outline

// Inputs
componentStyles.input.base
componentStyles.input.focused
componentStyles.input.error

// Containers
componentStyles.container.base
componentStyles.container.centered
componentStyles.container.padded
componentStyles.container.responsive
```

---

## ✅ Tests

```typescript
import { testVisualConsistency } from '@/utils/platformUtils';

// Dans un écran (dev uniquement)
useEffect(() => {
  testVisualConsistency();
}, []);
```

---

## 💡 Exemples Rapides

### Écran responsive avec thème

```typescript
import React from 'react';
import { useTheme } from '@react-navigation/native';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { designColors, componentStyles } from '@/styles/designSystem';

export default function MyScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  
  return (
    <ResponsiveContainer maxWidth="desktop" padding="md" scrollable>
      <CrossPlatformView
        shadow="md"
        style={[
          componentStyles.card.base,
          { backgroundColor: isDark ? designColors.background.dark.secondary : designColors.background.light.secondary }
        ]}
      >
        <CrossPlatformText
          variant="h1"
          weight="bold"
          style={{ color: isDark ? designColors.text.dark.primary : designColors.text.light.primary }}
        >
          Mon titre
        </CrossPlatformText>
      </CrossPlatformView>
    </ResponsiveContainer>
  );
}
```

### Grille responsive

```typescript
<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
  {items.map((item, index) => (
    <CrossPlatformView key={index} shadow="sm" style={componentStyles.card.base}>
      <CrossPlatformText variant="body-medium">{item.title}</CrossPlatformText>
    </CrossPlatformView>
  ))}
</ResponsiveGrid>
```

### Bouton avec ombre

```typescript
<TouchableOpacity
  style={[
    componentStyles.button.primary,
    { borderRadius: LayoutUtils.borderRadius.md }
  ]}
  onPress={handlePress}
>
  <CrossPlatformText variant="label-large" weight="semibold" style={{ color: '#FFFFFF' }}>
    Cliquez ici
  </CrossPlatformText>
</TouchableOpacity>
```

---

## 🔍 Écran de Test

Pour tester tous les composants :

```typescript
// Naviguer vers l'écran de test
router.push('/test-visual-consistency');
```

---

## 📚 Documentation Complète

Voir `VISUAL_CONSISTENCY_GUIDE.md` pour la documentation complète.

---

**Dernière mise à jour** : 2025-01-24

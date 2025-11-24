
# Guide de Migration - Système de Cohérence Visuelle

Ce guide vous aide à migrer les écrans existants vers le nouveau système de cohérence visuelle cross-platform.

---

## 📋 Checklist de Migration

Pour chaque écran :

- [ ] Remplacer les `View` par `CrossPlatformView` (si ombres nécessaires)
- [ ] Remplacer les `Text` par `CrossPlatformText` (pour typographie cohérente)
- [ ] Utiliser `ResponsiveContainer` pour le container principal
- [ ] Remplacer les valeurs fixes par les utilitaires (`LayoutUtils`, etc.)
- [ ] Utiliser `designColors` au lieu de `colors`
- [ ] Remplacer les ombres manuelles par `ShadowUtils`
- [ ] Tester sur Web, iOS et Android
- [ ] Tester en mode clair et sombre

---

## 🔄 Exemples de Migration

### 1. View avec ombre

#### ❌ Avant

```typescript
<View
  style={{
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  }}
>
  {/* contenu */}
</View>
```

#### ✅ Après

```typescript
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { LayoutUtils } from '@/utils/platformUtils';
import { designColors } from '@/styles/designSystem';

<CrossPlatformView
  shadow="md"
  style={{
    backgroundColor: designColors.background.light.secondary,
    borderRadius: LayoutUtils.borderRadius.lg,
    padding: LayoutUtils.getSpacing('md'),
  }}
>
  {/* contenu */}
</CrossPlatformView>
```

---

### 2. Text avec style

#### ❌ Avant

```typescript
<Text
  style={{
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  }}
>
  Mon titre
</Text>
```

#### ✅ Après

```typescript
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { LayoutUtils } from '@/utils/platformUtils';
import { designColors } from '@/styles/designSystem';

<CrossPlatformText
  variant="h1"
  weight="bold"
  style={{
    color: designColors.text.light.primary,
    marginBottom: LayoutUtils.spacing.sm,
  }}
>
  Mon titre
</CrossPlatformText>
```

---

### 3. Container avec padding

#### ❌ Avant

```typescript
<View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: 20 }}
  >
    {/* contenu */}
  </ScrollView>
</View>
```

#### ✅ Après

```typescript
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { designColors } from '@/styles/designSystem';

<View style={{ flex: 1, backgroundColor: designColors.background.light.primary }}>
  <ResponsiveContainer
    maxWidth="desktop"
    padding="md"
    scrollable={true}
  >
    {/* contenu */}
  </ResponsiveContainer>
</View>
```

---

### 4. Grille de cartes

#### ❌ Avant

```typescript
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
  {items.map((item, index) => (
    <View
      key={index}
      style={{
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>
        {item.title}
      </Text>
    </View>
  ))}
</View>
```

#### ✅ Après

```typescript
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { componentStyles, designColors } from '@/styles/designSystem';

<ResponsiveGrid
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
  gap="md"
>
  {items.map((item, index) => (
    <CrossPlatformView
      key={index}
      shadow="md"
      style={componentStyles.card.base}
    >
      <CrossPlatformText variant="body-medium" weight="semibold">
        {item.title}
      </CrossPlatformText>
    </CrossPlatformView>
  ))}
</ResponsiveGrid>
```

---

### 5. Bouton avec style

#### ❌ Avant

```typescript
<TouchableOpacity
  style={{
    backgroundColor: '#008000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }}
  onPress={handlePress}
>
  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
    Cliquez ici
  </Text>
</TouchableOpacity>
```

#### ✅ Après

```typescript
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { CrossPlatformText } from '@/components/CrossPlatformText';
import { componentStyles, designColors } from '@/styles/designSystem';

<TouchableOpacity onPress={handlePress}>
  <CrossPlatformView
    shadow="sm"
    style={componentStyles.button.primary}
  >
    <CrossPlatformText variant="label-large" weight="semibold" style={{ color: '#FFFFFF' }}>
      Cliquez ici
    </CrossPlatformText>
  </CrossPlatformView>
</TouchableOpacity>
```

---

### 6. Gestion du thème clair/sombre

#### ❌ Avant

```typescript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

<View style={{ backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }}>
  <Text style={{ color: isDark ? '#FFFFFF' : '#333333' }}>
    Mon texte
  </Text>
</View>
```

#### ✅ Après

```typescript
import { useTheme } from '@react-navigation/native';
import { createThemedStyle } from '@/styles/designSystem';
import { designColors } from '@/styles/designSystem';

const theme = useTheme();
const isDark = theme.dark;

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

<View style={{ backgroundColor }}>
  <CrossPlatformText variant="body-medium" style={{ color: textColor }}>
    Mon texte
  </CrossPlatformText>
</View>
```

---

### 7. Styles spécifiques par plateforme

#### ❌ Avant

```typescript
import { Platform } from 'react-native';

<View
  style={{
    padding: 20,
    ...(Platform.OS === 'web' && {
      maxWidth: 800,
      alignSelf: 'center',
    }),
    ...(Platform.OS === 'android' && {
      paddingTop: 48,
    }),
  }}
>
  {/* contenu */}
</View>
```

#### ✅ Après

```typescript
import { CrossPlatformView } from '@/components/CrossPlatformView';
import { LayoutUtils } from '@/utils/platformUtils';

<CrossPlatformView
  webStyle={{
    maxWidth: LayoutUtils.getContentMaxWidth(),
    alignSelf: 'center',
  }}
  androidStyle={{
    paddingTop: LayoutUtils.getSafeAreaPadding().top,
  }}
  style={{
    padding: LayoutUtils.getSpacing('md'),
  }}
>
  {/* contenu */}
</CrossPlatformView>
```

---

## 🎯 Stratégie de Migration

### Phase 1 : Écrans Principaux (Priorité Haute)

1. **Écran d'accueil** (`app/(tabs)/(home)/index.tsx`)
2. **Écran de profil** (`app/(tabs)/profile.tsx`)
3. **Écrans de covoiturage** (`app/(tabs)/covoiturage.tsx`, etc.)
4. **Écrans de colis** (`app/(tabs)/colis.tsx`, etc.)
5. **Écrans de livraison** (`app/(tabs)/livraison.tsx`, etc.)

### Phase 2 : Composants Réutilisables (Priorité Moyenne)

1. **FloatingTabBar** (`components/FloatingTabBar.tsx`)
2. **YombalBanner** (`components/YombalBanner.tsx`)
3. **Modals** (tous les modals)
4. **Cards** (tous les composants de carte)

### Phase 3 : Écrans Secondaires (Priorité Basse)

1. Écrans de détail
2. Écrans de paramètres
3. Écrans de feedback
4. Autres écrans

---

## 🔍 Vérification Post-Migration

Pour chaque écran migré :

### 1. Tests Visuels

- [ ] Tester sur Web (Chrome, Firefox, Safari)
- [ ] Tester sur iOS (iPhone, iPad)
- [ ] Tester sur Android (différentes tailles)
- [ ] Tester en mode clair
- [ ] Tester en mode sombre

### 2. Tests Responsive

- [ ] Mobile (< 600px)
- [ ] Tablet (600px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Wide (> 1440px)

### 3. Tests Fonctionnels

- [ ] Tous les boutons fonctionnent
- [ ] Toutes les interactions fonctionnent
- [ ] La navigation fonctionne
- [ ] Les formulaires fonctionnent

### 4. Tests de Performance

- [ ] Pas de ralentissement
- [ ] Animations fluides
- [ ] Chargement rapide

---

## 📊 Suivi de Migration

Créer un tableau pour suivre la progression :

| Écran | Statut | Web | iOS | Android | Notes |
|-------|--------|-----|-----|---------|-------|
| Home | ✅ Migré | ✅ | ✅ | ✅ | RAS |
| Profile | 🔄 En cours | ✅ | ⏳ | ⏳ | À tester |
| Covoiturage | ⏳ À faire | - | - | - | - |
| ... | ... | ... | ... | ... | ... |

**Légende :**
- ✅ Terminé et testé
- 🔄 En cours
- ⏳ À faire
- ❌ Problème

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : Ombres ne s'affichent pas sur Web

**Cause :** Utilisation des props React Native au lieu de boxShadow

**Solution :**
```typescript
// Utiliser CrossPlatformView avec shadow prop
<CrossPlatformView shadow="md">
```

### Problème 2 : Texte trop petit/grand sur certains appareils

**Cause :** Taille de police fixe

**Solution :**
```typescript
// Utiliser LayoutUtils.getFontSize()
fontSize: LayoutUtils.getFontSize('md')
```

### Problème 3 : Layout cassé sur tablette

**Cause :** Pas de gestion responsive

**Solution :**
```typescript
// Utiliser ResponsiveGrid ou ResponsiveUtils
<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
```

### Problème 4 : Couleurs incohérentes en mode sombre

**Cause :** Couleurs codées en dur

**Solution :**
```typescript
// Utiliser designColors et createThemedStyle
const textColor = createThemedStyle(
  designColors.text.light.primary,
  designColors.text.dark.primary,
  isDark
);
```

---

## 💡 Conseils

1. **Migrer progressivement** : Ne pas tout migrer d'un coup
2. **Tester fréquemment** : Tester après chaque migration
3. **Documenter les changements** : Noter les modifications importantes
4. **Demander des revues** : Faire valider par d'autres développeurs
5. **Utiliser l'écran de test** : `/test-visual-consistency` pour vérifier

---

## 📞 Support

En cas de problème :

1. Consulter `VISUAL_CONSISTENCY_GUIDE.md`
2. Consulter `QUICK_REFERENCE_VISUAL_CONSISTENCY.md`
3. Utiliser `testVisualConsistency()` pour diagnostiquer
4. Vérifier les exemples dans `/test-visual-consistency`

---

**Dernière mise à jour** : 2025-01-24

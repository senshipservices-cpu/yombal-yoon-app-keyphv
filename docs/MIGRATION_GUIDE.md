
# Guide de Migration - Composants Yombal Yoon

## 📋 Vue d'Ensemble

Ce guide vous aide à migrer les écrans existants vers le nouveau système de composants Yombal Yoon pour garantir la cohérence visuelle sur toutes les plateformes.

---

## 🎯 Objectif

Remplacer progressivement tous les composants personnalisés par les composants YY standardisés, en utilisant exclusivement les tokens du thème.

---

## 📝 Checklist de Migration par Écran

### ✅ Écran Migré Quand:

- [ ] Utilise `YYScreenContainer` comme conteneur principal
- [ ] Tous les boutons sont des `YYButton`
- [ ] Toutes les cartes sont des `YYCard`
- [ ] Tous les champs de formulaire sont des `YYFormField`
- [ ] Tous les badges sont des `YYBadge`
- [ ] Tous les chips/tags sont des `YYChip`
- [ ] Aucune couleur en dur (toutes via `YYTheme.colors`)
- [ ] Aucune taille de police en dur (toutes via `YYTheme.typography`)
- [ ] Aucun espacement en dur (tous via `YYTheme.spacing`)
- [ ] Testé sur Web, iOS et Android

---

## 🔄 Étapes de Migration

### Étape 1: Préparer l'Écran

1. **Sauvegarder l'écran actuel**
   ```bash
   # Créer une copie de sauvegarde
   cp app/mon-ecran.tsx app/mon-ecran.backup.tsx
   ```

2. **Identifier les composants à remplacer**
   - Lister tous les `TouchableOpacity` → `YYButton`
   - Lister tous les `View` de cartes → `YYCard`
   - Lister tous les `TextInput` → `YYFormField`
   - Lister toutes les couleurs en dur → `YYTheme.colors`

### Étape 2: Mettre à Jour les Imports

**Avant:**
```typescript
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, buttonStyles } from '@/styles/commonStyles';
```

**Après:**
```typescript
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {
  YYScreenContainer,
  YYButton,
  YYCard,
  YYFormField,
  YYBadge,
  YYChip,
} from '@/components/YY';
import { YYTheme } from '@/styles/theme';
```

### Étape 3: Remplacer le Conteneur Principal

**Avant:**
```typescript
export default function MyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* contenu */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
});
```

**Après:**
```typescript
export default function MyScreen() {
  return (
    <YYScreenContainer scrollable>
      {/* contenu */}
    </YYScreenContainer>
  );
}
```

### Étape 4: Remplacer les Boutons

**Avant:**
```typescript
<TouchableOpacity
  style={[buttonStyles.primary, { marginTop: 20 }]}
  onPress={handleSubmit}
>
  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
    Publier
  </Text>
</TouchableOpacity>
```

**Après:**
```typescript
<YYButton
  variant="primary"
  fullWidth
  onPress={handleSubmit}
  style={{ marginTop: YYTheme.spacing.md }}
>
  Publier
</YYButton>
```

### Étape 5: Remplacer les Cartes

**Avant:**
```typescript
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Titre</Text>
  </View>
  <Text style={styles.cardContent}>Contenu</Text>
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  cardContent: {
    fontSize: 14,
    color: '#666666',
  },
});
```

**Après:**
```typescript
<YYCard variant="elevated">
  <Text style={YYTheme.typography.h4}>Titre</Text>
  <Text style={YYTheme.typography.bodySmall}>Contenu</Text>
</YYCard>
```

### Étape 6: Remplacer les Champs de Formulaire

**Avant:**
```typescript
<View style={styles.fieldContainer}>
  <Text style={styles.label}>Ville de départ *</Text>
  <TextInput
    style={[
      styles.input,
      errors.departure && styles.inputError,
    ]}
    placeholder="Ex: Dakar"
    value={departure}
    onChangeText={setDeparture}
  />
  {errors.departure && (
    <Text style={styles.errorText}>{errors.departure}</Text>
  )}
</View>

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
});
```

**Après:**
```typescript
<YYFormField
  label="Ville de départ"
  placeholder="Ex: Dakar"
  required
  value={departure}
  onChangeText={setDeparture}
  error={errors.departure}
/>
```

### Étape 7: Remplacer les Couleurs

**Avant:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  text: {
    color: '#333333',
  },
  button: {
    backgroundColor: '#008000',
  },
});
```

**Après:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: YYTheme.colors.background.light,
  },
  text: {
    color: YYTheme.colors.text.primary,
  },
  button: {
    backgroundColor: YYTheme.colors.primary,
  },
});
```

### Étape 8: Remplacer la Typographie

**Avant:**
```typescript
<Text style={{ fontSize: 24, fontWeight: '700', color: '#333333' }}>
  Titre
</Text>
<Text style={{ fontSize: 16, fontWeight: '400', color: '#666666' }}>
  Contenu
</Text>
```

**Après:**
```typescript
<Text style={YYTheme.typography.h2}>
  Titre
</Text>
<Text style={YYTheme.typography.bodyMedium}>
  Contenu
</Text>
```

### Étape 9: Remplacer les Espacements

**Avant:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
});
```

**Après:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: YYTheme.spacing.md,
    gap: YYTheme.spacing.sm,
  },
  section: {
    marginBottom: YYTheme.spacing.lg,
  },
});
```

### Étape 10: Tester

1. **Test Web**
   ```bash
   npm run web
   ```
   - Vérifier l'apparence
   - Vérifier les interactions
   - Vérifier le responsive

2. **Test iOS**
   - Ouvrir dans Xcode ou Expo Go
   - Vérifier l'apparence
   - Vérifier les interactions
   - Vérifier les safe areas

3. **Test Android**
   - Ouvrir dans Android Studio ou Expo Go
   - Vérifier l'apparence
   - Vérifier les interactions
   - Vérifier le padding top (notch)

4. **Comparaison Visuelle**
   - Prendre des captures d'écran sur les 3 plateformes
   - Comparer côte à côte
   - Vérifier que tout est identique

---

## 📊 Ordre de Migration Recommandé

### Phase 1: Écrans Principaux
1. ✅ Accueil (`app/(tabs)/(home)/index.tsx`)
2. ✅ Profil (`app/(tabs)/profile.tsx`)

### Phase 2: Formulaires
3. ⏳ Publier un trajet (`app/covoiturage/publish-ride.tsx`)
4. ⏳ Envoyer un colis (`app/(tabs)/colis.tsx`)
5. ⏳ Livraison inter régions (`app/(tabs)/livraison.tsx`)

### Phase 3: Écrans Secondaires
6. ⏳ Mes trajets (`app/covoiturage/my-rides.tsx`)
7. ⏳ Mes réservations (`app/covoiturage/my-reservations.tsx`)
8. ⏳ Mes colis (`app/colis/my-parcels.tsx`)
9. ⏳ Wallet (`app/wallet.tsx`)

### Phase 4: Écrans Spécialisés
10. ⏳ Tous les autres écrans

---

## 🔍 Vérification Post-Migration

### Checklist Technique

- [ ] Aucun import de `colors` depuis `commonStyles`
- [ ] Aucun import de `buttonStyles` depuis `commonStyles`
- [ ] Aucune couleur hexadécimale en dur
- [ ] Aucune taille de police en dur
- [ ] Aucun `Platform.OS` pour le design
- [ ] Tous les `TouchableOpacity` de boutons remplacés
- [ ] Tous les `TextInput` remplacés
- [ ] Utilisation de `YYScreenContainer`

### Checklist Visuelle

- [ ] Couleurs identiques sur Web/iOS/Android
- [ ] Espacements identiques sur Web/iOS/Android
- [ ] Typographie identique sur Web/iOS/Android
- [ ] Boutons identiques sur Web/iOS/Android
- [ ] Cartes identiques sur Web/iOS/Android
- [ ] Formulaires identiques sur Web/iOS/Android

---

## 🚨 Erreurs Courantes

### 1. Oublier d'importer YYTheme

**❌ Erreur:**
```typescript
<View style={{ backgroundColor: YYTheme.colors.primary }}>
// ReferenceError: YYTheme is not defined
```

**✅ Solution:**
```typescript
import { YYTheme } from '@/styles/theme';
```

### 2. Mélanger anciens et nouveaux styles

**❌ Erreur:**
```typescript
import { colors } from '@/styles/commonStyles';
import { YYTheme } from '@/styles/theme';

<View style={{ backgroundColor: colors.primary }}>  // Ancien
<View style={{ backgroundColor: YYTheme.colors.primary }}>  // Nouveau
```

**✅ Solution:**
```typescript
import { YYTheme } from '@/styles/theme';

<View style={{ backgroundColor: YYTheme.colors.primary }}>
<View style={{ backgroundColor: YYTheme.colors.primary }}>
```

### 3. Oublier le padding bottom pour FloatingTabBar

**❌ Erreur:**
```typescript
<ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
// Le contenu est caché par la barre de navigation
```

**✅ Solution:**
```typescript
<YYScreenContainer scrollable>
// Padding bottom automatique (140px)
```

---

## 📞 Support

Si vous rencontrez des problèmes lors de la migration:

1. Consulter ce guide
2. Vérifier les exemples dans `docs/QUICK_START_YY_COMPONENTS.md`
3. Consulter le code source des composants dans `components/YY/`
4. Vérifier le thème dans `styles/theme.ts`

---

**Version:** 1.0.0  
**Date:** 2024  
**Auteur:** Équipe Yombal Yoon

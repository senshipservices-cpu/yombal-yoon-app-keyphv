
# PARTIE 1 — STRUCTURE GLOBALE & PRINCIPES UI (COMMUNS)

## 1. Vision UI globale

### Objectif
Créer une application :
- **Moderne**
- **Dynamique**
- **Professionnelle**
- **Ancrée au Sénégal 🇸🇳** sans être "chargée drapeau"

### Principes de couleur
- 👉 **Le VERT porte la marque**
- 👉 **Le JAUNE déclenche l'action**
- 👉 **Le ROUGE signale** (alertes, badges)

---

## 2. Design System commun (socle)

### Couleurs

#### Couleurs principales
```typescript
{
  // Vert marque - LE VERT PORTE LA MARQUE
  primary: '#0B7A3B',
  
  // Vert foncé
  primaryDark: '#064A26',
  
  // Jaune CTA - LE JAUNE DÉCLENCHE L'ACTION
  secondary: '#F7C948',
  
  // Rouge alerte - LE ROUGE SIGNALE
  accent: '#E53935',
}
```

#### Couleurs de fond
```typescript
{
  background: '#F7F8FA',      // Fond principal
  card: '#FFFFFF',            // Cards blanches
}
```

#### Couleurs de texte
```typescript
{
  text: '#101828',            // Texte principal
  textSecondary: '#666666',   // Texte secondaire
}
```

---

## 3. Composants transversaux

### Cards
- **Border radius**: 18–20
- **Ombre**: douce (shadowOpacity: 0.08)
- **Background**: `#FFFFFF`

```typescript
// Exemple d'utilisation
<YYCard variant="base">
  {/* Contenu */}
</YYCard>

<YYCard variant="elevated">
  {/* Contenu avec ombre plus prononcée */}
</YYCard>
```

### Boutons

#### Primaire: JAUNE plein
```typescript
<YYButton variant="primary" onPress={handlePress}>
  Action principale
</YYButton>
```
- Background: `#F7C948` (JAUNE)
- Texte: `#101828` (foncé)

#### Secondaire: contour VERT
```typescript
<YYButton variant="secondary" onPress={handlePress}>
  Action secondaire
</YYButton>
```
- Background: transparent
- Border: 2px `#0B7A3B` (VERT)
- Texte: `#0B7A3B` (VERT)

#### Destructif: texte ROUGE
```typescript
<YYButton variant="destructive" onPress={handlePress}>
  Supprimer
</YYButton>
```
- Background: transparent
- Texte: `#E53935` (ROUGE)

---

## 4. Bottom Tab Bar

### Onglet actif
- **Capsule VERTE**: `#0B7A3B` avec opacité
- **Icône**: `#0B7A3B` (VERT)
- **Label**: `#0B7A3B` (VERT), fontWeight: '700'

### Onglet inactif
- **Icône**: gris (`#666666`)
- **Label**: gris (`#666666`)

```typescript
// Exemple d'utilisation
<FloatingTabBar
  tabs={[
    { name: 'home', route: '/(tabs)/(home)', icon: 'home', label: 'Accueil' },
    { name: 'covoiturage', route: '/(tabs)/covoiturage', icon: 'directions-car', label: 'Covoiturage' },
  ]}
/>
```

---

## 5. Feedback

### Succès: toast vert
```typescript
// Toast de succès
backgroundColor: '#0B7A3B'  // VERT
```

### Erreur: toast rouge
```typescript
// Toast d'erreur
backgroundColor: '#E53935'  // ROUGE
```

### Loading: spinner + texte
```typescript
<YYButton variant="primary" loading={true}>
  Chargement...
</YYButton>
```

---

## 6. Utilisation dans le code

### Import du Design System
```typescript
import { YYTheme } from '@/styles/theme';
import { YYButton, YYCard, YYBadge, YYChip } from '@/components/YY';
```

### Exemples d'utilisation

#### Boutons
```typescript
// Bouton primaire (JAUNE)
<YYButton variant="primary" onPress={handleSubmit}>
  Publier
</YYButton>

// Bouton secondaire (contour VERT)
<YYButton variant="secondary" onPress={handleCancel}>
  Annuler
</YYButton>

// Bouton destructif (texte ROUGE)
<YYButton variant="destructive" onPress={handleDelete}>
  Supprimer
</YYButton>
```

#### Cards
```typescript
// Card standard (radius 18)
<YYCard variant="base">
  <Text>Contenu de la card</Text>
</YYCard>

// Card élevée (radius 20)
<YYCard variant="elevated">
  <Text>Contenu avec ombre plus prononcée</Text>
</YYCard>
```

#### Badges
```typescript
// Badge VERT (marque)
<YYBadge variant="primary">Nouveau</YYBadge>

// Badge JAUNE (action)
<YYBadge variant="secondary">En attente</YYBadge>

// Badge ROUGE (alerte)
<YYBadge variant="accent">Urgent</YYBadge>
```

---

## 7. Fichiers modifiés

### Styles
- `styles/designSystem.ts` - Design system complet
- `styles/commonStyles.ts` - Styles communs
- `styles/theme.ts` - Thème YYTheme

### Composants
- `components/YY/YYButton.tsx` - Boutons
- `components/YY/YYCard.tsx` - Cards
- `components/YY/YYBadge.tsx` - Badges
- `components/YY/YYChip.tsx` - Chips
- `components/FloatingTabBar.tsx` - Bottom Tab Bar

---

## 8. Checklist d'implémentation

- [x] Mise à jour de la palette de couleurs
  - [x] Vert marque: `#0B7A3B`
  - [x] Vert foncé: `#064A26`
  - [x] Jaune CTA: `#F7C948`
  - [x] Rouge alerte: `#E53935`
  - [x] Fond: `#F7F8FA`
  - [x] Cards: `#FFFFFF`
  - [x] Texte principal: `#101828`

- [x] Mise à jour des composants
  - [x] Cards: radius 18–20, ombre douce
  - [x] Boutons:
    - [x] Primaire: JAUNE plein
    - [x] Secondaire: contour VERT
    - [x] Destructif: texte ROUGE
  - [x] Bottom Tab Bar:
    - [x] Onglet actif: capsule VERTE
    - [x] Onglet inactif: icône gris

- [x] Feedback:
  - [x] Succès: toast vert
  - [x] Erreur: toast rouge
  - [x] Loading: spinner + texte

---

## 9. Prochaines étapes

Pour appliquer ce design system à l'ensemble de l'application:

1. **Mettre à jour les écrans existants** pour utiliser les nouveaux composants YY
2. **Remplacer les boutons** par `<YYButton>` avec les bonnes variantes
3. **Remplacer les cards** par `<YYCard>` avec les bonnes variantes
4. **Utiliser les badges** `<YYBadge>` pour les alertes et statuts
5. **Vérifier les toasts** pour qu'ils utilisent les bonnes couleurs (vert/rouge)

---

## 10. Notes importantes

⚠️ **IMPORTANT**: 
- Ne jamais utiliser de couleurs hardcodées dans les composants
- Toujours importer et utiliser les tokens de `@/styles/theme`
- Le VERT porte la marque
- Le JAUNE déclenche l'action
- Le ROUGE signale (alertes, badges)

---

## 11. Support

Pour toute question sur le design system, consulter:
- `styles/theme.ts` - Définitions complètes
- `components/YY/` - Composants YY
- Cette documentation

---

**Date de création**: ${new Date().toLocaleDateString('fr-FR')}
**Version**: 1.0.0
**Statut**: ✅ Implémenté

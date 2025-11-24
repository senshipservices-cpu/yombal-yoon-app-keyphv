
# Guide de Démarrage Rapide - Composants Yombal Yoon

## 🚀 Utilisation Immédiate

### 1. Importer les Composants

```typescript
import { 
  YYButton, 
  YYCard, 
  YYScreenContainer,
  YYFormField,
  YYBadge,
  YYChip 
} from '@/components/YY';
import { YYTheme } from '@/styles/theme';
```

---

## 📦 Exemples Pratiques

### Écran Complet

```typescript
import { YYScreenContainer, YYButton, YYCard } from '@/components/YY';
import { YYTheme } from '@/styles/theme';
import { Text } from 'react-native';

export default function MyScreen() {
  return (
    <YYScreenContainer scrollable>
      <Text style={YYTheme.typography.h1}>
        Mon Écran
      </Text>
      
      <YYCard variant="elevated">
        <Text style={YYTheme.typography.bodyMedium}>
          Contenu de la carte
        </Text>
      </YYCard>
      
      <YYButton 
        variant="primary" 
        fullWidth
        onPress={() => console.log('Pressed')}
      >
        Action Principale
      </YYButton>
    </YYScreenContainer>
  );
}
```

### Formulaire

```typescript
import { YYScreenContainer, YYFormField, YYButton } from '@/components/YY';
import { useState } from 'react';

export default function FormScreen() {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <YYScreenContainer scrollable>
      <YYFormField
        label="Ville de départ"
        placeholder="Ex: Dakar"
        required
        value={departure}
        onChangeText={setDeparture}
        error={errors.departure}
      />
      
      <YYFormField
        label="Ville d'arrivée"
        placeholder="Ex: Saint-Louis"
        required
        value={arrival}
        onChangeText={setArrival}
        error={errors.arrival}
      />
      
      <YYButton 
        variant="primary" 
        fullWidth
        onPress={handleSubmit}
      >
        Rechercher
      </YYButton>
    </YYScreenContainer>
  );
}
```

### Liste avec Cartes

```typescript
import { YYScreenContainer, YYCard, YYBadge } from '@/components/YY';
import { YYTheme } from '@/styles/theme';
import { Text, View } from 'react-native';

export default function ListScreen() {
  const items = [
    { id: 1, title: 'Trajet 1', status: 'Actif' },
    { id: 2, title: 'Trajet 2', status: 'Terminé' },
  ];

  return (
    <YYScreenContainer scrollable>
      {items.map(item => (
        <YYCard 
          key={item.id}
          variant="elevated"
          onPress={() => console.log('Card pressed')}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={YYTheme.typography.h4}>
              {item.title}
            </Text>
            <YYBadge variant="success" size="small">
              {item.status}
            </YYBadge>
          </View>
        </YYCard>
      ))}
    </YYScreenContainer>
  );
}
```

### Filtres avec Chips

```typescript
import { YYScreenContainer, YYChip } from '@/components/YY';
import { View } from 'react-native';
import { useState } from 'react';

export default function FilterScreen() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  
  const regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack'];
  
  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  return (
    <YYScreenContainer scrollable>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {regions.map(region => (
          <YYChip
            key={region}
            selected={selectedRegions.includes(region)}
            onPress={() => toggleRegion(region)}
          >
            {region}
          </YYChip>
        ))}
      </View>
    </YYScreenContainer>
  );
}
```

---

## 🎨 Utilisation du Thème

### Couleurs

```typescript
import { YYTheme } from '@/styles/theme';

// Couleurs de marque
YYTheme.colors.primary      // Vert
YYTheme.colors.secondary    // Jaune
YYTheme.colors.accent       // Rouge

// Couleurs de fond
YYTheme.colors.background.light
YYTheme.colors.background.white
YYTheme.colors.background.dark
YYTheme.colors.background.darkCard

// Couleurs de texte
YYTheme.colors.text.primary
YYTheme.colors.text.secondary
YYTheme.colors.text.inverse
```

### Typographie

```typescript
import { YYTheme } from '@/styles/theme';

<Text style={YYTheme.typography.h1}>Titre Principal</Text>
<Text style={YYTheme.typography.h2}>Sous-titre</Text>
<Text style={YYTheme.typography.bodyMedium}>Texte normal</Text>
<Text style={YYTheme.typography.caption}>Petite légende</Text>
```

### Espacements

```typescript
import { YYTheme } from '@/styles/theme';

<View style={{ 
  padding: YYTheme.spacing.md,
  gap: YYTheme.spacing.sm 
}}>
```

### Ombres

```typescript
import { YYTheme } from '@/styles/theme';

<View style={[
  { backgroundColor: 'white' },
  YYTheme.shadows.md
]}>
```

---

## ✅ Checklist Avant de Commencer

- [ ] Importer `YYTheme` pour les couleurs et styles
- [ ] Utiliser `YYScreenContainer` pour tous les écrans
- [ ] Remplacer les `TouchableOpacity` par `YYButton`
- [ ] Remplacer les `View` de cartes par `YYCard`
- [ ] Utiliser `YYFormField` pour tous les inputs
- [ ] Ne jamais utiliser de couleurs en dur
- [ ] Tester sur Web, iOS et Android

---

## 🔗 Liens Utiles

- Documentation complète: `docs/VISUAL_CONSISTENCY_IMPLEMENTATION.md`
- Configuration navigation: `config/navigationConfig.ts`
- Thème complet: `styles/theme.ts`
- Composants: `components/YY/`

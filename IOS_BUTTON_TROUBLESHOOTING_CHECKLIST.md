
# iOS Button Troubleshooting Checklist - "Publier un trajet"

## 🔍 Problème Identifié

Sur iOS, le bouton "Publier un trajet" ne fonctionne pas, alors qu'il fonctionne sur Android.

**Erreurs détectées dans les logs Supabase:**
- `POST | 409` sur `/rest/v1/carpool_rides` - Conflit lors de l'insertion du trajet
- `POST | 409` sur `/rest/v1/wallets` - Conflit lors de la création du wallet
- `GET | 406` sur `/rest/v1/wallets` - En-têtes de requête incorrects

## ✅ Checklist de Vérification iOS

### 1. **Différences de Configuration Android / iOS**

#### A. Actions du Bouton
- ✅ **Vérifier que `onPress` est bien déclenché sur iOS**
  - Ajouter `console.log('[publish-ride.ios] Button pressed')` au début de `handleSubmit`
  - Vérifier dans les logs Expo si le message apparaît
  
- ✅ **Vérifier l'état `isSubmitting`**
  - Sur iOS, il y a une protection contre les doubles clics
  - Vérifier que `isSubmitting` est bien remis à `false` en cas d'erreur
  
- ✅ **Vérifier les permissions de toucher**
  - S'assurer qu'aucun overlay ou modal ne bloque le bouton
  - Vérifier le `zIndex` des composants

#### B. Permissions Réseau / Supabase
- ✅ **Vérifier les en-têtes HTTP**
  - iOS peut avoir des restrictions sur les en-têtes CORS
  - Vérifier que `apikey` et `Authorization` sont bien envoyés
  
- ✅ **Vérifier la configuration Supabase**
  - URL Supabase correcte dans `config/supabase.ts`
  - Clé API (anon key) valide
  - Pas de différence entre les builds iOS/Android

#### C. Gestion des Erreurs Spécifiques iOS
- ❌ **Erreur 409 (Conflict) détectée**
  - **Cause probable:** Tentative d'insertion d'un trajet ou wallet qui existe déjà
  - **Solution:** Vérifier l'unicité du `user_id` et des contraintes de base de données
  
- ❌ **Erreur 406 (Not Acceptable) détectée**
  - **Cause probable:** En-têtes de requête incorrects ou manquants
  - **Solution:** Vérifier que `Accept: application/json` est bien envoyé

### 2. **Bugs Connus iOS dans React Native / Expo 54**

#### A. Problèmes de Timing
- ⚠️ **Race Conditions**
  - iOS peut exécuter les requêtes asynchrones différemment d'Android
  - Utiliser `await` correctement dans toutes les opérations async
  - Ajouter des délais entre les opérations si nécessaire

#### B. Problèmes de State Management
- ⚠️ **State Updates**
  - iOS peut avoir des problèmes avec les mises à jour d'état rapides
  - Utiliser `useCallback` et `useMemo` pour optimiser les re-renders
  - Éviter les mises à jour d'état pendant les opérations async

#### C. Problèmes de Formulaires
- ⚠️ **Keyboard Handling**
  - `KeyboardAvoidingView` peut causer des problèmes sur iOS
  - Vérifier que le bouton est bien visible quand le clavier est ouvert
  - Utiliser `keyboardShouldPersistTaps="handled"` sur `ScrollView`

### 3. **Recommandations Spécifiques iOS**

#### A. Logging Détaillé
```typescript
console.log('[publish-ride.ios] ========================================');
console.log('[publish-ride.ios] 🚀 SUBMIT STARTED');
console.log('[publish-ride.ios] Platform:', Platform.OS);
console.log('[publish-ride.ios] User ID:', userId);
console.log('[publish-ride.ios] Form Data:', { departureCity, arrivalCity, ... });
```

#### B. Gestion des Erreurs Supabase
```typescript
try {
  const { data, error } = await supabase.from('carpool_rides').insert(...);
  
  if (error) {
    console.error('[publish-ride.ios] Supabase Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // Afficher l'erreur à l'utilisateur
    Alert.alert('Erreur Supabase', `${error.message}\n\nCode: ${error.code}`);
    return;
  }
} catch (error) {
  console.error('[publish-ride.ios] Exception:', error);
}
```

#### C. Vérification des Contraintes de Base de Données
```sql
-- Vérifier les contraintes sur carpool_rides
SELECT * FROM pg_constraint 
WHERE conrelid = 'carpool_rides'::regclass;

-- Vérifier les index uniques
SELECT * FROM pg_indexes 
WHERE tablename = 'carpool_rides';
```

### 4. **Actions Immédiates à Prendre**

#### Étape 1: Activer les Logs Détaillés
- ✅ Les logs sont déjà activés dans `publish-ride.ios.tsx`
- Vérifier les logs dans Expo avec `npx expo start --ios`

#### Étape 2: Identifier l'Erreur Exacte
- ❌ **Erreur 409 identifiée** - Conflit d'insertion
- Vérifier si le `user_id` est unique
- Vérifier si un trajet similaire existe déjà

#### Étape 3: Corriger le Problème de Wallet
- Le wallet doit être créé **avant** l'insertion du trajet
- Utiliser `ensureProfileAndWallet()` avec retry logic
- Gérer les erreurs 409 (wallet déjà existant)

#### Étape 4: Corriger le Problème de Trajet
- Vérifier les contraintes `UNIQUE` sur `carpool_rides`
- Gérer les erreurs 409 (trajet déjà existant)
- Ajouter une vérification avant insertion

### 5. **Différences Clés Android vs iOS**

| Aspect | Android | iOS | Solution |
|--------|---------|-----|----------|
| **Timing des requêtes** | Plus tolérant | Plus strict | Ajouter `await` partout |
| **Gestion des erreurs** | Silencieuse | Plus stricte | Afficher toutes les erreurs |
| **State updates** | Rapide | Peut être lent | Utiliser `useCallback` |
| **Keyboard** | Gère bien | Peut cacher le bouton | `KeyboardAvoidingView` |
| **CORS / Headers** | Moins strict | Plus strict | Vérifier les en-têtes |
| **Contraintes DB** | Tolère les doublons | Rejette immédiatement | Vérifier avant insertion |

### 6. **Tests à Effectuer**

#### Test 1: Vérifier que le bouton est cliquable
```typescript
// Dans handleSubmit
console.log('[TEST] Button clicked!');
Alert.alert('Test', 'Button is working!');
```

#### Test 2: Vérifier la connexion Supabase
```typescript
// Avant l'insertion
const { data: testData, error: testError } = await supabase
  .from('carpool_rides')
  .select('count')
  .limit(1);
  
console.log('[TEST] Supabase connection:', { testData, testError });
```

#### Test 3: Vérifier le user_id
```typescript
const userId = await getOrCreateUserId();
console.log('[TEST] User ID:', userId);

// Vérifier si le profil existe
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
  
console.log('[TEST] Profile exists:', !!profile);
```

#### Test 4: Vérifier le wallet
```typescript
const { data: wallet } = await supabase
  .from('wallets')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
  
console.log('[TEST] Wallet exists:', !!wallet);
```

### 7. **Solutions Proposées**

#### Solution 1: Gérer les Erreurs 409 (Recommandé)
```typescript
// Dans addRide (CovoiturageContext.tsx)
const { data, error } = await supabase
  .from('carpool_rides')
  .insert(supabaseData)
  .select()
  .single();

if (error) {
  if (error.code === '23505') {
    // Duplicate entry
    console.log('[publish-ride.ios] Ride already exists, fetching existing ride...');
    // Récupérer le trajet existant au lieu de créer un nouveau
  } else if (error.code === '23503') {
    // Foreign key violation
    console.log('[publish-ride.ios] Profile/Wallet missing, creating...');
    await ensureProfileAndWallet(userId);
    // Réessayer l'insertion
  }
}
```

#### Solution 2: Vérifier Avant d'Insérer
```typescript
// Avant l'insertion du trajet
const { data: existingRide } = await supabase
  .from('carpool_rides')
  .select('*')
  .eq('driver_id', userId)
  .eq('departure_city', departureCity)
  .eq('arrival_city', arrivalCity)
  .eq('departure_datetime', departureDatetime)
  .maybeSingle();

if (existingRide) {
  Alert.alert('Trajet existant', 'Ce trajet existe déjà.');
  return;
}
```

#### Solution 3: Retry Logic avec Backoff
```typescript
async function insertRideWithRetry(data: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: ride, error } = await supabase
        .from('carpool_rides')
        .insert(data)
        .select()
        .single();
        
      if (!error) return ride;
      
      if (error.code === '23503' && i < retries - 1) {
        // Foreign key violation - wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw error;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

## 🎯 Actions Prioritaires

1. **Immédiat:** Vérifier les logs Expo sur iOS pour voir l'erreur exacte
2. **Court terme:** Implémenter la gestion des erreurs 409 et 406
3. **Moyen terme:** Ajouter une vérification avant insertion
4. **Long terme:** Implémenter un système de retry avec backoff

## 📝 Notes Importantes

- Les erreurs 409 indiquent un problème de contraintes de base de données
- iOS est plus strict qu'Android sur les contraintes et les en-têtes HTTP
- Toujours utiliser `await` pour les opérations asynchrones
- Afficher les erreurs détaillées à l'utilisateur pour le debugging
- Utiliser `ensureProfileAndWallet()` avant toute opération nécessitant un profil/wallet

## 🔗 Fichiers Concernés

- `app/covoiturage/publish-ride.ios.tsx` - Écran de publication (iOS)
- `app/covoiturage/publish-ride.tsx` - Écran de publication (Android/Web)
- `contexts/CovoiturageContext.tsx` - Logique métier
- `utils/profileWalletUtils.ts` - Gestion profil/wallet
- `config/supabase.ts` - Configuration Supabase

## ✅ Checklist de Validation

- [ ] Le bouton est cliquable sur iOS
- [ ] Les logs montrent que `handleSubmit` est appelé
- [ ] Le `user_id` est correctement généré
- [ ] Le profil existe dans `user_profiles`
- [ ] Le wallet existe dans `wallets`
- [ ] L'insertion du trajet réussit
- [ ] Un message de succès s'affiche
- [ ] Le trajet apparaît dans "Mes trajets publiés"

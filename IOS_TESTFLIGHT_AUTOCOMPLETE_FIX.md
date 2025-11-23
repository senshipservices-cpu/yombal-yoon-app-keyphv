
# 🔧 Fix: Autocomplete ne fonctionne pas sur iOS Testflight

## 📋 Problème

L'autocomplétion d'adresses dans le module **"Envoi de colis"** fonctionne correctement sur **Web** mais **ne fonctionne pas** lors des tests **Testflight sur iPhone physique**.

## 🔍 Diagnostic

### Symptômes observés
- ✅ L'autocomplétion fonctionne parfaitement sur Web
- ❌ L'autocomplétion ne fonctionne pas sur iPhone physique (Testflight)
- ❌ Aucune suggestion n'apparaît lors de la saisie
- ❌ Possibles erreurs de timeout ou de connexion

### Causes possibles identifiées

1. **App Transport Security (ATS) sur iOS**
   - iOS impose des restrictions strictes sur les connexions réseau
   - Les connexions HTTP non sécurisées sont bloquées par défaut
   - Les connexions HTTPS doivent respecter des normes de sécurité strictes

2. **Timeouts réseau sur appareils physiques**
   - Les appareils physiques peuvent avoir des connexions plus lentes
   - Les timeouts par défaut (10s) peuvent être trop courts
   - Les réseaux mobiles (3G/4G) sont plus lents que le WiFi

3. **Gestion des requêtes concurrentes**
   - Plusieurs requêtes peuvent être envoyées en même temps
   - Les anciennes requêtes doivent être annulées
   - Besoin d'un système d'abort pour les requêtes obsolètes

4. **Logs et debugging insuffisants**
   - Difficile de diagnostiquer les problèmes sans logs détaillés
   - Besoin de logs spécifiques pour iOS
   - Besoin d'alertes de debug en mode développement

## ✅ Solutions implémentées

### 1. Configuration App Transport Security (ATS)

**Fichier modifié:** `app.json`

Ajout de la configuration ATS pour autoriser les connexions sécurisées vers Supabase:

```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false,
        "NSExceptionDomains": {
          "supabase.co": {
            "NSExceptionAllowsInsecureHTTPLoads": false,
            "NSIncludesSubdomains": true,
            "NSExceptionRequiresForwardSecrecy": true,
            "NSExceptionMinimumTLSVersion": "TLSv1.2"
          },
          "drxtaxepofuoelplgrei.supabase.co": {
            "NSExceptionAllowsInsecureHTTPLoads": false,
            "NSIncludesSubdomains": true,
            "NSExceptionRequiresForwardSecrecy": true,
            "NSExceptionMinimumTLSVersion": "TLSv1.2"
          }
        }
      }
    }
  }
}
```

**Pourquoi c'est important:**
- ✅ Autorise explicitement les connexions HTTPS vers Supabase
- ✅ Maintient la sécurité (pas de HTTP non sécurisé)
- ✅ Utilise TLS 1.2 minimum (standard de sécurité)
- ✅ Inclut tous les sous-domaines de Supabase

### 2. Timeouts adaptés pour iOS

**Fichier modifié:** `components/AddressAutocomplete.tsx`

Augmentation des timeouts pour les appareils iOS:

```typescript
// iOS-specific: Use longer timeout for physical devices
const timeout = Platform.OS === 'ios' ? 15000 : 10000;
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Request timeout')), timeout);
});

const fetchPromise = supabase.functions.invoke('google-places-proxy', {
  body: requestBody,
  headers: {
    'x-platform': Platform.OS,
    'Content-Type': 'application/json',
  },
});

const { data, error } = await Promise.race([
  fetchPromise,
  timeoutPromise,
]) as any;
```

**Pourquoi c'est important:**
- ✅ 15 secondes pour iOS (vs 10s pour Android/Web)
- ✅ Prend en compte les connexions mobiles plus lentes
- ✅ Évite les timeouts prématurés
- ✅ Message d'erreur clair en cas de timeout

### 3. Gestion des requêtes concurrentes

**Fichier modifié:** `components/AddressAutocomplete.tsx`

Ajout d'un système d'abort pour annuler les requêtes obsolètes:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

// Cancel any pending request
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}

// Create new abort controller for this request
abortControllerRef.current = new AbortController();
```

**Pourquoi c'est important:**
- ✅ Annule les anciennes requêtes quand l'utilisateur continue de taper
- ✅ Évite les conflits entre plusieurs requêtes
- ✅ Améliore les performances
- ✅ Réduit la charge réseau

### 4. Logs et debugging améliorés

**Fichier modifié:** `components/AddressAutocomplete.tsx`

Ajout de logs détaillés et d'alertes de debug pour iOS:

```typescript
console.log('🔍 [AddressAutocomplete] Fetching predictions for:', input);
console.log('📱 [AddressAutocomplete] Platform:', Platform.OS);
console.log('📤 [AddressAutocomplete] Request body:', JSON.stringify(requestBody));
console.log(`⏱️ [AddressAutocomplete] Response time: ${responseTime}ms`);
console.log('📦 [AddressAutocomplete] Response status:', data?.status);

// Show detailed error on iOS for debugging
if (Platform.OS === 'ios' && __DEV__) {
  Alert.alert(
    'Debug Info (iOS)',
    `Error: ${error.message || 'Unknown error'}\n\nTime: ${responseTime}ms\n\nDetails: ${JSON.stringify(error, null, 2)}`,
    [{ text: 'OK' }]
  );
}
```

**Pourquoi c'est important:**
- ✅ Logs détaillés dans la console pour diagnostiquer les problèmes
- ✅ Alertes de debug en mode développement uniquement
- ✅ Informations sur le temps de réponse
- ✅ Détails complets des erreurs

### 5. Messages d'erreur améliorés

**Fichier modifié:** `components/AddressAutocomplete.tsx`

Ajout de messages d'erreur clairs et d'astuces pour l'utilisateur:

```typescript
{apiError && (
  <View style={[styles.errorContainer, { backgroundColor: '#FF000020' }]}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <View style={styles.errorTextContainer}>
      <Text style={[styles.errorText, { color: '#FF0000' }]}>
        {apiError}
      </Text>
      {Platform.OS === 'ios' && (
        <Text style={[styles.errorHint, { color: '#FF0000' }]}>
          Astuce: Vérifiez votre connexion internet
        </Text>
      )}
    </View>
  </View>
)}
```

**Pourquoi c'est important:**
- ✅ Messages d'erreur clairs et compréhensibles
- ✅ Astuces spécifiques pour iOS
- ✅ Interface utilisateur cohérente
- ✅ Feedback visuel immédiat

## 🧪 Tests à effectuer

### 1. Test sur Testflight (iPhone physique)

1. **Installer la nouvelle version** depuis Testflight
2. **Ouvrir l'app** et aller dans "Envoi de Colis"
3. **Taper dans le champ "Adresse de départ"**
   - Exemple: "Plateau"
   - Exemple: "Parcelles Assainies"
   - Exemple: "Marché Sandaga"
4. **Vérifier que les suggestions apparaissent** (délai max 15s)
5. **Sélectionner une suggestion** et vérifier qu'elle est bien appliquée

### 2. Test avec différentes connexions

- ✅ WiFi rapide
- ✅ WiFi lent
- ✅ 4G
- ✅ 3G
- ✅ Mode avion → WiFi (pour tester la reconnexion)

### 3. Test des cas d'erreur

- ✅ Pas de connexion internet → Message d'erreur clair
- ✅ Connexion très lente → Timeout après 15s avec message
- ✅ Aucun résultat trouvé → Message "Aucun résultat trouvé"

### 4. Vérifier les logs (mode développement)

Si vous testez en mode développement, vous devriez voir:

```
🔍 [AddressAutocomplete] Fetching predictions for: plateau
📱 [AddressAutocomplete] Platform: ios
📤 [AddressAutocomplete] Request body: {"action":"autocomplete","input":"plateau",...}
⏱️ [AddressAutocomplete] Response time: 234ms
📦 [AddressAutocomplete] Response status: OK
✅ [AddressAutocomplete] Found 5 predictions
```

## 📊 Checklist de vérification

Avant de déployer sur Testflight:

- [x] Configuration ATS ajoutée dans `app.json`
- [x] Timeouts augmentés pour iOS (15s)
- [x] Système d'abort des requêtes implémenté
- [x] Logs détaillés ajoutés
- [x] Messages d'erreur améliorés
- [x] Header `Content-Type: application/json` ajouté
- [x] Gestion des timeouts avec messages clairs

Après déploiement sur Testflight:

- [ ] Test sur iPhone physique avec WiFi
- [ ] Test sur iPhone physique avec 4G
- [ ] Test avec connexion lente
- [ ] Test des cas d'erreur
- [ ] Vérification des logs dans la console

## 🎯 Résultat attendu

Après avoir appliqué ces corrections:

- ✅ L'autocomplétion fonctionne sur iOS Testflight
- ✅ Les suggestions apparaissent dans les 15 secondes maximum
- ✅ Les erreurs sont clairement affichées à l'utilisateur
- ✅ Les logs permettent de diagnostiquer les problèmes
- ✅ L'expérience utilisateur est cohérente entre Web et iOS

## 🆘 En cas de problème persistant

Si l'autocomplétion ne fonctionne toujours pas après ces corrections:

### 1. Vérifier les logs de l'Edge Function

```bash
supabase functions logs google-places-proxy --project-ref drxtaxepofuoelplgrei
```

Recherchez:
- Les requêtes provenant de la plateforme `ios`
- Les erreurs `REQUEST_DENIED` ou `OVER_QUERY_LIMIT`
- Les temps de réponse anormalement longs

### 2. Vérifier la clé API Google Maps

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Vérifiez que la clé API n'a **PAS** de restrictions HTTP referrer
3. Vérifiez que ces APIs sont activées:
   - Places API
   - Places API (New)
   - Geocoding API
   - Distance Matrix API
4. Vérifiez que la facturation est activée

### 3. Tester avec des logs de debug

En mode développement, des alertes s'afficheront automatiquement sur iOS avec:
- Le message d'erreur complet
- Le temps de réponse
- Les détails de l'erreur

### 4. Vérifier la connexion réseau

Sur l'iPhone de test:
1. Ouvrez Safari
2. Allez sur `https://drxtaxepofuoelplgrei.supabase.co`
3. Vérifiez que la page se charge (même si elle affiche une erreur 404, c'est normal)
4. Si la page ne se charge pas, il y a un problème de connexion réseau

## 📝 Fichiers modifiés

1. **`app.json`**
   - Ajout de la configuration App Transport Security (ATS)
   - Configuration des domaines Supabase autorisés

2. **`components/AddressAutocomplete.tsx`**
   - Timeouts adaptés pour iOS (15s)
   - Système d'abort des requêtes
   - Logs détaillés
   - Alertes de debug pour iOS
   - Messages d'erreur améliorés
   - Header `Content-Type` ajouté

## 🎉 Conclusion

Ces modifications devraient résoudre le problème d'autocomplétion sur iOS Testflight. Les principales améliorations sont:

1. **Sécurité réseau** - Configuration ATS correcte
2. **Performance** - Timeouts adaptés aux connexions mobiles
3. **Fiabilité** - Gestion des requêtes concurrentes
4. **Debugging** - Logs détaillés et alertes de debug
5. **UX** - Messages d'erreur clairs et astuces

Si le problème persiste, les logs détaillés permettront de diagnostiquer rapidement la cause exacte.


# 🚀 Actions Immédiates - Vérification Google Maps

## ⏱️ Temps Estimé : 10 minutes

## 📋 Checklist Rapide

### ✅ Étape 1 : Vérifier la Configuration Google Cloud (5 min)

1. **Ouvrir Google Cloud Console**
   - Allez sur https://console.cloud.google.com/
   - Sélectionnez votre projet

2. **Vérifier la Clé Serveur**
   - Menu : **APIs & Services** > **Credentials**
   - Trouvez : `GOOGLE_MAPS_API_KEY_SERVER`
   - Cliquez dessus

3. **Vérifier les Restrictions**
   ```
   ✅ Application restrictions: None
   ❌ PAS : HTTP referrers
   ❌ PAS : Android apps
   ❌ PAS : iOS apps
   ```

4. **Vérifier les APIs Autorisées**
   ```
   ✅ Places API (New)
   ✅ Places API
   ✅ Geocoding API
   ✅ Distance Matrix API
   ```

5. **Si Modifications Nécessaires**
   - Modifiez la configuration
   - Cliquez sur **Save**
   - ⏰ **ATTENDEZ 5 MINUTES** avant de tester

### ✅ Étape 2 : Vérifier la Facturation (2 min)

1. **Ouvrir la Facturation**
   - Menu : **Billing**

2. **Vérifier**
   - [ ] Un compte de facturation est lié
   - [ ] La facturation est activée

3. **Si Non Configuré**
   - Cliquez sur **Link a billing account**
   - Suivez les instructions

### ✅ Étape 3 : Tester l'Autocomplétion (3 min)

#### Option A : Test Rapide dans l'App

1. **Ouvrir Yombal Yoon**
2. **Aller dans Covoiturage** > **Publier un trajet**
3. **Taper dans "Ville de départ"** : `Dakar`
4. **Vérifier** : Des suggestions apparaissent ?

#### Option B : Test Automatique (Recommandé)

1. **Ajouter un bouton temporaire dans Profile**
   
   Modifiez `app/(tabs)/profile.tsx` ou `app/(tabs)/profile.ios.tsx` :
   
   ```typescript
   import { router } from 'expo-router';
   
   // Ajoutez ce bouton temporairement
   <TouchableOpacity
     style={styles.testButton}
     onPress={() => router.push('/test-google-maps')}
   >
     <Text style={styles.testButtonText}>🧪 Test Google Maps</Text>
   </TouchableOpacity>
   ```

2. **Ouvrir l'app** > **Profile** > **Test Google Maps**
3. **Cliquer sur** "▶️ Lancer les Tests"
4. **Attendre** les résultats (30 secondes)

## 📊 Interpréter les Résultats

### ✅ Scénario 1 : Tout Fonctionne

**Résultats des tests** :
```
✅ Connexion Supabase - Connexion établie
✅ Autocomplétion (Dakar) - 5 résultats trouvés
✅ Autocomplétion Ville (Thiès) - 3 résultats trouvés
✅ Détails du Lieu - Coordonnées récupérées
```

**Action** :
- ✅ Rien à faire !
- ✅ L'autocomplétion fonctionne
- ✅ Testez dans les vrais écrans de l'app
- ✅ Supprimez le bouton de test temporaire

### ❌ Scénario 2 : Erreur REQUEST_DENIED

**Résultats des tests** :
```
❌ Autocomplétion (Dakar) - Erreur Google: REQUEST_DENIED
```

**Cause** : La clé `GOOGLE_MAPS_API_KEY_SERVER` a des restrictions incompatibles.

**Action** :
1. Retournez à **Étape 1** ci-dessus
2. Vérifiez que "Application restrictions" = "None"
3. Vérifiez que les 4 APIs sont autorisées
4. Sauvegardez
5. ⏰ **ATTENDEZ 5 MINUTES**
6. Relancez les tests

### ❌ Scénario 3 : Erreur OVER_QUERY_LIMIT

**Résultats des tests** :
```
❌ Autocomplétion (Dakar) - Erreur Google: OVER_QUERY_LIMIT
```

**Cause** : Quota de requêtes dépassé.

**Action** :
1. Allez dans Google Cloud Console
2. Menu : **APIs & Services** > **Dashboard**
3. Cliquez sur chaque API (Places, Geocoding, Distance Matrix)
4. Vérifiez les quotas
5. Attendez la réinitialisation (généralement quotidienne)
6. Ou augmentez les quotas si nécessaire

### ❌ Scénario 4 : Erreur Supabase

**Résultats des tests** :
```
❌ Autocomplétion (Dakar) - Erreur Supabase: FunctionsHttpError
```

**Cause** : Problème de connexion ou Edge Function.

**Action** :
1. Vérifiez votre connexion internet
2. Allez sur Supabase Dashboard
3. Vérifiez que l'Edge Function `google-places-proxy` est déployée
4. Si non, redéployez-la
5. Relancez les tests

## 🎯 Résultat Attendu

Après avoir suivi ces étapes, vous devriez avoir :

1. ✅ Configuration Google Cloud correcte
2. ✅ Facturation activée
3. ✅ Tous les tests automatiques réussis
4. ✅ Autocomplétion fonctionnelle dans l'app

## 📞 Si Ça Ne Fonctionne Toujours Pas

Fournissez ces informations :

1. **Résultats des tests automatiques**
   - Copiez tout le contenu de la page `/test-google-maps`

2. **Captures d'écran Google Cloud Console**
   - Configuration de `GOOGLE_MAPS_API_KEY_SERVER`
   - Liste des APIs activées
   - État de la facturation

3. **Logs Supabase**
   - Allez dans Supabase Dashboard
   - Edge Functions > google-places-proxy > Logs
   - Copiez les derniers logs

4. **Plateforme(s) affectée(s)**
   - Web ? iOS ? Android ?

## ⏰ Timeline

- **Maintenant** : Vérifier la configuration Google Cloud (5 min)
- **+5 min** : Vérifier la facturation (2 min)
- **+7 min** : Lancer les tests (3 min)
- **+10 min** : Analyser les résultats et agir

## 🎉 Succès !

Si tous les tests réussissent, félicitations ! 🎊

L'autocomplétion Google Maps fonctionne maintenant sur toutes les plateformes.

Vous pouvez :
1. Supprimer le bouton de test temporaire
2. Tester dans les vrais écrans de l'app
3. Documenter la configuration finale
4. Passer à la suite du développement

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `GOOGLE_MAPS_SERVER_KEY_VERIFICATION.md` - Guide complet
- `QUICK_TEST_GUIDE.md` - Guide de test
- `SITUATION_ACTUELLE_GOOGLE_MAPS.md` - État actuel

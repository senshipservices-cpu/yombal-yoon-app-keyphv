
# 🧪 Guide de Test Rapide - Google Maps API

## 📱 Accéder à la Page de Test

### Option 1 : Ajouter un lien dans le menu Profile

1. Ouvrez l'app Yombal Yoon
2. Allez dans l'onglet **Profile**
3. Ajoutez temporairement un bouton "Test Google Maps" qui navigue vers `/test-google-maps`

### Option 2 : Navigation directe (Web uniquement)

Si vous êtes sur Web, ajoutez `/test-google-maps` à l'URL :
```
https://votre-app.natively.dev/test-google-maps
```

### Option 3 : Modifier temporairement l'écran d'accueil

Modifiez `app/(tabs)/(home)/index.tsx` pour ajouter un bouton de test temporaire.

## 🔍 Interpréter les Résultats

### ✅ Tous les tests réussis
```
✅ Connexion Supabase - Connexion établie
✅ Autocomplétion (Dakar) - 5 résultats trouvés
✅ Autocomplétion Ville (Thiès) - 3 résultats trouvés
✅ Détails du Lieu - Coordonnées récupérées
```

**Action** : Tout fonctionne ! L'autocomplétion devrait fonctionner dans toute l'app.

### ❌ Erreur REQUEST_DENIED
```
❌ Autocomplétion (Dakar) - Erreur Google: REQUEST_DENIED
```

**Cause** : La clé API `GOOGLE_MAPS_API_KEY_SERVER` a des restrictions incompatibles.

**Solution** :
1. Allez dans Google Cloud Console
2. Trouvez la clé `GOOGLE_MAPS_API_KEY_SERVER`
3. Supprimez toutes les restrictions d'application (sélectionnez "None")
4. Vérifiez que les APIs sont activées : Places API, Geocoding API, Distance Matrix API
5. Attendez 5 minutes
6. Relancez les tests

### ❌ Erreur Supabase
```
❌ Autocomplétion (Dakar) - Erreur Supabase: FunctionsHttpError
```

**Cause** : Problème de connexion ou Edge Function non déployée.

**Solution** :
1. Vérifiez votre connexion internet
2. Vérifiez que l'Edge Function est déployée dans Supabase Dashboard
3. Relancez les tests

### ❌ Erreur OVER_QUERY_LIMIT
```
❌ Autocomplétion (Dakar) - Erreur Google: OVER_QUERY_LIMIT
```

**Cause** : Quota de requêtes dépassé.

**Solution** :
1. Allez dans Google Cloud Console > APIs & Services > Dashboard
2. Vérifiez les quotas pour chaque API
3. Attendez la réinitialisation du quota (généralement quotidienne)
4. Ou augmentez les quotas si nécessaire

## 📊 Détails Affichés

Pour chaque test réussi, vous verrez :
- **Status** : OK
- **Predictions** : Liste des 3 premiers résultats
- **Response Time** : Temps de réponse en millisecondes
- **Platform** : Plateforme utilisée (web, ios, android)

Pour chaque test échoué, vous verrez :
- **Status** : Code d'erreur Google (REQUEST_DENIED, OVER_QUERY_LIMIT, etc.)
- **Error Message** : Message d'erreur détaillé
- **Help** : Suggestions de solutions
- **Debug** : Informations de diagnostic

## 🔄 Après les Tests

### Si tous les tests réussissent
1. Supprimez la page de test (ou gardez-la pour le debug futur)
2. Testez l'autocomplétion dans les vrais écrans :
   - Covoiturage > Publier un trajet
   - Envoi de colis > Envoyer un colis
   - Livraison inter régions

### Si des tests échouent
1. Notez les erreurs affichées
2. Suivez les solutions proposées dans `GOOGLE_MAPS_SERVER_KEY_VERIFICATION.md`
3. Relancez les tests après chaque modification
4. Attendez toujours 5 minutes après une modification dans Google Cloud Console

## 📸 Captures d'Écran

Prenez des captures d'écran des résultats pour :
- Documenter la configuration fonctionnelle
- Partager avec l'équipe
- Débugger les problèmes futurs

## 🗑️ Nettoyage

Une fois que tout fonctionne, vous pouvez :
1. Supprimer le fichier `app/test-google-maps.tsx`
2. Supprimer le lien de navigation vers cette page
3. Garder les fichiers de documentation pour référence future

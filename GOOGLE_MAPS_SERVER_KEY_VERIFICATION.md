
# ✅ VÉRIFICATION CONFIGURATION GOOGLE_MAPS_API_KEY_SERVER

## 📊 État Actuel

D'après les logs Supabase, l'Edge Function `google-places-proxy` fonctionne correctement :
- ✅ Version 42 déployée
- ✅ Codes HTTP 200 (succès) dans les logs récents
- ✅ Secret `GOOGLE_MAPS_API_KEY_SERVER` configuré dans Supabase

## 🔍 Étapes de Vérification

### 1️⃣ Vérifier la Clé API dans Google Cloud Console

#### A. Accéder à la clé
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Menu : **APIs & Services** > **Credentials**
4. Trouvez la clé `GOOGLE_MAPS_API_KEY_SERVER`

#### B. Vérifier les Restrictions d'Application
**IMPORTANT** : La clé serveur NE DOIT PAS avoir de restrictions HTTP referrers, Android, ou iOS.

✅ **Configuration correcte** :
```
Application restrictions: None
```

❌ **Configuration incorrecte** :
```
Application restrictions: HTTP referrers (web sites)
Application restrictions: Android apps
Application restrictions: iOS apps
```

**Si vous voyez une restriction** :
1. Cliquez sur la clé
2. Dans "Application restrictions", sélectionnez **"None"**
3. Cliquez sur **"Save"**
4. Attendez 5 minutes pour que les changements prennent effet

#### C. Vérifier les Restrictions d'API
✅ **APIs requises** (toutes doivent être cochées) :
- ✅ Places API (New)
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

**Si une API manque** :
1. Cliquez sur la clé
2. Dans "API restrictions", sélectionnez **"Restrict key"**
3. Cochez toutes les APIs listées ci-dessus
4. Cliquez sur **"Save"**
5. Attendez 5 minutes

### 2️⃣ Vérifier que les APIs sont Activées

1. Menu : **APIs & Services** > **Dashboard**
2. Cliquez sur **"+ ENABLE APIS AND SERVICES"**
3. Recherchez et activez (si pas déjà fait) :
   - **Places API (New)**
   - **Places API**
   - **Geocoding API**
   - **Distance Matrix API**

### 3️⃣ Vérifier la Facturation

⚠️ **CRITIQUE** : Sans facturation activée, les APIs ne fonctionneront pas.

1. Menu : **Billing**
2. Vérifiez qu'un compte de facturation est lié au projet
3. Si non, cliquez sur **"Link a billing account"**

### 4️⃣ Vérifier le Secret Supabase

D'après vos captures d'écran, le secret est bien configuré :
- ✅ `GOOGLE_MAPS_API_KEY_SERVER` visible dans les secrets Supabase

**Pour vérifier** :
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `drxtaxepofuoelplgrei`
3. Menu : **Project Settings** > **Edge Functions**
4. Vérifiez que `GOOGLE_MAPS_API_KEY_SERVER` est présent

### 5️⃣ Tester l'Edge Function

#### Test depuis le navigateur Web

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Remplacez YOUR_SUPABASE_ANON_KEY par votre clé anon
const supabaseUrl = 'https://drxtaxepofuoelplgrei.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

fetch(`${supabaseUrl}/functions/v1/google-places-proxy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'x-platform': 'web'
  },
  body: JSON.stringify({
    action: 'autocomplete',
    input: 'Dakar'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ Réponse:', data);
  if (data.status === 'OK') {
    console.log('✅ SUCCÈS ! Autocomplétion fonctionne');
    console.log(`📍 ${data.predictions.length} résultats trouvés`);
  } else {
    console.error('❌ ERREUR:', data.status);
    console.error('💬 Message:', data.error_message);
    console.error('🔧 Debug:', data.debug);
    console.error('📚 Aide:', data.help);
  }
})
.catch(err => console.error('❌ Exception:', err));
```

#### Résultats attendus

✅ **Succès** :
```json
{
  "status": "OK",
  "predictions": [
    {
      "description": "Dakar, Sénégal",
      "place_id": "ChIJ...",
      ...
    }
  ]
}
```

❌ **Erreur REQUEST_DENIED** :
```json
{
  "status": "REQUEST_DENIED",
  "error_message": "This API key is not authorized to use this service or API.",
  "help": {
    "message": "Vérifiez la configuration de GOOGLE_MAPS_API_KEY_SERVER",
    "causes": [
      "La clé API n'a pas les APIs activées",
      "La clé API a des restrictions incompatibles",
      "La facturation n'est pas activée",
      "La clé API est invalide"
    ]
  }
}
```

### 6️⃣ Vérifier les Logs de l'Edge Function

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Menu : **Edge Functions** > **google-places-proxy**
4. Cliquez sur **"Logs"**
5. Recherchez les messages d'erreur récents

**Messages à rechercher** :
- ✅ `✅ X résultats trouvés` = Succès
- ❌ `❌ ERREUR GOOGLE MAPS API` = Erreur Google
- ❌ `GOOGLE_MAPS_API_KEY_SERVER non configurée` = Secret manquant

## 🔧 Solutions aux Problèmes Courants

### Problème 1 : REQUEST_DENIED

**Cause** : La clé API a des restrictions incompatibles ou les APIs ne sont pas activées.

**Solution** :
1. Supprimez toutes les restrictions d'application (sélectionnez "None")
2. Vérifiez que toutes les APIs sont activées
3. Vérifiez que la facturation est activée
4. Attendez 5 minutes
5. Testez à nouveau

### Problème 2 : OVER_QUERY_LIMIT

**Cause** : Quota de requêtes dépassé.

**Solution** :
1. Allez dans **APIs & Services** > **Dashboard**
2. Cliquez sur chaque API (Places, Geocoding, Distance Matrix)
3. Vérifiez les quotas dans l'onglet **"Quotas"**
4. Si nécessaire, augmentez les quotas ou attendez la réinitialisation (généralement quotidienne)

### Problème 3 : INVALID_REQUEST

**Cause** : Paramètres de requête invalides.

**Solution** :
1. Vérifiez les logs de l'Edge Function pour voir les paramètres envoyés
2. Assurez-vous que le format est correct (coordonnées, place_id, etc.)

### Problème 4 : Secret non chargé

**Cause** : Le secret `GOOGLE_MAPS_API_KEY_SERVER` n'est pas accessible par l'Edge Function.

**Solution** :
1. Vérifiez que le secret est bien configuré dans Supabase
2. Redéployez l'Edge Function :
   ```bash
   supabase functions deploy google-places-proxy
   ```
3. Attendez 2-3 minutes
4. Testez à nouveau

## 📱 Test sur Mobile (iOS/Android)

### iOS
1. Ouvrez l'app Yombal Yoon sur iOS
2. Allez dans **Covoiturage** > **Publier un trajet**
3. Tapez dans le champ "Ville de départ" : `Dakar`
4. Vérifiez que des suggestions apparaissent

### Android
1. Ouvrez l'app Yombal Yoon sur Android
2. Allez dans **Covoiturage** > **Publier un trajet**
3. Tapez dans le champ "Ville de départ" : `Dakar`
4. Vérifiez que des suggestions apparaissent

### Web
1. Ouvrez l'app Yombal Yoon sur Web
2. Allez dans **Covoiturage** > **Publier un trajet**
3. Tapez dans le champ "Ville de départ" : `Dakar`
4. Vérifiez que des suggestions apparaissent
5. Si erreur, ouvrez la console (F12) et cliquez sur "Afficher les détails techniques"

## 🎯 Checklist Finale

Avant de considérer que tout fonctionne, vérifiez :

- [ ] La clé `GOOGLE_MAPS_API_KEY_SERVER` existe dans Google Cloud Console
- [ ] La clé n'a AUCUNE restriction d'application (None)
- [ ] Les 4 APIs sont activées : Places API (New), Places API, Geocoding API, Distance Matrix API
- [ ] La facturation est activée sur le projet Google Cloud
- [ ] Le secret `GOOGLE_MAPS_API_KEY_SERVER` est configuré dans Supabase
- [ ] L'Edge Function `google-places-proxy` est déployée (version 42+)
- [ ] Le test depuis le navigateur retourne `status: "OK"`
- [ ] L'autocomplétion fonctionne sur Web
- [ ] L'autocomplétion fonctionne sur iOS
- [ ] L'autocomplétion fonctionne sur Android

## 📞 Support

Si après avoir suivi toutes ces étapes le problème persiste :

1. Copiez les logs de l'Edge Function
2. Copiez la réponse du test depuis le navigateur
3. Faites une capture d'écran de la configuration de la clé dans Google Cloud Console
4. Partagez ces informations pour un diagnostic plus approfondi

## 🔄 Dernière Mise à Jour

- **Date** : 24 novembre 2025
- **Version Edge Function** : 42
- **État** : ✅ Fonctionnel (codes 200 dans les logs récents)


# Guide de diagnostic - Autocomplétion Web Google Maps

## 🎯 Objectif

Ce guide vous aide à diagnostiquer et résoudre les problèmes d'autocomplétion Google Maps sur la plateforme Web de Yombal Yoon.

## 📋 Symptômes

- Message d'erreur: "Autocomplétion momentanément indisponible. Vérifiez votre connexion internet ou réessayez plus tard."
- L'autocomplétion ne fonctionne pas dans les modules:
  - Envoi de colis
  - Covoiturage (Publier un trajet)
  - Livraison inter-régions

## 🔍 Diagnostic automatique

### Sur le Web

1. Ouvrez l'application web Yombal Yoon
2. Accédez au formulaire "Envoyer un colis"
3. Commencez à taper dans le champ d'adresse
4. Si une erreur apparaît, cliquez sur "▶ Afficher les détails techniques"
5. Le panneau de diagnostic affichera:
   - État de la requête (statut, plateforme, referer)
   - Configuration des clés API (Web, Android, iOS)
   - Solution recommandée avec étapes détaillées
   - Message d'erreur complet de Google Maps API

### Dans les logs Edge Function

Les logs de l'Edge Function `google-places-proxy` affichent maintenant:

```
📱 Requête: web - autocomplete
🌐 Referer: https://your-app.natively.dev/
📊 Paramètres: {...}
🔐 Environment Variables Status:
   - GOOGLE_MAPS_API_KEY_WEB: ✅ SET / ❌ NOT SET
   - GOOGLE_MAPS_API_KEY_ANDROID: ✅ SET / ❌ NOT SET
   - GOOGLE_MAPS_API_KEY_IOS: ✅ SET / ❌ NOT SET
```

## 🔧 Solutions par type d'erreur

### Erreur: "GOOGLE_MAPS_API_KEY_WEB non configurée"

**Cause:** La variable d'environnement `GOOGLE_MAPS_API_KEY_WEB` n'est pas définie dans Supabase.

**Solution:**

1. Allez dans votre projet Supabase
2. Naviguez vers: Settings > Edge Functions > Secrets
3. Ajoutez un nouveau secret:
   - Nom: `GOOGLE_MAPS_API_KEY_WEB`
   - Valeur: Votre clé API Google Maps Web
4. Redéployez l'Edge Function `google-places-proxy`

### Erreur: "REQUEST_DENIED - Referer not allowed"

**Cause:** Le referer de la requête n'est pas autorisé dans les restrictions de la clé API.

**Solution:**

1. Allez dans Google Cloud Console
2. Naviguez vers: APIs & Services > Credentials
3. Sélectionnez votre clé API Web (`GOOGLE_MAPS_API_KEY_WEB`)
4. Dans "Application restrictions":
   - Choisissez "HTTP referrers (web sites)"
   - Ajoutez les referrers suivants:
     ```
     https://*.natively.dev/*
     http://localhost/*
     http://127.0.0.1/*
     ```
5. Dans "API restrictions":
   - Activez: Places API
   - Activez: Geocoding API
   - Activez: Distance Matrix API
   - Activez: Maps JavaScript API (optionnel mais recommandé)
6. Cliquez sur "Save"
7. **Attendez 5 minutes** pour que les changements prennent effet

### Erreur: "REQUEST_DENIED - API key invalid"

**Cause:** La clé API est invalide ou a été révoquée.

**Solution:**

1. Vérifiez que la clé API existe dans Google Cloud Console
2. Vérifiez que la clé n'a pas été supprimée ou désactivée
3. Si nécessaire, créez une nouvelle clé API et mettez à jour le secret Supabase

### Erreur: "OVER_QUERY_LIMIT"

**Cause:** Le quota de requêtes a été dépassé.

**Solution:**

1. Allez dans Google Cloud Console > APIs & Services > Dashboard
2. Vérifiez les quotas pour:
   - Places API
   - Geocoding API
   - Distance Matrix API
3. Options:
   - Attendez la réinitialisation du quota (généralement quotidien)
   - Augmentez les quotas dans Google Cloud Console
   - Activez la facturation si ce n'est pas déjà fait

### Erreur: "Billing not enabled"

**Cause:** La facturation n'est pas activée sur le projet Google Cloud.

**Solution:**

1. Allez dans Google Cloud Console
2. Naviguez vers: Billing
3. Associez un compte de facturation à votre projet
4. Activez la facturation pour les APIs Google Maps

## 📊 Vérification de la configuration

### Checklist complète

- [ ] La clé `GOOGLE_MAPS_API_KEY_WEB` est définie dans Supabase Edge Function Secrets
- [ ] La clé API existe dans Google Cloud Console
- [ ] Les restrictions HTTP referrers incluent:
  - `https://*.natively.dev/*`
  - `http://localhost/*`
  - `http://127.0.0.1/*`
- [ ] Les APIs suivantes sont activées:
  - [ ] Places API
  - [ ] Geocoding API
  - [ ] Distance Matrix API
  - [ ] Maps JavaScript API (optionnel)
- [ ] La facturation est activée sur le projet Google Cloud
- [ ] Les quotas ne sont pas dépassés
- [ ] L'Edge Function `google-places-proxy` a été redéployée après les modifications

## 🧪 Test de la configuration

### Test manuel

1. Ouvrez l'application web: `https://your-app.natively.dev/`
2. Accédez à "Envoi de colis"
3. Tapez "Dakar" dans le champ d'adresse
4. Vérifiez que des suggestions apparaissent
5. Sélectionnez une suggestion
6. Vérifiez que l'adresse est correctement remplie

### Test avec curl

```bash
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/google-places-proxy \
  -H "Content-Type: application/json" \
  -H "x-platform: web" \
  -d '{
    "action": "autocomplete",
    "input": "Dakar"
  }'
```

**Réponse attendue:**
```json
{
  "status": "OK",
  "predictions": [...]
}
```

**Réponse en cas d'erreur:**
```json
{
  "status": "REQUEST_DENIED",
  "error_message": "...",
  "platform_used": "web",
  "debug": {...},
  "help_web": {...}
}
```

## 📝 Logs à surveiller

### Dans Supabase Edge Function Logs

Recherchez les messages suivants:

**Succès:**
```
✅ 5 résultats trouvés (web)
```

**Erreur de configuration:**
```
❌ GOOGLE_MAPS_API_KEY_WEB non configurée pour la plateforme: web
```

**Erreur Google Maps API:**
```
❌ Erreur Google Maps API:
   Status: REQUEST_DENIED
   HTTP Status: 200
   Message: API key not valid. Please pass a valid API key.
   Platform: web
   Referer: https://your-app.natively.dev/
```

## 🚀 Redéploiement de l'Edge Function

Après avoir modifié les secrets Supabase, redéployez l'Edge Function:

```bash
# Via Supabase CLI
supabase functions deploy google-places-proxy

# Ou via le dashboard Supabase
# 1. Allez dans Edge Functions
# 2. Sélectionnez google-places-proxy
# 3. Cliquez sur "Deploy"
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. Vérifiez les logs de l'Edge Function dans Supabase
2. Activez le panneau de diagnostic sur le Web
3. Copiez les informations de diagnostic
4. Contactez le support avec:
   - Les logs de l'Edge Function
   - Les informations du panneau de diagnostic
   - Les captures d'écran de la configuration Google Cloud Console

## 🔄 Historique des modifications

### Version actuelle

- ✅ Ajout de logs détaillés dans l'Edge Function
- ✅ Ajout du panneau de diagnostic sur le Web
- ✅ Affichage du statut des variables d'environnement
- ✅ Messages d'erreur détaillés avec solutions
- ✅ Support du referer dans les logs
- ✅ Vérification de la longueur et du préfixe de la clé API

### Prochaines améliorations

- [ ] Test automatique de la configuration au démarrage
- [ ] Notification proactive en cas de quota dépassé
- [ ] Cache des résultats pour réduire les appels API
- [ ] Fallback sur une base de données locale en cas d'erreur

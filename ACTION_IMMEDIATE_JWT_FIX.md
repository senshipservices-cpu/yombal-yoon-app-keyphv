
# 🚨 ACTION IMMÉDIATE : Corriger les erreurs 401 des Edge Functions

## Contexte

Les Edge Functions de notifications retournent **401 Unauthorized** car elles nécessitent une vérification JWT qui échoue lorsqu'elles sont appelées depuis les triggers Postgres.

## Actions à effectuer MAINTENANT

### ✅ Étape 1 : Mettre à jour config.toml (2 minutes)

Ouvrez le fichier `supabase/config.toml` et remplacez son contenu par :

```toml
project_id = "drxtaxepofuoelplgrei"

# Edge Functions Configuration
# Disable JWT verification for functions called from database triggers

[functions.on-ride-created]
verify_jwt = false

[functions.on-reservation-requested]
verify_jwt = false

[functions.on-reservation-status-changed]
verify_jwt = false

[functions.on-ride-status-changed]
verify_jwt = false

[functions.on-driver-arrived]
verify_jwt = false

[functions.on-ride-reminders]
verify_jwt = false

[functions.on-rating-request]
verify_jwt = false
```

### ✅ Étape 2 : Redéployer les fonctions (5 minutes)

Ouvrez un terminal et exécutez :

```bash
# Se connecter à Supabase (si ce n'est pas déjà fait)
supabase login

# Lier le projet (si ce n'est pas déjà fait)
supabase link --project-ref drxtaxepofuoelplgrei

# Déployer toutes les fonctions
supabase functions deploy
```

**Attendez** que toutes les fonctions soient déployées (environ 2-3 minutes).

### ✅ Étape 3 : Vérifier le déploiement (2 minutes)

1. Allez sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions
2. Cliquez sur **on-ride-created**
3. Vérifiez que **JWT Verification** est **Disabled** ✅

Répétez pour les autres fonctions si nécessaire.

### ✅ Étape 4 : Tester (3 minutes)

1. Ouvrez l'application Yombal Yoon
2. Créez un nouveau trajet de covoiturage
3. Retournez sur le Dashboard Supabase
4. Allez dans **Edge Functions** → **on-ride-created** → **Invocations**
5. Vérifiez que le dernier appel a un statut **200** ✅ (et non 401 ❌)

### ✅ Étape 5 : Vérifier les notifications (2 minutes)

1. Dans l'application, vérifiez que vous avez reçu une notification "✅ Trajet publié"
2. Si vous avez des alertes de trajet configurées, vérifiez qu'elles ont été notifiées

## Résultat attendu

Après ces étapes :

- ✅ Les Edge Functions ne retournent plus d'erreurs 401
- ✅ Les triggers Postgres peuvent appeler les fonctions avec succès
- ✅ Les notifications de covoiturage fonctionnent
- ✅ Les logs montrent `execution_id` non NULL

## Si ça ne fonctionne toujours pas

### Problème : "supabase: command not found"

```bash
# Installer la CLI Supabase
npm install -g supabase
```

### Problème : "Project not linked"

```bash
supabase link --project-ref drxtaxepofuoelplgrei
```

### Problème : JWT Verification toujours activé après déploiement

Essayez de déployer avec le flag explicite :

```bash
supabase functions deploy on-ride-created --no-verify-jwt
supabase functions deploy on-reservation-requested --no-verify-jwt
supabase functions deploy on-reservation-status-changed --no-verify-jwt
supabase functions deploy on-ride-status-changed --no-verify-jwt
supabase functions deploy on-driver-arrived --no-verify-jwt
supabase functions deploy on-ride-reminders --no-verify-jwt
supabase functions deploy on-rating-request --no-verify-jwt
```

### Problème : Toujours des erreurs 401

1. Vérifiez les logs détaillés :
   ```bash
   supabase functions logs on-ride-created --follow
   ```

2. Vérifiez que le trigger Postgres appelle la bonne URL :
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'call_on_ride_created';
   ```

3. Vérifiez que l'extension `pg_net` est activée :
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```

## Temps total estimé

⏱️ **15 minutes** pour corriger complètement le problème

## Documents de référence

- **EDGE_FUNCTIONS_JWT_FIX.md** - Guide complet
- **DEPLOY_EDGE_FUNCTIONS.md** - Guide de déploiement détaillé
- **RESUME_FIX_JWT_EDGE_FUNCTIONS.md** - Résumé de la correction

## Contact / Support

Si vous rencontrez des problèmes après avoir suivi ces étapes, consultez les logs détaillés et vérifiez :

1. Que `config.toml` est bien dans `supabase/config.toml`
2. Que vous êtes dans le bon répertoire (racine du projet)
3. Que vous avez les permissions nécessaires sur le projet Supabase

---

**🎯 Objectif** : Corriger les erreurs 401 et faire fonctionner les notifications de covoiturage.

**⏰ Deadline** : MAINTENANT (15 minutes)

**✅ Succès** : Statut 200 dans les invocations + notifications reçues dans l'app

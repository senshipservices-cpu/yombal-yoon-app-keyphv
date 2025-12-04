
# Résumé : Correction des erreurs 401 sur les Edge Functions

## Problème identifié

Les Edge Functions de notifications (notamment `on-ride-created`) retournent des erreurs **401 Unauthorized** lorsqu'elles sont appelées depuis les triggers Postgres.

**Cause** : Par défaut, Supabase Edge Functions nécessitent un JWT valide. Les triggers Postgres internes ne peuvent pas fournir un JWT valide, donc le runtime Supabase bloque les requêtes AVANT l'exécution du code.

## Solution appliquée

### 1. Configuration à ajouter dans `supabase/config.toml`

```toml
project_id = "drxtaxepofuoelplgrei"

# Désactiver la vérification JWT pour les fonctions appelées par des triggers

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

### 2. Commandes de déploiement

```bash
# Se connecter et lier le projet
supabase login
supabase link --project-ref drxtaxepofuoelplgrei

# Déployer toutes les fonctions avec la nouvelle configuration
supabase functions deploy
```

**OU** déployer individuellement avec le flag :

```bash
supabase functions deploy on-ride-created --no-verify-jwt
supabase functions deploy on-reservation-requested --no-verify-jwt
supabase functions deploy on-reservation-status-changed --no-verify-jwt
supabase functions deploy on-ride-status-changed --no-verify-jwt
supabase functions deploy on-driver-arrived --no-verify-jwt
supabase functions deploy on-ride-reminders --no-verify-jwt
supabase functions deploy on-rating-request --no-verify-jwt
```

### 3. Vérification

Après le déploiement :

1. **Dashboard Supabase** → **Edge Functions** → Sélectionner `on-ride-created`
2. Vérifier que **JWT Verification** est **Disabled**
3. Créer un trajet de test dans l'application
4. Vérifier dans **Invocations** que le statut est **200** (et non 401)
5. Vérifier que `execution_id` n'est plus NULL

## Fonctions concernées

### Fonctions avec JWT désactivé (appelées par triggers)

- ✅ `on-ride-created` - Création de trajet
- ✅ `on-reservation-requested` - Demande de réservation
- ✅ `on-reservation-status-changed` - Changement de statut de réservation
- ✅ `on-ride-status-changed` - Changement de statut de trajet
- ✅ `on-driver-arrived` - Arrivée du conducteur
- ✅ `on-ride-reminders` - Rappels (cron)
- ✅ `on-rating-request` - Demande de notation (cron)

### Fonctions avec JWT activé (appelées depuis l'app)

- ✅ `send-notification-unified` - Envoi de notifications (appelée avec SERVICE_ROLE_KEY)
- ✅ `google-places-proxy` - Proxy Google Places
- ✅ `send-otp-twilio` - Envoi OTP

## Sécurité

⚠️ **Important** : Désactiver `verify_jwt` permet à n'importe qui d'appeler ces fonctions sans authentification.

**Mesures de sécurité en place** :

1. ✅ Ces fonctions sont appelées uniquement par des triggers Postgres internes
2. ✅ Validation des données dans chaque fonction
3. ✅ Logs de toutes les invocations
4. ✅ Les fonctions utilisent `SUPABASE_SERVICE_ROLE_KEY` pour accéder à la base de données

**Recommandations supplémentaires** :

- Monitorer les logs pour détecter des appels suspects
- Implémenter un rate limiting si nécessaire
- Considérer l'ajout d'un secret partagé pour plus de sécurité (voir EDGE_FUNCTIONS_JWT_FIX.md)

## Documents créés

1. **EDGE_FUNCTIONS_JWT_FIX.md** - Guide complet de la correction
2. **DEPLOY_EDGE_FUNCTIONS.md** - Guide de déploiement détaillé
3. **supabase/config.toml.template** - Template de configuration
4. **RESUME_FIX_JWT_EDGE_FUNCTIONS.md** - Ce document (résumé)

## Prochaines étapes

1. ✅ Mettre à jour `supabase/config.toml` avec la configuration ci-dessus
2. ✅ Redéployer les Edge Functions avec la CLI Supabase
3. ✅ Tester la création d'un trajet pour vérifier que les notifications fonctionnent
4. ✅ Vérifier les logs dans le Dashboard Supabase
5. ✅ Tester tous les scénarios de notifications (voir TESTING_GUIDE.md)

## Commandes rapides

```bash
# Déploiement rapide (après avoir mis à jour config.toml)
supabase login
supabase link --project-ref drxtaxepofuoelplgrei
supabase functions deploy

# Vérifier les logs
supabase functions logs on-ride-created --follow

# Tester localement
supabase functions serve on-ride-created --no-verify-jwt
```

## Support

Si les erreurs 401 persistent après le déploiement :

1. Vérifier que `config.toml` est bien à la racine du projet dans le dossier `supabase/`
2. Vérifier dans le Dashboard que JWT Verification est désactivé
3. Consulter les logs détaillés dans **Edge Functions** → **Logs**
4. Vérifier que les triggers Postgres appellent bien les bonnes URLs

## Références

- [Supabase Edge Functions - JWT Verification](https://supabase.com/docs/guides/functions/function-configuration#skipping-authorization-checks)
- [Supabase CLI - Deploy Functions](https://supabase.com/docs/guides/functions/deploy)
- [Documentation complète](./EDGE_FUNCTIONS_JWT_FIX.md)


# 🚨 ACTION IMMÉDIATE : Désactiver JWT Verification

## ⚠️ PROBLÈME

Les cron jobs et database triggers échouent avec des erreurs **401 Unauthorized** car les Edge Functions ont `verify_jwt: true` mais sont appelées sans JWT token.

**Logs d'erreur** :
```
POST | 401 | https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders
POST | 401 | https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request
```

---

## ✅ SOLUTION 1 : Dashboard Supabase (RECOMMANDÉ)

### Étapes :

1. **Aller dans le Dashboard Supabase**
   - URL : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei

2. **Naviguer vers Edge Functions**
   - Menu latéral → Edge Functions

3. **Pour chaque fonction suivante, désactiver JWT** :
   - `on-ride-created`
   - `on-reservation-requested`
   - `on-reservation-status-changed`
   - `on-ride-reminders` ⚠️ **URGENT**
   - `on-rating-request` ⚠️ **URGENT**
   - `on-driver-arrived`
   - `on-ride-status-changed`
   - `send-notification-unified`

4. **Désactiver JWT pour chaque fonction** :
   - Cliquer sur la fonction
   - Aller dans **Settings**
   - Section **JWT Verification**
   - Décocher **Verify JWT**
   - Sauvegarder

---

## ✅ SOLUTION 2 : Fichier supabase/config.toml

### Modifier le fichier `supabase/config.toml` :

```toml
[functions.on-ride-created]
verify_jwt = false

[functions.on-reservation-requested]
verify_jwt = false

[functions.on-reservation-status-changed]
verify_jwt = false

[functions.on-ride-reminders]
verify_jwt = false

[functions.on-rating-request]
verify_jwt = false

[functions.on-driver-arrived]
verify_jwt = false

[functions.on-ride-status-changed]
verify_jwt = false

[functions.send-notification-unified]
verify_jwt = false
```

### Puis redéployer :

```bash
supabase functions deploy on-ride-created
supabase functions deploy on-reservation-requested
supabase functions deploy on-reservation-status-changed
supabase functions deploy on-ride-reminders
supabase functions deploy on-rating-request
supabase functions deploy on-driver-arrived
supabase functions deploy on-ride-status-changed
supabase functions deploy send-notification-unified
```

---

## 🔍 VÉRIFICATION

### 1. Vérifier les cron jobs (attendre 5-10 minutes)

```sql
-- Vérifier les dernières exécutions
SELECT * FROM cron.job_run_details 
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname IN ('ride-reminders-v2', 'rating-requests-v2')
)
ORDER BY start_time DESC
LIMIT 10;
```

**Résultat attendu** : `status = 'succeeded'` au lieu de `status = 'failed'`

### 2. Vérifier les logs Edge Functions

Dans le Dashboard Supabase :
- Edge Functions → Logs
- Chercher `on-ride-reminders` et `on-rating-request`
- Vérifier que le status code est **200** au lieu de **401**

### 3. Tester manuellement

```bash
# Test on-ride-reminders
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders \
  -H "Content-Type: application/json" \
  -d '{}'

# Test on-rating-request
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Résultat attendu** : Status 200 avec réponse JSON

---

## 📊 TABLEAU DE VÉRIFICATION

| Fonction | JWT Désactivé ? | Cron Job OK ? | Statut |
|----------|----------------|---------------|--------|
| on-ride-reminders | ⬜ | ⬜ | ⚠️ À faire |
| on-rating-request | ⬜ | ⬜ | ⚠️ À faire |
| on-ride-created | ⬜ | N/A | ⚠️ À faire |
| on-reservation-requested | ⬜ | N/A | ⚠️ À faire |
| on-reservation-status-changed | ⬜ | N/A | ⚠️ À faire |
| on-driver-arrived | ⬜ | N/A | ⚠️ À faire |
| on-ride-status-changed | ⬜ | N/A | ⚠️ À faire |
| send-notification-unified | ⬜ | N/A | ⚠️ À faire |

**Cocher les cases au fur et à mesure de la configuration.**

---

## 🚨 IMPACT SI NON CORRIGÉ

- ❌ **Rappels de trajet (J-1, H-1)** : Ne fonctionnent pas
- ❌ **Demandes de notation** : Ne sont pas envoyées
- ❌ **Notifications automatiques** : Bloquées
- ❌ **Expérience utilisateur** : Dégradée

---

## ✅ APRÈS CORRECTION

- ✅ **Rappels de trajet** : Envoyés automatiquement
- ✅ **Demandes de notation** : Envoyées 10-30 min après la fin du trajet
- ✅ **Notifications automatiques** : Fonctionnelles
- ✅ **Expérience utilisateur** : Optimale

---

**Temps estimé** : 5-10 minutes  
**Priorité** : 🔴 **CRITIQUE**  
**Impact** : 🔴 **BLOQUANT**

---

**Auteur** : Natively AI  
**Date** : 2025-06-01

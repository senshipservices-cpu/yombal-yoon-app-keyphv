
# ⚡ ACTIONS IMMÉDIATES - SYSTÈME DE NOTIFICATIONS

**Date**: 2 février 2025  
**Temps estimé**: 15 minutes

---

## 🚨 ACTIONS CRITIQUES (À FAIRE MAINTENANT)

### **ACTION 1: Désactiver JWT Verification (5 min)**

**Via Supabase CLI** (recommandé):

```bash
# 1. Installer Supabase CLI si nécessaire
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# 4. Déployer les fonctions avec --no-verify-jwt
supabase functions deploy on-ride-created --no-verify-jwt
supabase functions deploy on-reservation-requested --no-verify-jwt
supabase functions deploy on-reservation-status-changed --no-verify-jwt
supabase functions deploy on-ride-status-changed --no-verify-jwt
supabase functions deploy on-driver-arrived --no-verify-jwt
supabase functions deploy on-ride-reminders --no-verify-jwt
supabase functions deploy on-rating-request --no-verify-jwt
```

**Via Supabase Dashboard** (alternative):

1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Edge Functions → on-ride-created → Settings
3. Désactiver "JWT Verification"
4. Répéter pour toutes les fonctions listées ci-dessus

---

### **ACTION 2: Configurer Service Role Key (2 min)**

```sql
-- 1. Récupérer la clé depuis Dashboard
-- https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/api
-- Copier "service_role" (secret)

-- 2. Exécuter dans SQL Editor
UPDATE app_config 
SET value = 'COLLER_LA_CLE_ICI',
    updated_at = NOW()
WHERE key = 'service_role_key';

-- 3. Vérifier
SELECT key, LEFT(value, 20) || '...' as value_preview 
FROM app_config 
WHERE key = 'service_role_key';
-- Doit afficher: eyJhbGciOiJIUzI1NiI...
```

---

### **ACTION 3: Vérifier Secrets Twilio (3 min)**

1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions
2. Cliquer sur "Settings" (en haut à droite)
3. Onglet "Secrets"
4. Vérifier que ces secrets existent:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
IS_PRODUCTION_MODE=false
```

5. Si manquants, les ajouter depuis votre compte Twilio

---

### **ACTION 4: Test Rapide (5 min)**

```typescript
// 1. Créer un trajet de test
const { data: ride, error } = await supabase
  .from('carpool_rides')
  .insert({
    driver_id: 'user_1763729416238_a0ro8i', // Remplacer par un vrai user_id
    origin: 'Dakar',
    destination: 'Thiès',
    date_departure: '2025-02-10',
    time_departure: '14:00',
    price: 2000,
    seats_available: 3,
  })
  .select()
  .single();

console.log('Ride created:', ride);

// 2. Attendre 2 secondes

// 3. Vérifier la notification
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', 'user_1763729416238_a0ro8i')
  .eq('type', 'ride_published')
  .order('created_at', { ascending: false })
  .limit(1);

console.log('Notification:', notifications);
// Doit afficher: "✅ Trajet publié"
```

---

## ✅ VÉRIFICATION RAPIDE

### **Vérifier que tout fonctionne:**

```sql
-- 1. Vérifier les cron jobs
SELECT jobname, schedule, active 
FROM cron.job;
-- Doit afficher: ride-reminders, rating-requests

-- 2. Vérifier les dernières notifications
SELECT type, title, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Vérifier les logs Edge Functions
SELECT function_id, status_code, COUNT(*) 
FROM (
  SELECT 
    CASE 
      WHEN event_message LIKE '%on-ride-created%' THEN 'on-ride-created'
      WHEN event_message LIKE '%on-reservation%' THEN 'on-reservation'
      ELSE 'other'
    END as function_id,
    CASE 
      WHEN event_message LIKE '%401%' THEN 401
      WHEN event_message LIKE '%200%' THEN 200
      ELSE 500
    END as status_code
  FROM postgres_logs
  WHERE event_message LIKE '%functions%'
    AND timestamp > NOW() - INTERVAL '1 hour'
) logs
GROUP BY function_id, status_code;
-- Ne doit PAS afficher de 401
```

---

## 🎯 RÉSULTAT ATTENDU

Après ces 4 actions:

- ✅ Edge Functions répondent 200 (pas 401)
- ✅ Notifications in-app créées lors de la création de trajets
- ✅ Cron jobs s'exécutent toutes les 5-10 minutes
- ✅ Logs Edge Functions montrent "📥 on-ride-created: {...}"

---

## 🆘 EN CAS DE PROBLÈME

### **Problème: Toujours des 401**

```bash
# Vérifier le statut JWT
supabase functions list --project-ref drxtaxepofuoelplgrei

# Doit afficher verify_jwt: false pour toutes les fonctions
```

### **Problème: Pas de notifications**

```sql
-- Vérifier les logs
SELECT * FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Vérifier les erreurs
SELECT error_message, COUNT(*) 
FROM notification_logs 
WHERE status = 'error'
GROUP BY error_message;
```

### **Problème: Cron jobs ne s'exécutent pas**

```sql
-- Vérifier l'extension
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Vérifier les exécutions
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 📞 SUPPORT

Si les problèmes persistent après ces actions:

1. Vérifier [NOTIFICATION_SYSTEM_AUDIT_AND_FIX.md](./NOTIFICATION_SYSTEM_AUDIT_AND_FIX.md)
2. Consulter les logs détaillés dans Supabase Dashboard
3. Vérifier que toutes les tables existent (notifications, notification_logs, device_tokens)

---

**Temps total**: ~15 minutes  
**Difficulté**: Facile  
**Prérequis**: Accès Dashboard Supabase + Supabase CLI

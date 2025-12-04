
# ✅ CHECKLIST D'IMPLÉMENTATION - SYSTÈME DE NOTIFICATIONS

## 📋 OVERVIEW

Ce document fournit une checklist complète pour implémenter et valider le système de notifications du module Covoiturage de Yombal Yoon.

---

## 🎯 PHASE 1 : PRÉPARATION (30 minutes)

### 1.1 Vérification de l'environnement

- [ ] **Accès Supabase Dashboard**
  - URL : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
  - Vérifier l'accès aux sections : Database, Edge Functions, Logs

- [ ] **Accès Twilio Console**
  - URL : https://console.twilio.com
  - Vérifier les crédits disponibles
  - Noter le numéro WhatsApp : `whatsapp:+14155238886`

- [ ] **Configuration locale**
  - Cloner le projet
  - Installer les dépendances : `npm install`
  - Vérifier la connexion Supabase

### 1.2 Configuration des secrets

- [ ] **Vérifier les secrets Supabase**
  ```bash
  supabase secrets list
  ```

- [ ] **Secrets requis :**
  - [ ] `TWILIO_ACCOUNT_SID` : Compte Twilio
  - [ ] `TWILIO_AUTH_TOKEN` : Token d'authentification Twilio
  - [ ] `TWILIO_WHATSAPP_FROM` : `whatsapp:+14155238886`
  - [ ] `IS_PRODUCTION_MODE` : `false` (pour les tests)
  - [ ] `SUPABASE_URL` : URL du projet
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` : Clé service role

- [ ] **Configurer les secrets manquants**
  ```bash
  supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
  supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
  supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
  supabase secrets set IS_PRODUCTION_MODE=false
  ```

### 1.3 Vérification des Edge Functions

- [ ] **Lister les Edge Functions déployées**
  ```bash
  supabase functions list
  ```

- [ ] **Edge Functions requises :**
  - [ ] `send-notification-unified` ✅
  - [ ] `on-ride-created` ✅
  - [ ] `on-reservation-requested` ✅
  - [ ] `on-reservation-status-changed` ✅
  - [ ] `on-ride-reminders` ✅
  - [ ] `on-driver-arrived` ✅
  - [ ] `on-ride-status-changed` ✅
  - [ ] `on-rating-request` ✅

- [ ] **Redéployer si nécessaire**
  ```bash
  supabase functions deploy send-notification-unified
  supabase functions deploy on-ride-created
  # ... etc
  ```

### 1.4 Vérification de la base de données

- [ ] **Tables requises existent :**
  - [ ] `user_profiles` ✅
  - [ ] `carpool_rides` ✅
  - [ ] `carpool_bookings` ✅
  - [ ] `ride_alerts` ✅
  - [ ] `notifications` ✅
  - [ ] `notification_logs` ✅
  - [ ] `device_tokens` ✅

- [ ] **RLS activé sur toutes les tables**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('notifications', 'notification_logs', 'device_tokens');
  ```

---

## 🧪 PHASE 2 : TESTS EN DÉVELOPPEMENT (2-3 heures)

### 2.1 Préparation des comptes de test

- [ ] **Créer un compte conducteur de test**
  - Nom : Test Conducteur
  - Téléphone : +221771111111
  - ID : `test-driver-001`

- [ ] **Créer un compte passager de test**
  - Nom : Test Passager
  - Téléphone : +221772222222
  - ID : `test-passenger-001`

- [ ] **Vérifier les comptes dans la base**
  ```sql
  SELECT id, full_name, phone_number, whatsapp_optin 
  FROM user_profiles 
  WHERE id IN ('test-driver-001', 'test-passenger-001');
  ```

### 2.2 Test : Publication de trajet

- [ ] **Action : Publier un trajet**
  - Origine : Dakar
  - Destination : Thiès
  - Date : Demain
  - Heure : 14h00
  - Places : 3
  - Prix : 2000 FCFA

- [ ] **Vérifications :**
  - [ ] Trajet créé dans `carpool_rides`
  - [ ] Notification in-app créée pour le conducteur
  - [ ] Type de notification : `ride_created`
  - [ ] Log créé dans `notification_logs`
  - [ ] Pas de notification en double

- [ ] **Requête de vérification**
  ```sql
  SELECT * FROM notifications 
  WHERE type = 'ride_created' 
  ORDER BY created_at DESC 
  LIMIT 5;
  ```

### 2.3 Test : Demande de réservation

- [ ] **Action : Faire une demande de réservation**
  - Passager : Test Passager
  - Nombre de places : 2

- [ ] **Vérifications :**
  - [ ] Réservation créée avec status `pending`
  - [ ] Notification in-app pour le conducteur
  - [ ] Type : `reservation_requested`
  - [ ] Notification in-app pour le passager (statut "En attente")
  - [ ] Logs créés

- [ ] **Requête de vérification**
  ```sql
  SELECT * FROM carpool_bookings 
  WHERE status = 'pending' 
  ORDER BY created_at DESC 
  LIMIT 5;
  
  SELECT * FROM notifications 
  WHERE type = 'reservation_requested' 
  ORDER BY created_at DESC 
  LIMIT 5;
  ```

### 2.4 Test : Acceptation de réservation

- [ ] **Action : Accepter la réservation**

- [ ] **Vérifications :**
  - [ ] Status de la réservation = `accepted`
  - [ ] Notification in-app pour le passager
  - [ ] Type : `reservation_accepted`
  - [ ] Places disponibles mises à jour
  - [ ] Logs créés

- [ ] **Requête de vérification**
  ```sql
  SELECT 
    cb.id,
    cb.status,
    cr.seats_available
  FROM carpool_bookings cb
  JOIN carpool_rides cr ON cb.ride_id = cr.id
  WHERE cb.status = 'accepted'
  ORDER BY cb.created_at DESC 
  LIMIT 5;
  ```

### 2.5 Test : Refus de réservation

- [ ] **Action : Créer et refuser une réservation**

- [ ] **Vérifications :**
  - [ ] Status = `refused`
  - [ ] Notification in-app pour le passager
  - [ ] Type : `reservation_refused`
  - [ ] Places non modifiées

### 2.6 Test : Rappels (manuel)

- [ ] **Action : Invoquer manuellement on-ride-reminders**
  ```bash
  curl -X POST \
    'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders' \
    -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
    -H 'Content-Type: application/json'
  ```

- [ ] **Vérifications :**
  - [ ] Fonction s'exécute sans erreur
  - [ ] Logs montrent les trajets traités
  - [ ] Notifications créées si trajets éligibles

### 2.7 Test : "Je suis arrivé"

- [ ] **Action : Conducteur clique "Je suis arrivé"**

- [ ] **Vérifications :**
  - [ ] Notifications in-app pour les passagers
  - [ ] Type : `driver_arrived`
  - [ ] Message : "Le conducteur est arrivé"

### 2.8 Test : Annulation par conducteur

- [ ] **Action : Conducteur annule le trajet**

- [ ] **Vérifications :**
  - [ ] Status du trajet = `cancelled`
  - [ ] Notifications pour tous les passagers
  - [ ] Type : `ride_cancelled`

### 2.9 Test : Annulation par passager

- [ ] **Action : Passager annule sa réservation**

- [ ] **Vérifications :**
  - [ ] Status = `cancelled_by_passenger`
  - [ ] Notification pour le conducteur
  - [ ] Places disponibles mises à jour

### 2.10 Test : Fin de trajet et notation

- [ ] **Action : Terminer le trajet**

- [ ] **Vérifications :**
  - [ ] Status = `ended`
  - [ ] Champ `ended_at` rempli

- [ ] **Action : Invoquer on-rating-request (après 15 min)**
  ```bash
  curl -X POST \
    'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request' \
    -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
    -H 'Content-Type: application/json'
  ```

- [ ] **Vérifications :**
  - [ ] Notifications pour conducteur et passagers
  - [ ] Type : `rating_request`
  - [ ] Champ `rating_requested_at` rempli

### 2.11 Validation globale

- [ ] **Aucune notification en double détectée**
- [ ] **Tous les logs créés correctement**
- [ ] **Statuts cohérents dans toutes les tables**
- [ ] **Pas d'erreurs dans les logs Edge Functions**

---

## ⏰ PHASE 3 : CONFIGURATION CRON JOBS (30 minutes)

### 3.1 Activer pg_cron

- [ ] **Activer l'extension**
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  ```

- [ ] **Vérifier l'activation**
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_cron';
  ```

### 3.2 Configurer service_role_key

- [ ] **Récupérer la service_role_key**
  - Aller dans Supabase Dashboard → Settings → API
  - Copier la clé **service_role**

- [ ] **Configurer dans la base**
  ```sql
  ALTER DATABASE postgres SET app.settings.service_role_key TO 'YOUR_SERVICE_ROLE_KEY';
  SELECT pg_reload_conf();
  ```

- [ ] **Vérifier la configuration**
  ```sql
  SELECT current_setting('app.settings.service_role_key');
  ```

### 3.3 Créer le cron rating-request

- [ ] **Créer le cron job**
  ```sql
  SELECT cron.schedule(
    'rating-request-cron',
    '*/15 * * * *',
    $$
    SELECT
      net.http_post(
        url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := '{}'::jsonb
      ) AS request_id;
    $$
  );
  ```

- [ ] **Vérifier la création**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'rating-request-cron';
  ```

### 3.4 Créer le cron ride-reminders

- [ ] **Créer le cron job**
  ```sql
  SELECT cron.schedule(
    'ride-reminders-cron',
    '*/15 * * * *',
    $$
    SELECT
      net.http_post(
        url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := '{}'::jsonb
      ) AS request_id;
    $$
  );
  ```

- [ ] **Vérifier la création**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'ride-reminders-cron';
  ```

### 3.5 Tester les cron jobs

- [ ] **Attendre 15 minutes et vérifier l'exécution**
  ```sql
  SELECT 
    j.jobname,
    jrd.status,
    jrd.start_time,
    jrd.end_time
  FROM cron.job_run_details jrd
  JOIN cron.job j ON jrd.jobid = j.jobid
  WHERE j.jobname IN ('rating-request-cron', 'ride-reminders-cron')
  ORDER BY jrd.start_time DESC
  LIMIT 10;
  ```

- [ ] **Vérifier qu'il n'y a pas d'erreurs**

---

## 🔧 PHASE 4 : CONFIGURATION PRODUCTION MODE (15 minutes)

### 4.1 Vérifier IS_PRODUCTION_MODE

- [ ] **Vérifier la valeur actuelle**
  ```bash
  supabase secrets get IS_PRODUCTION_MODE
  ```

- [ ] **Doit être `false` pour les tests**

### 4.2 Tester le comportement en mode test

- [ ] **Invoquer send-notification-unified**
  ```bash
  curl -X POST \
    'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-notification-unified' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json' \
    -d '{
      "type": "test",
      "userId": "test-user-id",
      "title": "Test",
      "message": "Test message",
      "channels": ["in_app", "push", "whatsapp"]
    }'
  ```

- [ ] **Vérifier la réponse**
  - [ ] `mode: "test"`
  - [ ] `channels.in_app.success: true`
  - [ ] `channels.push.error: "Test mode - push skipped"`
  - [ ] `channels.whatsapp.error: "Test mode - WhatsApp skipped"`

### 4.3 Documenter le comportement

- [ ] **Mode test (IS_PRODUCTION_MODE = false) :**
  - [ ] In-app : ✅ Activé
  - [ ] Push : ⚠️ Désactivé (skipped)
  - [ ] WhatsApp : ⚠️ Désactivé (skipped)

- [ ] **Mode production (IS_PRODUCTION_MODE = true) :**
  - [ ] In-app : ✅ Activé
  - [ ] Push : ✅ Activé
  - [ ] WhatsApp : ✅ Activé (si optin)

---

## 🧑‍🔬 PHASE 5 : TESTS PILOTES EN PRODUCTION (1-2 heures)

### 5.1 Préparation

- [ ] **Créer des comptes pilotes internes**
  - [ ] Conducteur pilote (iOS)
  - [ ] Passager pilote 1 (Android, whatsapp_optin = true)
  - [ ] Passager pilote 2 (iOS, whatsapp_optin = false)

- [ ] **Enregistrer les tokens push**
  ```sql
  INSERT INTO device_tokens (user_id, expo_push_token, platform, active)
  VALUES 
    ('pilot-driver-id', 'ExponentPushToken[xxx]', 'ios', true),
    ('pilot-passenger-1-id', 'ExponentPushToken[yyy]', 'android', true),
    ('pilot-passenger-2-id', 'ExponentPushToken[zzz]', 'ios', true);
  ```

### 5.2 Activer le mode production

- [ ] **Activer IS_PRODUCTION_MODE**
  ```bash
  supabase secrets set IS_PRODUCTION_MODE=true
  ```

- [ ] **Vérifier**
  ```bash
  supabase secrets get IS_PRODUCTION_MODE
  # Doit afficher : true
  ```

### 5.3 Test : Push notifications iOS

- [ ] **Action : Publier un trajet avec le conducteur pilote (iOS)**

- [ ] **Vérifications :**
  - [ ] Push reçu sur iPhone
  - [ ] Son et vibration fonctionnent
  - [ ] Clic ouvre l'app
  - [ ] Contenu correct

### 5.4 Test : Push notifications Android

- [ ] **Action : Passager 1 (Android) fait une réservation**

- [ ] **Vérifications :**
  - [ ] Push reçu sur Android
  - [ ] Son et vibration fonctionnent
  - [ ] Clic ouvre l'app
  - [ ] Contenu correct

### 5.5 Test : WhatsApp notifications

- [ ] **Action : Créer un trajet qui part dans 30 min, accepter une réservation**

- [ ] **Vérifications :**
  - [ ] WhatsApp reçu par passager 1 (optin = true)
  - [ ] Pas de WhatsApp pour passager 2 (optin = false)
  - [ ] Contenu correct
  - [ ] Pas de doublons

- [ ] **Vérifier dans Twilio Console**
  - [ ] Message envoyé avec succès
  - [ ] Status : Delivered

### 5.6 Test : Rappels en production

- [ ] **Action : Créer un trajet pour demain, attendre le cron J-1**

- [ ] **Vérifications :**
  - [ ] Push reçus par conducteur et passagers
  - [ ] Pas de WhatsApp pour J-1
  - [ ] Contenu correct

- [ ] **Action : Le lendemain, attendre le cron H-1**

- [ ] **Vérifications :**
  - [ ] Push reçus
  - [ ] WhatsApp reçus (si optin)
  - [ ] Pas de doublons

### 5.7 Test : Demande de notation en production

- [ ] **Action : Terminer un trajet, attendre 15-20 min**

- [ ] **Vérifications :**
  - [ ] Push reçus par conducteur et passagers
  - [ ] Notifications in-app créées
  - [ ] Pas de doublons

### 5.8 Validation globale production

- [ ] **Tous les push reçus sur iOS**
- [ ] **Tous les push reçus sur Android**
- [ ] **WhatsApp reçus si optin**
- [ ] **Pas de WhatsApp si pas d'optin**
- [ ] **Aucun doublon détecté**
- [ ] **Contenu des messages correct**
- [ ] **Variables remplacées correctement**

---

## 📊 PHASE 6 : MONITORING ET SURVEILLANCE (Continu)

### 6.1 Installer les vues de monitoring

- [ ] **Exécuter le script MONITORING_SETUP.sql**
  ```bash
  psql -h db.drxtaxepofuoelplgrei.supabase.co \
       -U postgres \
       -d postgres \
       -f MONITORING_SETUP.sql
  ```

- [ ] **Vérifier les vues créées**
  ```sql
  SELECT viewname FROM pg_views 
  WHERE viewname LIKE 'notification%' 
  ORDER BY viewname;
  ```

### 6.2 Configurer les alertes

- [ ] **Définir les seuils d'alerte**
  - 🟢 Normal : Taux d'erreur < 5%
  - 🟡 Attention : Taux d'erreur 5-15%
  - 🔴 Critique : Taux d'erreur > 15%

- [ ] **Créer une requête d'alerte**
  ```sql
  SELECT * FROM notification_health_metrics
  WHERE last_hour_error_rate > 5
  ORDER BY last_hour_error_rate DESC;
  ```

### 6.3 Surveillance quotidienne

- [ ] **Vérifier le dashboard chaque jour**
  ```sql
  SELECT * FROM notification_dashboard;
  ```

- [ ] **Vérifier les erreurs**
  ```sql
  SELECT * FROM notification_error_summary;
  ```

- [ ] **Vérifier les cron jobs**
  ```sql
  SELECT * FROM cron_job_monitoring;
  ```

### 6.4 Surveillance Twilio

- [ ] **Vérifier les logs Twilio quotidiennement**
  - URL : https://console.twilio.com/us1/monitor/logs/messages
  - Vérifier le taux de livraison
  - Vérifier les erreurs

- [ ] **Surveiller les coûts**
  - Vérifier les crédits restants
  - Estimer les coûts mensuels

### 6.5 Maintenance hebdomadaire

- [ ] **Nettoyer les vieux logs (> 30 jours)**
  ```sql
  SELECT * FROM clean_old_notification_logs(30);
  ```

- [ ] **Désactiver les tokens inactifs (> 30 jours)**
  ```sql
  SELECT * FROM deactivate_stale_tokens(30);
  ```

- [ ] **Analyser les performances**
  ```sql
  SELECT 
    channel,
    AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) as avg_time_seconds
  FROM notification_logs
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY channel;
  ```

---

## ✅ VALIDATION FINALE

### Checklist complète

- [ ] **Phase 1 : Préparation** ✅
  - [ ] Environnement configuré
  - [ ] Secrets configurés
  - [ ] Edge Functions déployées
  - [ ] Base de données vérifiée

- [ ] **Phase 2 : Tests en développement** ✅
  - [ ] Tous les scénarios testés
  - [ ] Notifications in-app fonctionnent
  - [ ] Statuts cohérents
  - [ ] Pas de doublons

- [ ] **Phase 3 : Cron jobs** ✅
  - [ ] pg_cron activé
  - [ ] Cron jobs créés et actifs
  - [ ] Tests manuels réussis

- [ ] **Phase 4 : Production mode** ✅
  - [ ] IS_PRODUCTION_MODE configuré
  - [ ] Comportement test validé
  - [ ] Comportement production documenté

- [ ] **Phase 5 : Tests pilotes** ✅
  - [ ] Push iOS testés
  - [ ] Push Android testés
  - [ ] WhatsApp testés
  - [ ] Rappels testés
  - [ ] Pas de doublons

- [ ] **Phase 6 : Monitoring** ✅
  - [ ] Vues de monitoring installées
  - [ ] Alertes configurées
  - [ ] Surveillance quotidienne en place
  - [ ] Maintenance hebdomadaire planifiée

---

## 🚀 DÉPLOIEMENT FINAL

### Étapes finales

1. [ ] **Vérifier que IS_PRODUCTION_MODE = true**
2. [ ] **Communiquer aux utilisateurs**
   - Informer de l'activation des notifications
   - Expliquer l'opt-in WhatsApp
3. [ ] **Surveiller pendant 48h**
   - Vérifier les logs toutes les 4h
   - Réagir rapidement aux erreurs
4. [ ] **Optimiser si nécessaire**
   - Ajuster la fréquence des cron jobs
   - Améliorer les messages

---

## 📞 SUPPORT

### En cas de problème

1. **Vérifier les logs Supabase**
   - Edge Functions → Logs
   - Filtrer par fonction

2. **Vérifier les logs de la base**
   ```sql
   SELECT * FROM notification_logs 
   WHERE status = 'error' 
   ORDER BY created_at DESC 
   LIMIT 20;
   ```

3. **Vérifier Twilio Console**
   - Messaging → Logs
   - Vérifier les erreurs

4. **Consulter la documentation**
   - TESTING_AND_CONFIGURATION_GUIDE.md
   - QUICK_REFERENCE_TESTING_NOTIFICATIONS.md

---

**Dernière mise à jour :** 2025-01-31
**Version :** 1.0
**Statut :** ✅ Prêt pour implémentation

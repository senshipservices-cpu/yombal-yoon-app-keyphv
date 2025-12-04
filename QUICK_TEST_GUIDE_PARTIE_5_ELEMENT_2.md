
# 🧪 GUIDE DE TEST RAPIDE - PARTIE 5 ÉLÉMENT 2
## PENDANT & APRÈS LE TRAJET

---

## 🎯 TESTS ESSENTIELS

### **TEST 1 : Arrivée du conducteur** ⏱️ 2 min

**Prérequis :**
- Un trajet publié avec au moins 1 réservation acceptée
- Être connecté en tant que conducteur

**Étapes :**
1. Aller dans "Mes trajets publiés"
2. Trouver un trajet avec réservations acceptées
3. Cliquer sur le bouton vert **"Je suis arrivé"**
4. Confirmer l'action

**Résultats attendus :**
- ✅ Message de confirmation affiché
- ✅ Passagers reçoivent notification in-app
- ✅ Passagers reçoivent push notification
- ✅ Passagers reçoivent WhatsApp (si optin activé)

**Vérification dans Supabase :**
```sql
-- Vérifier les notifications créées
SELECT * FROM notifications 
WHERE type = 'driver_arrived' 
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les logs
SELECT * FROM notification_logs 
WHERE channel IN ('push', 'whatsapp') 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### **TEST 2 : Démarrage du trajet** ⏱️ 2 min

**Prérequis :**
- Un trajet publié avec réservations acceptées
- Être connecté en tant que conducteur

**Étapes :**
1. Aller dans "Mes trajets publiés"
2. Cliquer sur le bouton orange **"Démarrer le trajet"**
3. Confirmer l'action

**Résultats attendus :**
- ✅ Message "Trajet démarré !" affiché
- ✅ Bouton "Démarrer" disparaît
- ✅ Bouton "Terminer le trajet" apparaît
- ✅ Passagers reçoivent notification in-app

**Vérification dans Supabase :**
```sql
-- Vérifier le statut du trajet
SELECT id, ride_status, started_at 
FROM carpool_rides 
WHERE id = '<ride_id>';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_started' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### **TEST 3 : Annulation par conducteur** ⏱️ 2 min

**Prérequis :**
- Un trajet publié avec réservations
- Être connecté en tant que conducteur

**Étapes :**
1. Aller dans "Mes trajets publiés"
2. Cliquer sur le bouton rouge **"Annuler le trajet"**
3. Confirmer l'action

**Résultats attendus :**
- ✅ Message "Trajet annulé" affiché
- ✅ Trajet marqué comme "Annulé"
- ✅ Toutes les réservations refusées
- ✅ Passagers reçoivent notifications (in-app + push)
- ✅ WhatsApp envoyé si départ < 24h

**Vérification dans Supabase :**
```sql
-- Vérifier le statut du trajet
SELECT id, status, ride_status 
FROM carpool_rides 
WHERE id = '<ride_id>';

-- Vérifier les réservations
SELECT id, status 
FROM carpool_bookings 
WHERE ride_id = '<ride_id>';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_cancelled' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### **TEST 4 : Annulation par passager** ⏱️ 2 min

**Prérequis :**
- Une réservation confirmée
- Être connecté en tant que passager

**Étapes :**
1. Aller dans "Mes réservations"
2. Trouver une réservation acceptée
3. Cliquer sur **"Annuler ma réservation"**
4. Confirmer l'action

**Résultats attendus :**
- ✅ Réservation supprimée de la liste
- ✅ Places libérées dans le trajet
- ✅ Conducteur reçoit notification (in-app + push)

**Vérification dans Supabase :**
```sql
-- Vérifier le statut de la réservation
SELECT id, status 
FROM carpool_bookings 
WHERE id = '<booking_id>';

-- Vérifier les places disponibles
SELECT id, seats_available 
FROM carpool_rides 
WHERE id = '<ride_id>';

-- Vérifier les notifications au conducteur
SELECT * FROM notifications 
WHERE type = 'reservation_cancelled_by_passenger' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

### **TEST 5 : Fin du trajet** ⏱️ 3 min

**Prérequis :**
- Un trajet démarré (ride_status = 'started')
- Être connecté en tant que conducteur

**Étapes :**
1. Aller dans "Mes trajets publiés"
2. Cliquer sur **"Terminer le trajet"**
3. Compléter l'écran de paiement
4. Confirmer

**Résultats attendus :**
- ✅ Trajet marqué comme terminé
- ✅ Durée réelle calculée
- ✅ Redirection vers l'écran de paiement

**Vérification dans Supabase :**
```sql
-- Vérifier le statut du trajet
SELECT id, ride_status, started_at, ended_at, duration_actual_minutes 
FROM carpool_rides 
WHERE id = '<ride_id>';
```

---

### **TEST 6 : Demande de notation (Cron)** ⏱️ 30 min

**Prérequis :**
- Un trajet terminé il y a 10-30 minutes
- Cron job configuré

**Étapes :**
1. Terminer un trajet
2. Attendre 10-30 minutes
3. Vérifier les notifications

**Résultats attendus :**
- ✅ Conducteur reçoit "Note tes passagers"
- ✅ Passagers reçoivent "Note ton conducteur"
- ✅ rating_requested_at mis à jour

**Vérification dans Supabase :**
```sql
-- Vérifier le cron job
SELECT id, rating_requested_at 
FROM carpool_rides 
WHERE ride_status = 'ended' 
AND rating_requested_at IS NOT NULL 
ORDER BY ended_at DESC 
LIMIT 5;

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'rating_request' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Test manuel du cron :**
```bash
# Appeler l'Edge Function manuellement
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request \
  -H "Authorization: Bearer <anon_key>"
```

---

### **TEST 7 : Notation** ⏱️ 2 min

**Prérequis :**
- Avoir reçu une demande de notation
- Être connecté (conducteur ou passager)

**Étapes :**
1. Cliquer sur la notification de notation
2. Sélectionner une note (1-5 étoiles)
3. Ajouter un commentaire (optionnel)
4. Cliquer sur "Envoyer l'évaluation"

**Résultats attendus :**
- ✅ Message "Merci pour votre évaluation !"
- ✅ Note enregistrée
- ✅ Commentaire enregistré
- ✅ rated_at mis à jour

**Vérification dans Supabase :**
```sql
-- Vérifier la notation
SELECT id, driver_rating, driver_rating_comment, 
       passenger_rating, passenger_rating_comment, rated_at 
FROM carpool_bookings 
WHERE id = '<booking_id>';
```

---

## 🔍 VÉRIFICATIONS GLOBALES

### **Vérifier les notifications in-app**
```sql
SELECT 
  type,
  title,
  message,
  is_read,
  created_at
FROM notifications 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC 
LIMIT 20;
```

### **Vérifier les logs de notifications**
```sql
SELECT 
  channel,
  status,
  payload,
  error_message,
  created_at
FROM notification_logs 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC 
LIMIT 20;
```

### **Vérifier les tokens push actifs**
```sql
SELECT 
  user_id,
  platform,
  active,
  last_used_at
FROM device_tokens 
WHERE user_id = '<user_id>';
```

### **Vérifier les trajets par statut**
```sql
SELECT 
  ride_status,
  COUNT(*) as count
FROM carpool_rides 
GROUP BY ride_status;
```

---

## 🐛 DÉPANNAGE

### **Problème : Notifications non reçues**

**Vérifications :**
1. Vérifier que `IS_PRODUCTION_MODE = true`
2. Vérifier les tokens push dans `device_tokens`
3. Vérifier les logs dans `notification_logs`
4. Vérifier les secrets Supabase (Twilio)

**Commandes :**
```sql
-- Vérifier les tokens actifs
SELECT * FROM device_tokens WHERE active = true;

-- Vérifier les erreurs récentes
SELECT * FROM notification_logs 
WHERE status = 'error' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### **Problème : WhatsApp non envoyé**

**Vérifications :**
1. Vérifier `whatsapp_optin = true` dans `user_profiles`
2. Vérifier `IS_PRODUCTION_MODE = true`
3. Vérifier les secrets Twilio
4. Vérifier le format du numéro de téléphone

**Commandes :**
```sql
-- Vérifier l'opt-in WhatsApp
SELECT id, phone_number, whatsapp_optin 
FROM user_profiles 
WHERE id = '<user_id>';

-- Vérifier les logs WhatsApp
SELECT * FROM notification_logs 
WHERE channel = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### **Problème : Cron job ne s'exécute pas**

**Vérifications :**
1. Vérifier la configuration du cron dans Supabase
2. Tester manuellement l'Edge Function
3. Vérifier les logs de l'Edge Function

**Test manuel :**
```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json"
```

---

## 📊 MÉTRIQUES À SURVEILLER

### **Taux de succès des notifications**
```sql
SELECT 
  channel,
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY channel), 2) as percentage
FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, status
ORDER BY channel, status;
```

### **Temps moyen de trajet**
```sql
SELECT 
  AVG(duration_actual_minutes) as avg_duration,
  MIN(duration_actual_minutes) as min_duration,
  MAX(duration_actual_minutes) as max_duration
FROM carpool_rides 
WHERE ride_status = 'ended' 
AND duration_actual_minutes IS NOT NULL;
```

### **Taux d'annulation**
```sql
SELECT 
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) * 100.0 / COUNT(*) as cancellation_rate
FROM carpool_rides 
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## ✅ CHECKLIST DE TEST COMPLET

- [ ] Test 1 : Arrivée du conducteur
- [ ] Test 2 : Démarrage du trajet
- [ ] Test 3 : Annulation par conducteur
- [ ] Test 4 : Annulation par passager
- [ ] Test 5 : Fin du trajet
- [ ] Test 6 : Demande de notation (Cron)
- [ ] Test 7 : Notation
- [ ] Vérification des notifications in-app
- [ ] Vérification des push notifications
- [ ] Vérification des WhatsApp
- [ ] Vérification des logs
- [ ] Vérification des tokens push
- [ ] Test en mode production
- [ ] Test en mode test

---

**Durée totale des tests :** ~45 minutes  
**Tests critiques :** Tests 1, 2, 3, 5  
**Tests optionnels :** Tests 4, 6, 7

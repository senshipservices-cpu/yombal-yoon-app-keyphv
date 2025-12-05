
# Guide de test rapide - Notifications Partie 2

## 🎯 Objectif

Tester les notifications pour les événements **pendant** et **après** le trajet de covoiturage.

---

## 📋 Prérequis

1. ✅ Base de données configurée avec les migrations
2. ✅ Edge Functions déployées
3. ✅ Cron job configuré
4. ✅ Mode test activé (`IS_PRODUCTION_MODE=false`)
5. ✅ Application mobile/web lancée

---

## 🧪 Tests à effectuer

### Test 1: Démarrage du trajet (3.1)

**Étapes:**

1. **Créer un trajet:**
   - Aller dans "Covoiturage" → "Publier un trajet"
   - Remplir les informations
   - Publier le trajet

2. **Créer une réservation:**
   - Avec un autre compte, rechercher le trajet
   - Réserver une place
   - Le conducteur accepte la réservation

3. **Démarrer le trajet:**
   - Aller dans "Mes trajets publiés"
   - Cliquer sur "Démarrer le trajet"
   - Confirmer

**Résultats attendus:**

✅ Statut du trajet passe à "started"
✅ Bouton "Démarrer" disparaît
✅ Bouton "Terminer le trajet" apparaît
✅ Passagers reçoivent notification in-app:
   - Titre: "🚗 Trajet démarré"
   - Message: "Le trajet [origine] → [destination] a démarré"

**Vérification SQL:**
```sql
-- Vérifier le statut du trajet
SELECT id, ride_status, started_at 
FROM carpool_rides 
WHERE id = 'RIDE_ID';

-- Vérifier les notifications in-app
SELECT * FROM notifications 
WHERE type = 'ride_started' 
AND created_at >= NOW() - INTERVAL '5 minutes';
```

---

### Test 2: Annulation par conducteur (3.2)

**Étapes:**

1. **Créer un trajet avec réservations:**
   - Créer un trajet
   - Accepter au moins une réservation

2. **Annuler le trajet:**
   - Aller dans "Mes trajets publiés"
   - Cliquer sur "Annuler le trajet"
   - Confirmer l'annulation

**Résultats attendus:**

✅ Statut du trajet passe à "cancelled"
✅ Toutes les réservations passent à "refused"
✅ Passagers reçoivent notifications:
   - **In-app:**
     - Titre: "❌ Trajet annulé"
     - Message: "[Nom conducteur] a annulé [origine] → [destination]"
   - **Push:** (si mode production)
     - Même message
   - **WhatsApp:** (si mode production et opt-in)
     - "Le conducteur a annulé votre trajet. Vous pouvez en réserver un autre."

**Vérification SQL:**
```sql
-- Vérifier le statut du trajet
SELECT id, status, ride_status 
FROM carpool_rides 
WHERE id = 'RIDE_ID';

-- Vérifier les réservations
SELECT id, status 
FROM carpool_bookings 
WHERE ride_id = 'RIDE_ID';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_cancelled' 
AND created_at >= NOW() - INTERVAL '5 minutes';

-- Vérifier les logs
SELECT * FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

---

### Test 3: Annulation par passager (3.3)

**Étapes:**

1. **Créer une réservation:**
   - Réserver un trajet
   - Attendre l'acceptation du conducteur

2. **Annuler la réservation:**
   - Aller dans "Mes réservations"
   - Cliquer sur "Annuler"
   - Confirmer l'annulation

**Résultats attendus:**

✅ Statut de la réservation passe à "cancelled_by_passenger"
✅ Places disponibles du trajet augmentent
✅ Conducteur reçoit notifications:
   - **In-app:**
     - Titre: "❌ Annulation de réservation"
     - Message: "[Nom passager] a annulé sa réservation"
   - **Push:** (si mode production)
     - Même message

**Vérification SQL:**
```sql
-- Vérifier le statut de la réservation
SELECT id, status 
FROM carpool_bookings 
WHERE id = 'BOOKING_ID';

-- Vérifier les places disponibles
SELECT id, seats_available 
FROM carpool_rides 
WHERE id = 'RIDE_ID';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'reservation_cancelled_by_passenger' 
AND created_at >= NOW() - INTERVAL '5 minutes';
```

---

### Test 4: Fin du trajet (4.1)

**Étapes:**

1. **Démarrer un trajet:**
   - Suivre les étapes du Test 1

2. **Attendre quelques minutes:**
   - Pour avoir une durée réelle mesurable

3. **Terminer le trajet:**
   - Cliquer sur "Terminer le trajet"
   - Confirmer

**Résultats attendus:**

✅ Statut du trajet passe à "ended"
✅ Durée réelle calculée et enregistrée
✅ Conducteur reçoit notification in-app:
   - Titre: "🏁 Trajet terminé"
   - Message: "Trajet [origine] → [destination] terminé en X minutes"
   - Métadonnées: durée, prix par place
✅ Passagers reçoivent notification in-app:
   - Titre: "🏁 Trajet terminé"
   - Message: "Trajet [origine] → [destination] terminé"
   - Métadonnées: durée, prix total

**Vérification SQL:**
```sql
-- Vérifier le statut du trajet
SELECT id, ride_status, started_at, ended_at, duration_actual_minutes 
FROM carpool_rides 
WHERE id = 'RIDE_ID';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'ride_ended' 
AND created_at >= NOW() - INTERVAL '5 minutes';
```

---

### Test 5: Demande de notation (4.2)

**Étapes:**

1. **Terminer un trajet:**
   - Suivre les étapes du Test 4

2. **Option A - Attendre naturellement:**
   - Attendre 10-30 minutes
   - Le cron job s'exécutera automatiquement

3. **Option B - Forcer l'exécution (pour test rapide):**
   ```sql
   -- Modifier temporairement ended_at pour simuler un trajet terminé il y a 15 minutes
   UPDATE carpool_rides 
   SET ended_at = NOW() - INTERVAL '15 minutes'
   WHERE id = 'RIDE_ID';
   
   -- Forcer l'exécution du cron job
   SELECT call_on_rating_request();
   ```

**Résultats attendus:**

✅ Conducteur reçoit notifications:
   - **In-app:**
     - Titre: "⭐ Note tes passagers"
     - Message: "Comment s'est passé ton trajet ? Note tes passagers"
   - **Push:** (si mode production)
     - Même message

✅ Passagers reçoivent notifications:
   - **In-app:**
     - Titre: "⭐ Note ton conducteur"
     - Message: "Note ton conducteur pour le trajet [origine] → [destination] 🚗"
   - **Push:** (si mode production)
     - Même message

✅ Champ `rating_requested_at` rempli dans la table

**Vérification SQL:**
```sql
-- Vérifier que la demande a été marquée
SELECT id, ended_at, rating_requested_at 
FROM carpool_rides 
WHERE id = 'RIDE_ID';

-- Vérifier les notifications
SELECT * FROM notifications 
WHERE type = 'rating_request' 
AND created_at >= NOW() - INTERVAL '5 minutes';

-- Vérifier l'historique du cron job
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rating-request-job')
ORDER BY start_time DESC
LIMIT 5;
```

---

### Test 6: Soumission de notation

**Étapes:**

1. **Recevoir une demande de notation:**
   - Suivre les étapes du Test 5

2. **Ouvrir l'écran de notation:**
   - Cliquer sur la notification
   - Ou aller dans "Mes réservations" / "Mes trajets"

3. **Soumettre une note:**
   - Sélectionner 1-5 étoiles
   - (Optionnel) Ajouter un commentaire
   - Cliquer sur "Envoyer l'évaluation"

**Résultats attendus:**

✅ Note enregistrée dans la base de données
✅ Commentaire enregistré (si fourni)
✅ Champ `rated_at` rempli
✅ Message de confirmation affiché
✅ Retour à l'écran précédent

**Vérification SQL:**
```sql
-- Vérifier la note du conducteur (soumise par passager)
SELECT id, driver_rating, driver_rating_comment, rated_at 
FROM carpool_bookings 
WHERE id = 'BOOKING_ID';

-- Vérifier la note du passager (soumise par conducteur)
SELECT id, passenger_rating, passenger_rating_comment, rated_at 
FROM carpool_bookings 
WHERE id = 'BOOKING_ID';
```

---

## 🔍 Vérifications globales

### 1. Vérifier les Edge Functions

```bash
# Logs de on-ride-status-changed
supabase functions logs on-ride-status-changed --project-ref drxtaxepofuoelplgrei

# Logs de on-rating-request
supabase functions logs on-rating-request --project-ref drxtaxepofuoelplgrei
```

### 2. Vérifier les triggers

```sql
-- Vérifier que les triggers existent
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('carpool_rides', 'carpool_bookings')
  AND t.tgname LIKE '%ride_status%' OR t.tgname LIKE '%passenger_cancelled%'
ORDER BY c.relname, t.tgname;
```

### 3. Vérifier le cron job

```sql
-- Vérifier que le job existe
SELECT * FROM cron.job WHERE jobname = 'rating-request-job';

-- Vérifier les exécutions récentes
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rating-request-job')
ORDER BY start_time DESC
LIMIT 10;
```

### 4. Statistiques des notifications

```sql
-- Notifications par type (dernières 24h)
SELECT 
  type,
  COUNT(*) as count
FROM notifications
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY type
ORDER BY count DESC;

-- Notifications par canal (dernières 24h)
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY channel, status
ORDER BY count DESC;
```

---

## ⚠️ Problèmes courants

### Problème 1: Notifications in-app non reçues

**Symptômes:**
- Aucune notification dans la cloche
- Table `notifications` vide

**Solutions:**
1. Vérifier que l'Edge Function est appelée:
   ```sql
   SELECT * FROM notification_logs 
   WHERE created_at >= NOW() - INTERVAL '10 minutes';
   ```

2. Vérifier les logs de l'Edge Function:
   ```bash
   supabase functions logs send-notification-unified --project-ref drxtaxepofuoelplgrei
   ```

3. Vérifier que le user_id est correct

---

### Problème 2: Cron job ne s'exécute pas

**Symptômes:**
- Pas de demandes de notation après 10-30 minutes
- Table `cron.job_run_details` vide

**Solutions:**
1. Vérifier que pg_cron est activé:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Vérifier que le job est actif:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'rating-request-job';
   ```

3. Forcer l'exécution manuellement:
   ```sql
   SELECT call_on_rating_request();
   ```

---

### Problème 3: Triggers ne se déclenchent pas

**Symptômes:**
- Changements de statut sans notifications
- Edge Functions non appelées

**Solutions:**
1. Vérifier que les triggers existent:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname IN ('tg_on_ride_status_changed', 'tg_on_passenger_cancelled');
   ```

2. Vérifier les logs Postgres:
   ```bash
   # Dans Supabase Dashboard → Database → Logs
   ```

3. Vérifier la configuration de l'URL de base:
   ```sql
   SELECT * FROM app_config WHERE key = 'edge_function_base_url';
   ```

---

## ✅ Checklist de validation

Avant de passer en production, vérifier que:

- [ ] Test 1 (Démarrage) réussi
- [ ] Test 2 (Annulation conducteur) réussi
- [ ] Test 3 (Annulation passager) réussi
- [ ] Test 4 (Fin de trajet) réussi
- [ ] Test 5 (Demande de notation) réussi
- [ ] Test 6 (Soumission de notation) réussi
- [ ] Tous les triggers fonctionnent
- [ ] Cron job s'exécute correctement
- [ ] Notifications in-app affichées
- [ ] Logs sans erreurs
- [ ] Mode production configuré (`IS_PRODUCTION_MODE=true`)
- [ ] Secrets Twilio configurés (pour WhatsApp)

---

## 🚀 Passage en production

Une fois tous les tests validés:

1. **Activer le mode production:**
   ```bash
   # Dans Supabase Dashboard → Edge Functions → Settings
   IS_PRODUCTION_MODE=true
   ```

2. **Vérifier les secrets Twilio:**
   ```bash
   # Vérifier que les secrets sont configurés
   supabase secrets list --project-ref drxtaxepofuoelplgrei
   ```

3. **Surveiller les logs:**
   ```bash
   # Surveiller les Edge Functions
   supabase functions logs --project-ref drxtaxepofuoelplgrei --follow
   ```

4. **Tester avec de vrais utilisateurs:**
   - Commencer avec un petit groupe
   - Surveiller les retours
   - Ajuster si nécessaire

---

## 📚 Documentation associée

- [NOTIFICATIONS_PARTIE_2_IMPLEMENTATION_COMPLETE.md](./NOTIFICATIONS_PARTIE_2_IMPLEMENTATION_COMPLETE.md) - Documentation complète
- [NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md](./NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md) - Architecture
- [SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md](./SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md) - Configuration des secrets

---

Bon test! 🎉

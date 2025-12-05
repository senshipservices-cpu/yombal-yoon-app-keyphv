
# Notifications PENDANT et APRÈS le trajet - Implémentation Complète

## ✅ Résumé de l'implémentation

Ce document décrit l'implémentation complète du système de notifications pour les événements **pendant** et **après** le trajet de covoiturage (Partie 2).

---

## 📋 Table des matières

1. [Architecture générale](#architecture-générale)
2. [Base de données](#base-de-données)
3. [Edge Functions](#edge-functions)
4. [Cron Jobs](#cron-jobs)
5. [Intégration Frontend](#intégration-frontend)
6. [Tests et validation](#tests-et-validation)

---

## 🏗️ Architecture générale

### Flux de notifications

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉVÉNEMENTS PENDANT LE TRAJET              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3.1. Démarrage du trajet                                    │
│  ├─ Conducteur clique "Démarrer"                            │
│  ├─ UPDATE carpool_rides SET ride_status = 'started'        │
│  ├─ Trigger: tg_on_ride_status_changed                      │
│  └─ Edge Function: on-ride-status-changed                   │
│      └─ Passagers: In-app "Trajet démarré"                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3.2. Annulation de dernière minute (conducteur)            │
│  ├─ Conducteur annule le trajet                             │
│  ├─ UPDATE carpool_rides SET ride_status = 'cancelled'      │
│  ├─ Trigger: tg_on_ride_status_changed                      │
│  └─ Edge Function: on-ride-status-changed                   │
│      └─ Passagers: Push + WhatsApp + In-app                 │
│          "Trajet annulé ❌"                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3.3. Annulation par le passager                            │
│  ├─ Passager annule sa réservation                          │
│  ├─ UPDATE carpool_bookings SET status =                    │
│  │   'cancelled_by_passenger'                               │
│  ├─ Trigger: tg_on_passenger_cancelled                      │
│  └─ Edge Function: on-ride-status-changed                   │
│      └─ Conducteur: Push + In-app                           │
│          "[Nom] a annulé sa réservation"                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ÉVÉNEMENTS APRÈS LE TRAJET                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4.1. Arrivée / Fin du trajet                               │
│  ├─ Conducteur clique "Terminer le trajet"                  │
│  ├─ UPDATE carpool_rides SET ride_status = 'ended'          │
│  ├─ Trigger: tg_on_ride_status_changed                      │
│  └─ Edge Function: on-ride-status-changed                   │
│      ├─ Conducteur: In-app récapitulatif                    │
│      └─ Passagers: In-app récapitulatif                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4.2. Demande de notation (10-30 min après)                 │
│  ├─ Cron Job: rating-request-job (toutes les 5 min)         │
│  ├─ Edge Function: on-rating-request                        │
│  ├─ Conducteur: Push + In-app                               │
│  │   "Note tes passagers ⭐"                                 │
│  └─ Passagers: Push + In-app                                │
│      "Note ton conducteur ⭐"                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de données

### Migrations créées

#### 1. `create_ride_status_change_triggers`

**Fonctions SQL créées:**

```sql
-- Fonction pour notifier les changements de statut de trajet
CREATE OR REPLACE FUNCTION call_on_ride_status_changed()
RETURNS TRIGGER AS $$
-- Appelle l'Edge Function on-ride-status-changed
-- avec les détails du trajet et du changement de statut
$$;

-- Fonction pour notifier l'annulation par un passager
CREATE OR REPLACE FUNCTION call_on_passenger_cancelled()
RETURNS TRIGGER AS $$
-- Appelle l'Edge Function on-ride-status-changed
-- avec les détails de l'annulation du passager
$$;
```

**Triggers créés:**

```sql
-- Trigger sur changement de statut de trajet
CREATE TRIGGER tg_on_ride_status_changed
  AFTER UPDATE OF ride_status ON carpool_rides
  FOR EACH ROW
  WHEN (OLD.ride_status IS DISTINCT FROM NEW.ride_status)
  EXECUTE FUNCTION call_on_ride_status_changed();

-- Trigger sur annulation par passager
CREATE TRIGGER tg_on_passenger_cancelled
  AFTER UPDATE OF status ON carpool_bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled_by_passenger' 
    AND OLD.status != 'cancelled_by_passenger')
  EXECUTE FUNCTION call_on_passenger_cancelled();
```

#### 2. `setup_rating_request_cron_job`

**Extension activée:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**Fonction SQL créée:**
```sql
CREATE OR REPLACE FUNCTION call_on_rating_request()
RETURNS void AS $$
-- Appelle l'Edge Function on-rating-request
-- pour envoyer les demandes de notation
$$;
```

**Cron Job configuré:**
```sql
-- Exécution toutes les 5 minutes
SELECT cron.schedule(
  'rating-request-job',
  '*/5 * * * *',
  $$SELECT call_on_rating_request()$$
);
```

---

## ⚡ Edge Functions

### 1. `on-ride-status-changed`

**Fichier:** `supabase/functions/on-ride-status-changed/index.ts`

**Responsabilités:**
- Gérer les notifications pour tous les changements de statut de trajet
- Démarrage, annulation (conducteur/passager), fin de trajet

**Événements gérés:**

#### 3.1. Démarrage du trajet (`status: 'started'`)
```typescript
// Récupère les passagers confirmés
const { data: bookings } = await supabase
  .from('carpool_bookings')
  .select('passenger_id')
  .eq('ride_id', payload.rideId)
  .eq('status', 'accepted');

// Envoie notification in-app à chaque passager
for (const booking of bookings) {
  await supabase.functions.invoke('send-notification-unified', {
    body: {
      type: 'ride_started',
      userId: booking.passenger_id,
      title: '🚗 Trajet démarré',
      message: `Le trajet ${origin} → ${destination} a démarré`,
      channels: ['in_app'],
    },
  });
}
```

#### 3.2. Annulation par conducteur (`status: 'cancelled', cancelledBy: 'driver'`)
```typescript
// Récupère les passagers avec numéros de téléphone
const { data: bookings } = await supabase
  .from('carpool_bookings')
  .select('*, user_profiles!carpool_bookings_passenger_id_fkey(phone_number)')
  .eq('ride_id', payload.rideId)
  .eq('status', 'accepted');

// Envoie notifications push + WhatsApp + in-app
for (const booking of bookings) {
  await supabase.functions.invoke('send-notification-unified', {
    body: {
      type: 'ride_cancelled',
      userId: booking.passenger_id,
      title: '❌ Trajet annulé',
      message: `${driverName} a annulé ${origin} → ${destination}`,
      channels: ['in_app', 'push', 'whatsapp'],
      phoneNumber: passenger?.phone_number,
    },
  });
}
```

#### 3.3. Annulation par passager (`status: 'cancelled', cancelledBy: 'passenger'`)
```typescript
// Notifie le conducteur
await supabase.functions.invoke('send-notification-unified', {
  body: {
    type: 'reservation_cancelled_by_passenger',
    userId: payload.driverId,
    title: '❌ Annulation de réservation',
    message: `${passengerName} a annulé sa réservation`,
    channels: ['in_app', 'push'],
  },
});
```

#### 4.1. Fin du trajet (`status: 'ended'`)
```typescript
// Calcule la durée réelle
const durationMinutes = Math.round(
  (endedAt.getTime() - startedAt.getTime()) / 60000
);

// Notifie le conducteur avec récapitulatif
await supabase.functions.invoke('send-notification-unified', {
  body: {
    type: 'ride_ended',
    userId: payload.driverId,
    title: '🏁 Trajet terminé',
    message: `Trajet ${origin} → ${destination} terminé en ${durationMinutes} minutes`,
    metadata: {
      durationMinutes,
      pricePerSeat: ride.price_per_seat,
      isDriver: true,
    },
    channels: ['in_app'],
  },
});

// Notifie chaque passager avec récapitulatif
for (const booking of bookings) {
  const totalPrice = ride.price_per_seat * booking.number_of_passengers;
  
  await supabase.functions.invoke('send-notification-unified', {
    body: {
      type: 'ride_ended',
      userId: booking.passenger_id,
      title: '🏁 Trajet terminé',
      message: `Trajet ${origin} → ${destination} terminé`,
      metadata: {
        durationMinutes,
        totalPrice,
        isDriver: false,
      },
      channels: ['in_app'],
    },
  });
}
```

---

### 2. `on-rating-request`

**Fichier:** `supabase/functions/on-rating-request/index.ts`

**Responsabilités:**
- Exécuté par cron job toutes les 5 minutes
- Trouve les trajets terminés il y a 10-30 minutes
- Envoie les demandes de notation

**Logique:**

```typescript
// Définit la fenêtre de temps (10-30 minutes)
const now = new Date();
const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

// Trouve les trajets éligibles
const { data: rides } = await supabase
  .from('carpool_rides')
  .select('*')
  .eq('ride_status', 'ended')
  .gte('ended_at', thirtyMinutesAgo.toISOString())
  .lte('ended_at', tenMinutesAgo.toISOString())
  .is('rating_requested_at', null);

for (const ride of rides) {
  // 4.2. Demande de notation au conducteur
  await supabase.functions.invoke('send-notification-unified', {
    body: {
      type: 'rating_request',
      userId: ride.driver_id,
      title: '⭐ Note tes passagers',
      message: 'Comment s\'est passé ton trajet ? Note tes passagers',
      metadata: {
        rideId: ride.id,
        isDriver: true,
      },
      channels: ['in_app', 'push'],
    },
  });

  // 4.2. Demande de notation aux passagers
  const { data: bookings } = await supabase
    .from('carpool_bookings')
    .select('id, passenger_id')
    .eq('ride_id', ride.id)
    .eq('status', 'accepted');

  for (const booking of bookings) {
    await supabase.functions.invoke('send-notification-unified', {
      body: {
        type: 'rating_request',
        userId: booking.passenger_id,
        title: '⭐ Note ton conducteur',
        message: `Note ton conducteur pour le trajet ${origin} → ${destination} 🚗`,
        metadata: {
          rideId: ride.id,
          reservationId: booking.id,
          isDriver: false,
        },
        channels: ['in_app', 'push'],
      },
    });
  }

  // Marque la demande comme envoyée
  await supabase
    .from('carpool_rides')
    .update({ rating_requested_at: now.toISOString() })
    .eq('id', ride.id);
}
```

---

### 3. `send-notification-unified`

**Fichier:** `supabase/functions/send-notification-unified/index.ts`

**Responsabilités:**
- Gestionnaire unifié pour tous les canaux de notification
- In-app, Push (Expo/FCM), WhatsApp (Twilio)
- Logging et gestion des erreurs

**Canaux supportés:**

1. **In-app:** Insertion dans table `notifications`
2. **Push:** Envoi via Expo Push API
3. **WhatsApp:** Envoi via Twilio (si `IS_PRODUCTION_MODE=true`)

**Fonctionnalités:**
- ✅ Vérification du opt-in WhatsApp
- ✅ Gestion des tokens push invalides
- ✅ Logging de toutes les notifications
- ✅ Mode test/production
- ✅ Anti-duplication

---

## 🔄 Cron Jobs

### Configuration pg_cron

**Job:** `rating-request-job`
- **Fréquence:** Toutes les 5 minutes (`*/5 * * * *`)
- **Fonction:** `call_on_rating_request()`
- **Edge Function:** `on-rating-request`

**Vérification:**
```sql
-- Voir les jobs actifs
SELECT * FROM cron.job WHERE jobname = 'rating-request-job';

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rating-request-job')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 💻 Intégration Frontend

### CovoiturageContext

**Fichier:** `contexts/CovoiturageContext.tsx`

**Fonctions implémentées:**

#### 1. `startRide(rideId: string)`
```typescript
// Met à jour le statut dans Supabase
await supabase
  .from('carpool_rides')
  .update({ 
    ride_status: 'started',
    started_at: new Date().toISOString()
  })
  .eq('id', rideId);

// Appelle l'Edge Function pour notifier les passagers
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId,
    status: 'started',
    driverId,
    driverName,
    origin,
    destination,
    dateDeparture,
    timeDeparture,
  },
});
```

#### 2. `endRide(rideId: string)`
```typescript
// Calcule la durée réelle
const durationActualMinutes = Math.round(
  (endTime.getTime() - startTime.getTime()) / (1000 * 60)
);

// Met à jour le statut dans Supabase
await supabase
  .from('carpool_rides')
  .update({ 
    ride_status: 'ended',
    ended_at: new Date().toISOString(),
    duration_actual_minutes: durationActualMinutes,
  })
  .eq('id', rideId);

// Appelle l'Edge Function pour créer les récapitulatifs
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId,
    status: 'ended',
    driverId,
    driverName,
    origin,
    destination,
    dateDeparture,
    timeDeparture,
  },
});
```

#### 3. `cancelRide(rideId: string)`
```typescript
// Vérifie si c'est une annulation de dernière minute
const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
const isLastMinute = hoursUntilDeparture < 24;

// Met à jour le statut dans Supabase
await supabase
  .from('carpool_rides')
  .update({ 
    status: 'cancelled',
    ride_status: 'cancelled',
  })
  .eq('id', rideId);

// Appelle l'Edge Function pour notifier les passagers
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId,
    status: 'cancelled',
    cancelledBy: 'driver',
    driverId,
    driverName,
    origin,
    destination,
    dateDeparture,
    timeDeparture,
  },
});
```

#### 4. `cancelReservation(reservationId: string)`
```typescript
// Met à jour le statut dans Supabase
await supabase
  .from('carpool_bookings')
  .update({ status: 'cancelled_by_passenger' })
  .eq('id', reservationId);

// Appelle l'Edge Function pour notifier le conducteur
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId,
    status: 'cancelled',
    cancelledBy: 'passenger',
    driverId,
    driverName,
    cancelledPassengerId,
    cancelledPassengerName,
    origin,
    destination,
    dateDeparture,
    timeDeparture,
  },
});
```

#### 5. `submitRating(reservationId, rating, comment, isDriverRating)`
```typescript
const updateData = isDriverRating
  ? {
      driver_rating: rating,
      driver_rating_comment: comment,
      rated_at: new Date().toISOString()
    }
  : {
      passenger_rating: rating,
      passenger_rating_comment: comment,
      rated_at: new Date().toISOString()
    };

await supabase
  .from('carpool_bookings')
  .update(updateData)
  .eq('id', reservationId);
```

---

### Écrans UI

#### 1. `app/covoiturage/my-rides.tsx`

**Boutons d'action:**

```typescript
// Bouton "Démarrer le trajet"
<TouchableOpacity
  style={styles.startTripButton}
  onPress={() => handleStartRide(ride.id)}
>
  <IconSymbol name="play-circle" />
  <Text>Démarrer le trajet</Text>
</TouchableOpacity>

// Bouton "Terminer le trajet"
<TouchableOpacity
  style={styles.endTripButton}
  onPress={() => router.push(`/covoiturage/end-trip-payment?rideId=${ride.id}`)}
>
  <IconSymbol name="check-circle" />
  <Text>Terminer le trajet</Text>
</TouchableOpacity>

// Bouton "Annuler le trajet"
<TouchableOpacity
  style={styles.cancelRideButton}
  onPress={() => handleCancelRide(ride.id)}
>
  <IconSymbol name="cancel" />
  <Text>Annuler le trajet</Text>
</TouchableOpacity>
```

#### 2. `app/covoiturage/rate-trip.tsx`

**Interface de notation:**

```typescript
// Sélection d'étoiles
<View style={styles.starsContainer}>
  {[1, 2, 3, 4, 5].map((star) => (
    <TouchableOpacity
      key={star}
      onPress={() => setRating(star)}
    >
      <IconSymbol
        name={rating >= star ? 'star' : 'star-border'}
        color={rating >= star ? '#FFD700' : colors.textSecondary}
      />
    </TouchableOpacity>
  ))}
</View>

// Champ de commentaire
<TextInput
  style={styles.commentInput}
  placeholder="Partagez votre expérience..."
  value={comment}
  onChangeText={setComment}
  multiline
/>

// Bouton de soumission
<TouchableOpacity
  style={styles.submitButton}
  onPress={handleSubmit}
>
  <Text>Envoyer l'évaluation</Text>
</TouchableOpacity>
```

---

## 🧪 Tests et validation

### 1. Test du démarrage de trajet

```bash
# 1. Créer un trajet de test
# 2. Accepter une réservation
# 3. Cliquer sur "Démarrer le trajet"
# 4. Vérifier:
#    - Statut du trajet = 'started'
#    - Notification in-app pour les passagers
#    - Bouton "Terminer le trajet" visible
```

### 2. Test de l'annulation par conducteur

```bash
# 1. Créer un trajet avec réservations acceptées
# 2. Cliquer sur "Annuler le trajet"
# 3. Vérifier:
#    - Statut du trajet = 'cancelled'
#    - Notifications push + WhatsApp + in-app pour passagers
#    - Message "Trajet annulé ❌"
```

### 3. Test de l'annulation par passager

```bash
# 1. Réserver un trajet
# 2. Annuler la réservation
# 3. Vérifier:
#    - Statut de la réservation = 'cancelled_by_passenger'
#    - Notification push + in-app pour conducteur
#    - Places disponibles mises à jour
```

### 4. Test de fin de trajet

```bash
# 1. Démarrer un trajet
# 2. Cliquer sur "Terminer le trajet"
# 3. Vérifier:
#    - Statut du trajet = 'ended'
#    - Notifications in-app avec récapitulatif
#    - Durée réelle calculée
```

### 5. Test des demandes de notation

```bash
# 1. Terminer un trajet
# 2. Attendre 10-30 minutes (ou forcer l'exécution du cron)
# 3. Vérifier:
#    - Notifications push + in-app pour conducteur et passagers
#    - Message "Note tes passagers ⭐" / "Note ton conducteur ⭐"
#    - Écran de notation accessible
```

### Commandes SQL de test

```sql
-- Forcer l'exécution du cron job de notation
SELECT call_on_rating_request();

-- Vérifier les trajets éligibles pour notation
SELECT id, driver_name, departure_city, arrival_city, ended_at, rating_requested_at
FROM carpool_rides
WHERE ride_status = 'ended'
  AND ended_at >= NOW() - INTERVAL '30 minutes'
  AND ended_at <= NOW() - INTERVAL '10 minutes'
  AND rating_requested_at IS NULL;

-- Vérifier les notifications envoyées
SELECT * FROM notification_logs
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Vérifier les notifications in-app
SELECT * FROM notifications
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 📊 Monitoring

### Logs à surveiller

1. **Edge Functions:**
```bash
# Logs de on-ride-status-changed
supabase functions logs on-ride-status-changed --project-ref drxtaxepofuoelplgrei

# Logs de on-rating-request
supabase functions logs on-rating-request --project-ref drxtaxepofuoelplgrei
```

2. **Cron Jobs:**
```sql
-- Historique d'exécution
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rating-request-job')
ORDER BY start_time DESC
LIMIT 20;
```

3. **Notifications:**
```sql
-- Statistiques des notifications
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY channel, status;
```

---

## 🎯 Checklist de validation

### Fonctionnalités implémentées

- [x] 3.1. Démarrage du trajet
  - [x] Bouton "Démarrer" dans l'interface conducteur
  - [x] Mise à jour du statut dans Supabase
  - [x] Trigger database pour appeler Edge Function
  - [x] Notifications in-app pour passagers

- [x] 3.2. Annulation de dernière minute (conducteur)
  - [x] Bouton "Annuler le trajet" dans l'interface conducteur
  - [x] Mise à jour du statut dans Supabase
  - [x] Trigger database pour appeler Edge Function
  - [x] Notifications push + WhatsApp + in-app pour passagers

- [x] 3.3. Annulation par le passager
  - [x] Bouton "Annuler" dans l'interface passager
  - [x] Mise à jour du statut dans Supabase
  - [x] Trigger database pour appeler Edge Function
  - [x] Notifications push + in-app pour conducteur
  - [x] Mise à jour des places disponibles

- [x] 4.1. Arrivée / Fin du trajet
  - [x] Bouton "Terminer le trajet" dans l'interface conducteur
  - [x] Mise à jour du statut dans Supabase
  - [x] Calcul de la durée réelle
  - [x] Trigger database pour appeler Edge Function
  - [x] Récapitulatif in-app pour conducteur et passagers

- [x] 4.2. Demande de notation
  - [x] Cron job configuré (toutes les 5 minutes)
  - [x] Edge Function on-rating-request
  - [x] Notifications push + in-app pour conducteur
  - [x] Notifications push + in-app pour passagers
  - [x] Interface de notation fonctionnelle
  - [x] Sauvegarde des notes dans Supabase

### Canaux techniques

- [x] Notifications push via Expo/FCM
- [x] Notifications in-app via table Supabase
- [x] Notifications WhatsApp via Twilio
- [x] Logging de toutes les notifications
- [x] Anti-duplication des notifications
- [x] Mode test/production (IS_PRODUCTION_MODE)

---

## 🚀 Prochaines étapes

1. **Tests en production:**
   - Activer `IS_PRODUCTION_MODE=true`
   - Tester avec de vrais utilisateurs
   - Surveiller les logs

2. **Optimisations:**
   - Ajuster la fenêtre de temps pour les demandes de notation
   - Personnaliser les messages WhatsApp
   - Ajouter des templates WhatsApp validés

3. **Améliorations:**
   - Ajouter des rappels si pas de notation après X jours
   - Implémenter un système de badges/récompenses
   - Ajouter des statistiques de notation dans le profil

---

## 📚 Documentation associée

- [NOTIFICATIONS_PARTIE_1_IMPLEMENTATION_COMPLETE.md](./NOTIFICATIONS_PARTIE_1_IMPLEMENTATION_COMPLETE.md) - Notifications avant et pendant la réservation
- [NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md](./NOTIFICATION_SYSTEM_COMPLETE_ARCHITECTURE.md) - Architecture complète du système
- [QUICK_TEST_GUIDE_NOTIFICATIONS_PARTIE_1.md](./QUICK_TEST_GUIDE_NOTIFICATIONS_PARTIE_1.md) - Guide de test Partie 1
- [SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md](./SUPABASE_EDGE_FUNCTION_SECRETS_SETUP.md) - Configuration des secrets

---

## ✅ Conclusion

Le système de notifications pour les événements **pendant** et **après** le trajet est maintenant **complètement implémenté** et **opérationnel**.

Toutes les fonctionnalités demandées ont été développées:
- ✅ Démarrage du trajet avec notifications aux passagers
- ✅ Annulation de dernière minute avec notifications multi-canal
- ✅ Annulation par passager avec notification au conducteur
- ✅ Fin du trajet avec récapitulatifs
- ✅ Demandes de notation automatiques 10-30 minutes après

Le système est prêt pour les tests en production! 🎉

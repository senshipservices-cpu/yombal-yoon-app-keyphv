
# PARTIE 3 — ÉLÉMENT 2 : EDGE FUNCTIONS & SYSTÈME DE NOTIFICATIONS
## IMPLÉMENTATION COMPLÈTE ✅

Date: 2 février 2025

---

## 📋 RÉSUMÉ DE L'IMPLÉMENTATION

Toutes les Edge Functions et le système de notifications complet pour le module Covoiturage ont été implémentés avec succès.

---

## 🚀 EDGE FUNCTIONS DÉPLOYÉES

### 1. **send-notification-unified** (Fonction Unifiée)
**Rôle:** Gestionnaire central pour toutes les notifications (in-app, push, WhatsApp)

**Fonctionnalités:**
- ✅ Création de notifications in-app dans la table `notifications`
- ✅ Envoi de notifications push via Expo/FCM
- ✅ Envoi de notifications WhatsApp via Twilio
- ✅ Vérification du `whatsapp_optin` avant envoi WhatsApp
- ✅ Gestion des tokens invalides (désactivation automatique)
- ✅ Logging complet dans `notification_logs`
- ✅ Respect du mode production (`IS_PRODUCTION_MODE`)

**Payload:**
```typescript
{
  type: string;
  userId: string;
  title: string;
  message: string;
  metadata?: any;
  channels?: ('in_app' | 'push' | 'whatsapp')[];
  phoneNumber?: string;
}
```

---

### 2. **on-ride-created**
**Déclenchement:** Quand un conducteur publie un trajet

**Tâches:**
- ✅ Notification in-app + push au conducteur (confirmation)
- ✅ Matching automatique avec `ride_alerts`
- ✅ Filtrage par origine, destination, date, prix, places
- ✅ Notification push + in-app aux passagers matchés

**Appel depuis le frontend:**
```typescript
await supabase.functions.invoke('on-ride-created', {
  body: {
    rideId: ride.id,
    driverId: driver.id,
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-10',
    timeDeparture: '08:00',
    price: 5000,
    seatsAvailable: 3,
  },
});
```

---

### 3. **on-reservation-requested**
**Déclenchement:** Quand un passager demande une réservation

**Tâches:**
- ✅ Notification in-app + push au conducteur
- ✅ WhatsApp au conducteur si départ < 2h
- ✅ Notification in-app au passager (confirmation d'envoi)

**Appel depuis le frontend:**
```typescript
await supabase.functions.invoke('on-reservation-requested', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    passengerId: passenger.id,
    passengerName: 'Jean Dupont',
    passengerPhone: '+221771234567',
    numberOfPassengers: 2,
    driverId: driver.id,
    driverPhone: '+221779876543',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-10',
    timeDeparture: '08:00',
  },
});
```

---

### 4. **on-reservation-status-changed**
**Déclenchement:** Quand le conducteur accepte ou refuse une réservation

**Tâches:**
- ✅ **Acceptée:** Push + in-app + WhatsApp (si proche du départ) au passager
- ✅ **Refusée:** Push + in-app au passager

**Appel depuis le frontend:**
```typescript
await supabase.functions.invoke('on-reservation-status-changed', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    status: 'accepted', // ou 'refused'
    passengerId: passenger.id,
    passengerPhone: '+221771234567',
    driverId: driver.id,
    driverName: 'Marie Martin',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-10',
    timeDeparture: '08:00',
  },
});
```

---

### 5. **on-ride-reminders** (Scheduled Cron)
**Déclenchement:** Tâche planifiée (toutes les 10 minutes recommandé)

**Tâches:**
- ✅ **J-1 (24h avant):** Push + in-app au conducteur et passagers
- ✅ **H-1 (1h avant):** Push + in-app + WhatsApp au conducteur et passagers

**Configuration Cron (à configurer dans Supabase Dashboard):**
```
Nom: ride-reminders
Fonction: on-ride-reminders
Schedule: */10 * * * * (toutes les 10 minutes)
```

---

### 6. **on-driver-arrived**
**Déclenchement:** Quand le conducteur clique "Je suis arrivé"

**Tâches:**
- ✅ Push + WhatsApp + in-app à tous les passagers confirmés
- ✅ Message urgent pour rejoindre le conducteur

**Appel depuis le frontend:**
```typescript
await supabase.functions.invoke('on-driver-arrived', {
  body: {
    rideId: ride.id,
    driverId: driver.id,
    driverName: 'Marie Martin',
    meetingPoint: 'Gare routière Pompiers',
  },
});
```

---

### 7. **on-ride-status-changed**
**Déclenchement:** Quand le statut du trajet change

**Tâches:**
- ✅ **started:** In-app aux passagers
- ✅ **cancelled (by driver):** Push + WhatsApp + in-app aux passagers
- ✅ **cancelled (by passenger):** Push + in-app au conducteur
- ✅ **ended:** Préparation pour demande de notation

**Appel depuis le frontend:**
```typescript
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId: ride.id,
    status: 'started', // 'started', 'ended', 'cancelled'
    driverId: driver.id,
    driverName: 'Marie Martin',
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-10',
    timeDeparture: '08:00',
    cancelledBy: 'driver', // optionnel, si cancelled
    cancelledPassengerId: passenger.id, // optionnel
    cancelledPassengerName: 'Jean Dupont', // optionnel
  },
});
```

---

### 8. **on-rating-request** (Scheduled Cron)
**Déclenchement:** Tâche planifiée (toutes les 5 minutes recommandé)

**Tâches:**
- ✅ Trouve les trajets terminés il y a 10-30 minutes
- ✅ Envoie push + in-app au conducteur pour noter les passagers
- ✅ Envoie push + in-app aux passagers pour noter le conducteur
- ✅ Marque `rating_requested_at` pour éviter les doublons

**Configuration Cron (à configurer dans Supabase Dashboard):**
```
Nom: rating-requests
Fonction: on-rating-request
Schedule: */5 * * * * (toutes les 5 minutes)
```

---

## 📊 TABLES UTILISÉES

### 1. **notifications** (In-app)
```sql
- id (uuid)
- user_id (text)
- type (text)
- title (text)
- message (text)
- metadata (jsonb)
- is_read (boolean)
- created_at (timestamptz)
- read_at (timestamptz)
```

### 2. **notification_logs** (Logging)
```sql
- id (uuid)
- user_id (text)
- channel (text) -- 'in_app', 'push', 'whatsapp'
- status (text) -- 'success', 'error'
- payload (jsonb)
- error_message (text)
- created_at (timestamptz)
```

### 3. **device_tokens** (Push)
```sql
- id (uuid)
- user_id (text)
- expo_push_token (text)
- fcm_token (text)
- platform (text) -- 'ios', 'android', 'web'
- active (boolean)
- last_used_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### 4. **ride_alerts** (Alertes passagers)
```sql
- id (uuid)
- user_id (text)
- origin (text)
- destination (text)
- date_filter (date)
- date_from (date)
- date_to (date)
- time_range_start (time)
- time_range_end (time)
- max_price (integer)
- min_seats (integer)
- active (boolean)
- created_at (timestamptz)
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT REQUISES

À configurer dans **Supabase Dashboard > Edge Functions > Secrets**:

```bash
# Mode production
IS_PRODUCTION_MODE=false  # Mettre à 'true' en production

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Supabase (automatiques)
SUPABASE_URL=https://drxtaxepofuoelplgrei.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 SYSTÈME ANTI-DOUBLON

### Mécanismes implémentés:

1. **Notifications in-app:** Chaque notification a un `type` et `metadata` unique
2. **Push notifications:** Vérification des tokens actifs avant envoi
3. **WhatsApp:** Vérification du `whatsapp_optin` avant envoi
4. **Rating requests:** Champ `rating_requested_at` pour éviter les doublons
5. **Logging:** Toutes les tentatives sont loguées dans `notification_logs`

---

## 📱 INTÉGRATION PUSH NOTIFICATIONS

### Configuration Expo/FCM:

1. **Enregistrement du token:**
```typescript
import * as Notifications from 'expo-notifications';
import { supabase } from '@/app/integrations/supabase/client';

// Demander permission
const { status } = await Notifications.requestPermissionsAsync();

// Obtenir token
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Enregistrer dans la base
await supabase.from('device_tokens').insert({
  user_id: userId,
  expo_push_token: token,
  platform: Platform.OS,
  active: true,
});
```

2. **Gestion des notifications reçues:**
```typescript
Notifications.addNotificationReceivedListener((notification) => {
  console.log('Notification reçue:', notification);
  // Rafraîchir la liste des notifications in-app
});

Notifications.addNotificationResponseReceivedListener((response) => {
  console.log('Notification cliquée:', response);
  // Naviguer vers l'écran approprié
});
```

---

## 📞 INTÉGRATION WHATSAPP (TWILIO)

### Configuration:

1. **Créer un compte Twilio:** https://www.twilio.com/
2. **Activer WhatsApp Sandbox:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. **Obtenir les credentials:**
   - Account SID
   - Auth Token
   - WhatsApp From Number (format: `whatsapp:+14155238886`)

4. **Configurer dans Supabase:**
```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxx
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Templates WhatsApp recommandés:

```
1. Nouvelle réservation urgente:
"Nouvelle demande de réservation pour votre trajet. Ouvrez l'app pour répondre."

2. Confirmation de réservation:
"Votre trajet est confirmé 👍 Rendez-vous au point de rencontre."

3. Rappel H-1:
"Votre trajet commence dans 1 heure. Soyez à l'heure 📍"

4. Conducteur arrivé:
"Le conducteur est arrivé. Rejoignez-le dans les 5 minutes."

5. Annulation dernière minute:
"Le conducteur a annulé votre trajet. Vous pouvez en réserver un autre sur Yombal Yoon."
```

---

## 🧪 MODE TEST vs PRODUCTION

### Mode Test (`IS_PRODUCTION_MODE=false`):
- ✅ Notifications in-app créées
- ❌ Push notifications **NON envoyées** (loguées uniquement)
- ❌ WhatsApp **NON envoyés** (logués uniquement)
- ✅ Tous les logs créés dans `notification_logs`

### Mode Production (`IS_PRODUCTION_MODE=true`):
- ✅ Notifications in-app créées
- ✅ Push notifications **envoyées**
- ✅ WhatsApp **envoyés** (si `whatsapp_optin=true`)
- ✅ Tous les logs créés dans `notification_logs`

---

## 📝 EXEMPLES D'UTILISATION FRONTEND

### 1. Publier un trajet:
```typescript
// Créer le trajet
const { data: ride } = await supabase
  .from('carpool_rides')
  .insert({ ... })
  .select()
  .single();

// Déclencher les notifications
await supabase.functions.invoke('on-ride-created', {
  body: {
    rideId: ride.id,
    driverId: currentUser.id,
    origin: ride.origin,
    destination: ride.destination,
    dateDeparture: ride.date_departure,
    timeDeparture: ride.time_departure,
    price: ride.price_per_seat,
    seatsAvailable: ride.seats_available,
  },
});
```

### 2. Accepter une réservation:
```typescript
// Mettre à jour le statut
await supabase
  .from('carpool_bookings')
  .update({ status: 'accepted' })
  .eq('id', bookingId);

// Déclencher les notifications
await supabase.functions.invoke('on-reservation-status-changed', {
  body: {
    reservationId: bookingId,
    rideId: ride.id,
    status: 'accepted',
    passengerId: booking.passenger_id,
    passengerPhone: passenger.phone_number,
    driverId: currentUser.id,
    driverName: currentUser.full_name,
    origin: ride.origin,
    destination: ride.destination,
    dateDeparture: ride.date_departure,
    timeDeparture: ride.time_departure,
  },
});
```

### 3. Conducteur arrive:
```typescript
// Bouton "Je suis arrivé"
await supabase.functions.invoke('on-driver-arrived', {
  body: {
    rideId: ride.id,
    driverId: currentUser.id,
    driverName: currentUser.full_name,
    meetingPoint: ride.meeting_point,
  },
});
```

---

## 🔍 MONITORING & DEBUGGING

### Vérifier les logs:
```typescript
// Logs d'une notification spécifique
const { data: logs } = await supabase
  .from('notification_logs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

// Logs par canal
const { data: pushLogs } = await supabase
  .from('notification_logs')
  .select('*')
  .eq('channel', 'push')
  .eq('status', 'error');
```

### Vérifier les tokens actifs:
```typescript
const { data: tokens } = await supabase
  .from('device_tokens')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true);
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [x] Toutes les Edge Functions déployées
- [x] Variables d'environnement configurées
- [x] Tables créées avec RLS
- [x] Système anti-doublon implémenté
- [x] Logging complet
- [x] Mode test/production
- [ ] Configurer les cron jobs dans Supabase Dashboard
- [ ] Tester en mode test
- [ ] Configurer Twilio WhatsApp
- [ ] Activer le mode production

---

## 📚 DOCUMENTATION COMPLÉMENTAIRE

- **Architecture:** `PARTIE_3_ARCHITECTURE_NOTIFICATIONS_COMPLETE.md`
- **Tests:** `QUICK_TEST_GUIDE_COVOITURAGE_NOTIFICATIONS.md`
- **Twilio Setup:** `TWILIO_SECRETS_SETUP.md`
- **Notifications Setup:** `NOTIFICATIONS_SETUP_GUIDE.md`

---

## 🎉 RÉSULTAT FINAL

**7 Edge Functions déployées** pour gérer l'ensemble du cycle de vie des notifications Covoiturage:

1. ✅ `send-notification-unified` - Gestionnaire central
2. ✅ `on-ride-created` - Publication de trajet
3. ✅ `on-reservation-requested` - Demande de réservation
4. ✅ `on-reservation-status-changed` - Acceptation/Refus
5. ✅ `on-ride-reminders` - Rappels J-1 et H-1
6. ✅ `on-driver-arrived` - Arrivée conducteur
7. ✅ `on-ride-status-changed` - Changements de statut
8. ✅ `on-rating-request` - Demandes de notation

**Système complet** avec:
- ✅ Notifications in-app
- ✅ Push notifications (Expo/FCM)
- ✅ WhatsApp (Twilio)
- ✅ Logging complet
- ✅ Anti-doublon
- ✅ Mode test/production

---

**Implémentation terminée avec succès! 🚀**

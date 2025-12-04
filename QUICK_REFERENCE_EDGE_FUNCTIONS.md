
# QUICK REFERENCE - EDGE FUNCTIONS COVOITURAGE

## 🚀 APPELS RAPIDES

### 1. Publication de Trajet
```typescript
await supabase.functions.invoke('on-ride-created', {
  body: {
    rideId: ride.id,
    driverId: currentUser.id,
    origin: 'Dakar',
    destination: 'Kaolack',
    dateDeparture: '2025-02-15',
    timeDeparture: '08:00',
    price: 5000,
    seatsAvailable: 3,
  },
});
```

### 2. Demande de Réservation
```typescript
await supabase.functions.invoke('on-reservation-requested', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    passengerId: passenger.id,
    passengerName: passenger.full_name,
    passengerPhone: passenger.phone_number,
    numberOfPassengers: 2,
    driverId: driver.id,
    driverPhone: driver.phone_number,
    origin: ride.origin,
    destination: ride.destination,
    dateDeparture: ride.date_departure,
    timeDeparture: ride.time_departure,
  },
});
```

### 3. Accepter/Refuser Réservation
```typescript
await supabase.functions.invoke('on-reservation-status-changed', {
  body: {
    reservationId: booking.id,
    rideId: ride.id,
    status: 'accepted', // ou 'refused'
    passengerId: passenger.id,
    passengerPhone: passenger.phone_number,
    driverId: driver.id,
    driverName: driver.full_name,
    origin: ride.origin,
    destination: ride.destination,
    dateDeparture: ride.date_departure,
    timeDeparture: ride.time_departure,
  },
});
```

### 4. Conducteur Arrivé
```typescript
await supabase.functions.invoke('on-driver-arrived', {
  body: {
    rideId: ride.id,
    driverId: driver.id,
    driverName: driver.full_name,
    meetingPoint: ride.meeting_point,
  },
});
```

### 5. Changement de Statut
```typescript
await supabase.functions.invoke('on-ride-status-changed', {
  body: {
    rideId: ride.id,
    status: 'started', // 'started', 'ended', 'cancelled'
    driverId: driver.id,
    driverName: driver.full_name,
    origin: ride.origin,
    destination: ride.destination,
    dateDeparture: ride.date_departure,
    timeDeparture: ride.time_departure,
    // Si annulation:
    cancelledBy: 'driver', // ou 'passenger'
    cancelledPassengerId: passenger?.id,
    cancelledPassengerName: passenger?.full_name,
  },
});
```

---

## 📊 REQUÊTES SQL UTILES

### Notifications Non Lues
```sql
SELECT * FROM notifications
WHERE user_id = 'USER_ID'
AND is_read = false
ORDER BY created_at DESC;
```

### Marquer Comme Lu
```sql
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE id = 'NOTIFICATION_ID';
```

### Logs Récents
```sql
SELECT * FROM notification_logs
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 20;
```

### Tokens Actifs
```sql
SELECT * FROM device_tokens
WHERE user_id = 'USER_ID'
AND active = true;
```

---

## 🔧 CONFIGURATION

### Mode Test
```bash
IS_PRODUCTION_MODE=false
```

### Mode Production
```bash
IS_PRODUCTION_MODE=true
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 📱 ENREGISTREMENT PUSH TOKEN

```typescript
import * as Notifications from 'expo-notifications';

// Demander permission
const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') return;

// Obtenir token
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Enregistrer
await supabase.from('device_tokens').upsert({
  user_id: currentUser.id,
  expo_push_token: token,
  platform: Platform.OS,
  active: true,
  last_used_at: new Date().toISOString(),
});
```

---

## 🔍 DEBUGGING

### Vérifier Edge Function
```bash
# Logs Supabase
supabase functions logs on-ride-created --tail

# Test manuel
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-created \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"rideId":"test","driverId":"test",...}'
```

### Vérifier Notifications
```sql
-- Dernières notifications
SELECT * FROM notifications
ORDER BY created_at DESC LIMIT 10;

-- Erreurs
SELECT * FROM notification_logs
WHERE status = 'error'
ORDER BY created_at DESC;
```

---

## ⚡ TYPES TYPESCRIPT

```typescript
// Notification in-app
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Log de notification
interface NotificationLog {
  id: string;
  user_id: string;
  channel: 'in_app' | 'push' | 'whatsapp';
  status: 'success' | 'error';
  payload: any;
  error_message?: string;
  created_at: string;
}

// Token de device
interface DeviceToken {
  id: string;
  user_id: string;
  expo_push_token?: string;
  fcm_token?: string;
  platform: 'ios' | 'android' | 'web';
  active: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}
```

---

## 📞 SUPPORT

- **Documentation:** `PARTIE_3_ELEMENT_2_IMPLEMENTATION_COMPLETE.md`
- **Tests:** `EDGE_FUNCTIONS_TESTING_GUIDE.md`
- **Cron Jobs:** `CRON_JOBS_CONFIGURATION_GUIDE.md`

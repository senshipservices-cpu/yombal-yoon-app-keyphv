
# Checklist de Vérification - Corrections Covoiturage

## 🔍 Vérification Complète

### 1. Notifications Conducteur (Nouvelles Réservations)

#### Code Vérifié
- [x] `utils/notificationSetup.ts` - Fonction `notifyDriverNewReservation()` existe
- [x] `app/covoiturage/search-results.tsx` - Appel de la fonction après création de booking
- [x] `contexts/NotificationContext.tsx` - Système de notifications configuré
- [x] Migration SQL - Triggers créés

#### Flux de Données
```
Passager confirme réservation
    ↓
INSERT INTO carpool_bookings
    ↓
Trigger: notify_driver_new_booking()
    ↓
notifyDriverNewReservation()
    ↓
sendPushNotification()
    ↓
Notification reçue par le conducteur
```

#### Points de Vérification
- [ ] La fonction `notifyDriverNewReservation()` est appelée après `supabase.from('carpool_bookings').insert()`
- [ ] Les paramètres passés sont corrects (driverName, passengerName, numberOfPassengers, route)
- [ ] Le canal de notification est `'covoiturage-driver'`
- [ ] Le log "✅ Driver notification sent" apparaît dans la console

---

### 2. Message de Confirmation Passager

#### Code Vérifié
- [x] `app/covoiturage/search-results.tsx` - Alert avec message de succès
- [x] Fermeture automatique du formulaire (setSelectedRideId(null))
- [x] Réinitialisation des champs (setPassengerName(''), setPassengerPhone(''))
- [x] Support web et mobile (Platform.OS)

#### Flux de Données
```
Passager clique "Confirmer la réservation"
    ↓
handleBookRide() exécuté
    ↓
Booking créé dans Supabase
    ↓
Notification envoyée au conducteur
    ↓
Formulaire fermé
    ↓
Alert affiché avec message de succès
```

#### Points de Vérification
- [ ] Le message s'affiche après la création du booking
- [ ] Le message contient le nom du conducteur
- [ ] Le message contient les villes de départ et d'arrivée
- [ ] L'option "Voir mes réservations" est disponible
- [ ] Le formulaire se ferme automatiquement

---

### 3. Notifications Passager (Acceptation/Refus)

#### Code Vérifié
- [x] `utils/notificationSetup.ts` - Fonctions `notifyPassengerReservationAccepted()` et `notifyPassengerReservationRefused()`
- [x] `contexts/CovoiturageContext.tsx` - Appel des fonctions dans `updateReservationStatus()`
- [x] `app/covoiturage/my-rides.tsx` - Gestion des acceptations/refus
- [x] Migration SQL - Trigger `notify_passenger_booking_status()`

#### Flux de Données (Acceptation)
```
Conducteur clique "Accepter"
    ↓
updateReservationStatus(reservationId, 'accepted')
    ↓
UPDATE carpool_bookings SET status = 'accepted'
    ↓
Trigger: notify_passenger_booking_status()
    ↓
notifyPassengerReservationAccepted()
    ↓
sendPushNotification()
    ↓
Notification reçue par le passager
```

#### Flux de Données (Refus)
```
Conducteur clique "Refuser"
    ↓
updateReservationStatus(reservationId, 'refused')
    ↓
UPDATE carpool_bookings SET status = 'refused'
    ↓
Trigger: notify_passenger_booking_status()
    ↓
notifyPassengerReservationRefused()
    ↓
sendPushNotification()
    ↓
Notification reçue par le passager
```

#### Points de Vérification
- [ ] Les fonctions de notification sont appelées dans `updateReservationStatus()`
- [ ] Les paramètres passés sont corrects (passengerName, driverName, route)
- [ ] Le canal de notification est `'covoiturage-passenger'`
- [ ] Les logs "✅ Passenger notification sent" apparaissent dans la console

---

### 4. Numéro de Téléphone Correct

#### Code Vérifié
- [x] `app/covoiturage/my-reservations.tsx` - Utilise `ride.driver_phone`
- [x] `app/covoiturage/search-results.tsx` - Affiche le numéro masqué
- [x] `utils/phoneUtils.ts` - Fonction `maskPhoneNumber()`
- [x] `components/ContactButtons.tsx` - Boutons d'appel et WhatsApp

#### Flux de Données
```
Passager ouvre "Mes réservations"
    ↓
SELECT * FROM carpool_bookings
    JOIN carpool_rides ON ride_id = carpool_rides.id
    ↓
ride.driver_phone récupéré
    ↓
Avant acceptation: maskPhoneNumber(ride.driver_phone)
    ↓
Après acceptation: ride.driver_phone (complet)
    ↓
ContactButtons avec phoneNumber={ride.driver_phone}
```

#### Points de Vérification
- [ ] La requête Supabase inclut la jointure avec `carpool_rides`
- [ ] Le champ `driver_phone` est présent dans la réponse
- [ ] Le numéro est masqué avant acceptation (ex: "221XX XXX X67")
- [ ] Le numéro est complet après acceptation (ex: "221771234567")
- [ ] Les boutons "Appeler" et "WhatsApp" sont visibles après acceptation
- [ ] Le bouton "Appeler" ouvre l'application téléphone avec le bon numéro
- [ ] Le bouton "WhatsApp" ouvre WhatsApp avec le bon numéro

---

## 🗄️ Vérification Base de Données

### Tables
```sql
-- Vérifier la structure de carpool_rides
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carpool_rides' 
AND column_name = 'driver_phone';

-- Résultat attendu:
-- column_name  | data_type
-- driver_phone | text
```

```sql
-- Vérifier la structure de carpool_bookings
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'carpool_bookings' 
AND column_name IN ('passenger_name', 'passenger_phone', 'status');

-- Résultat attendu:
-- column_name     | data_type
-- passenger_name  | text
-- passenger_phone | text
-- status          | text
```

### Triggers
```sql
-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_notify_driver_new_booking', 'trigger_notify_passenger_booking_status');

-- Résultat attendu:
-- trigger_name                          | event_manipulation | event_object_table
-- trigger_notify_driver_new_booking     | INSERT             | carpool_bookings
-- trigger_notify_passenger_booking_status | UPDATE           | carpool_bookings
```

### Données de Test
```sql
-- Vérifier qu'un trajet a un numéro de téléphone
SELECT id, driver_name, driver_phone, departure_city, arrival_city 
FROM carpool_rides 
LIMIT 1;

-- Résultat attendu:
-- id                                   | driver_name | driver_phone  | departure_city | arrival_city
-- 123e4567-e89b-12d3-a456-426614174000 | Jean Dupont | 221771234567  | Dakar          | Thiès
```

```sql
-- Vérifier qu'une réservation est liée à un trajet
SELECT 
    b.id, 
    b.passenger_name, 
    b.passenger_phone, 
    b.status,
    r.driver_name,
    r.driver_phone
FROM carpool_bookings b
JOIN carpool_rides r ON b.ride_id = r.id
LIMIT 1;

-- Résultat attendu:
-- id       | passenger_name | passenger_phone | status  | driver_name | driver_phone
-- abc123   | Marie Martin   | 221781234567    | pending | Jean Dupont | 221771234567
```

---

## 🔧 Vérification Edge Functions

### send-covoiturage-notifications
```bash
# Vérifier que l'Edge Function est déployée
supabase functions list

# Résultat attendu:
# NAME                              VERSION  STATUS
# send-covoiturage-notifications    1        ACTIVE
```

```bash
# Tester l'Edge Function
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-covoiturage-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "new_booking",
    "passengerName": "Test Passager",
    "driverPhone": "221771234567",
    "numberOfPassengers": 2,
    "route": {
      "from": "Dakar",
      "to": "Thiès",
      "date": "2025-02-03",
      "time": "10:00"
    }
  }'

# Résultat attendu:
# {
#   "success": true,
#   "message": "Notification sent successfully",
#   "notification": {
#     "title": "🚗 Nouvelle réservation !",
#     "body": "Test Passager souhaite réserver 2 place(s) pour Dakar → Thiès le 2025-02-03",
#     "recipient": "221771234567"
#   },
#   "mode": "test"
# }
```

---

## 📱 Vérification Permissions

### Android
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### iOS
```xml
<!-- Info.plist -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

---

## 🧪 Tests Manuels

### Test 1: Notification Conducteur
1. [ ] Créer un trajet sur Appareil A
2. [ ] Réserver le trajet sur Appareil B
3. [ ] Vérifier notification push sur Appareil A
4. [ ] Vérifier notification dans la cloche sur Appareil A
5. [ ] Vérifier que la réservation apparaît dans "Mes trajets publiés"

### Test 2: Message Confirmation
1. [ ] Réserver un trajet sur Appareil B
2. [ ] Vérifier que le message de succès s'affiche
3. [ ] Vérifier que le formulaire se ferme
4. [ ] Vérifier que l'option "Voir mes réservations" est disponible

### Test 3: Notification Passager (Acceptation)
1. [ ] Accepter une réservation sur Appareil A
2. [ ] Vérifier notification push sur Appareil B
3. [ ] Vérifier notification dans la cloche sur Appareil B
4. [ ] Vérifier que le statut passe à "Acceptée" dans "Mes réservations"

### Test 4: Notification Passager (Refus)
1. [ ] Refuser une réservation sur Appareil A
2. [ ] Vérifier notification push sur Appareil B
3. [ ] Vérifier notification dans la cloche sur Appareil B
4. [ ] Vérifier que le statut passe à "Refusée" dans "Mes réservations"

### Test 5: Numéro de Téléphone
1. [ ] Consulter une réservation en attente sur Appareil B
2. [ ] Vérifier que le numéro est masqué
3. [ ] Accepter la réservation sur Appareil A
4. [ ] Consulter la réservation acceptée sur Appareil B
5. [ ] Vérifier que le numéro est complet
6. [ ] Cliquer sur "Appeler" et vérifier que l'appel se connecte
7. [ ] Cliquer sur "WhatsApp" et vérifier que WhatsApp s'ouvre

---

## 📊 Résultats Attendus

### Tous les Tests Passent
- ✅ Notifications conducteur fonctionnelles
- ✅ Message de confirmation affiché
- ✅ Notifications passager fonctionnelles
- ✅ Numéro de téléphone correct

### Métriques
- **Taux de succès des notifications:** 100%
- **Taux d'affichage des messages:** 100%
- **Taux de numéros corrects:** 100%

---

## 🐛 Débogage

### Logs à Vérifier

**Console Application:**
```
✅ Booking created successfully: {bookingData}
📤 Sending notification to driver...
✅ Driver notification sent
```

**Logs Supabase:**
```
📥 Processing covoiturage notification: {type, bookingId, rideId}
📤 Notification prepared: {title, body, recipient}
```

**Logs SQL:**
```
NOTICE: New booking notification: Driver [Name] should be notified about booking [ID] from passenger [Name]
```

### Problèmes Courants

**Notifications ne s'affichent pas:**
- Vérifier les permissions de notification
- Vérifier que `registerForPushNotifications()` a été appelé
- Vérifier les logs de l'Edge Function
- Redémarrer l'application

**Message de confirmation ne s'affiche pas:**
- Vérifier les logs: "✅ Booking created successfully"
- Vérifier Platform.OS (web vs native)
- Vérifier les permissions Alert

**Numéro de téléphone incorrect:**
- Vérifier `driver_phone` dans `carpool_rides`
- Vérifier la jointure avec `carpool_bookings`
- Vérifier que le numéro commence par "221"
- Consulter les logs SQL

---

## ✅ Validation Finale

### Checklist Complète
- [ ] Toutes les notifications fonctionnent
- [ ] Tous les messages s'affichent
- [ ] Tous les numéros sont corrects
- [ ] Tous les tests manuels passent
- [ ] Tous les logs sont corrects
- [ ] Toutes les permissions sont accordées

### Signature
- **Date de vérification:** __________
- **Vérifié par:** __________
- **Status:** ☐ Validé ☐ À corriger

---

**Note:** Cette checklist doit être complétée avant de déployer en production.

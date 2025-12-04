
# 📊 DIAGRAMME DE FLUX COMPLET
## PARTIE 5 ÉLÉMENT 2 - PENDANT & APRÈS LE TRAJET

---

## 🎯 VUE D'ENSEMBLE

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CYCLE DE VIE D'UN TRAJET                     │
└──────────────────────────────────────────────────────────────────────┘

AVANT LE TRAJET          PENDANT LE TRAJET           APRÈS LE TRAJET
─────────────────        ──────────────────          ───────────────
                                                      
1. Publication           5. Arrivée                   8. Fin
2. Réservation           6. Démarrage                 9. Notation
3. Acceptation           7. Annulation (optionnel)
4. Rappels J-1/H-1
```

---

## 📍 FLUX 1 : CONDUCTEUR "JE SUIS ARRIVÉ"

```
┌─────────────┐
│ CONDUCTEUR  │
│ clique      │
│ "Je suis    │
│  arrivé"    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (my-rides.tsx)                                 │
│ ─────────────────────────────────────────────────────── │
│ handleDriverArrived(rideId)                             │
│   ├─ Affiche confirmation                               │
│   └─ Appelle markDriverArrived()                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ markDriverArrived(rideId)                               │
│   ├─ Récupère détails du trajet                         │
│   └─ Appelle Edge Function on-driver-arrived            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-driver-arrived)                       │
│ ─────────────────────────────────────────────────────── │
│ 1. Récupère réservations confirmées                     │
│ 2. Pour chaque passager :                               │
│    ├─ Crée notification in-app                          │
│    ├─ Envoie push notification                          │
│    └─ Envoie WhatsApp (si optin)                        │
│ 3. Log dans notification_logs                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ PASSAGERS REÇOIVENT                                     │
│ ─────────────────────────────────────────────────────── │
│ 🔔 Notification in-app : "Le conducteur est arrivé !"  │
│ 📱 Push notification                                    │
│ 💬 WhatsApp (si optin activé)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚗 FLUX 2 : DÉMARRAGE DU TRAJET

```
┌─────────────┐
│ CONDUCTEUR  │
│ clique      │
│ "Démarrer   │
│  le trajet" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (my-rides.tsx)                                 │
│ ─────────────────────────────────────────────────────── │
│ handleStartRide(rideId)                                 │
│   ├─ Affiche confirmation                               │
│   └─ Appelle startRide()                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ startRide(rideId)                                       │
│   ├─ Met à jour ride_status = 'started'                 │
│   ├─ Enregistre started_at                              │
│   ├─ Met à jour état local                              │
│   └─ Appelle Edge Function on-ride-status-changed       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-ride-status-changed)                  │
│ ─────────────────────────────────────────────────────── │
│ Payload: { status: 'started', ... }                     │
│                                                          │
│ 1. Récupère réservations confirmées                     │
│ 2. Pour chaque passager :                               │
│    └─ Crée notification in-app                          │
│ 3. Log dans notification_logs                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ PASSAGERS REÇOIVENT                                     │
│ ─────────────────────────────────────────────────────── │
│ 🔔 Notification in-app : "Le trajet a démarré"         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ INTERFACE CONDUCTEUR MIS À JOUR                         │
│ ─────────────────────────────────────────────────────── │
│ ❌ Bouton "Démarrer" disparaît                          │
│ ✅ Bouton "Terminer le trajet" apparaît                 │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ FLUX 3A : ANNULATION PAR CONDUCTEUR

```
┌─────────────┐
│ CONDUCTEUR  │
│ clique      │
│ "Annuler    │
│  le trajet" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (my-rides.tsx)                                 │
│ ─────────────────────────────────────────────────────── │
│ handleCancelRide(rideId)                                │
│   ├─ Affiche confirmation                               │
│   └─ Appelle cancelRide()                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ cancelRide(rideId)                                      │
│   ├─ Met à jour status = 'cancelled'                    │
│   ├─ Refuse toutes les réservations                     │
│   ├─ Met à jour état local                              │
│   └─ Appelle Edge Function on-ride-status-changed       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-ride-status-changed)                  │
│ ─────────────────────────────────────────────────────── │
│ Payload: { status: 'cancelled', cancelledBy: 'driver' } │
│                                                          │
│ 1. Vérifie si annulation urgente (< 24h)                │
│ 2. Récupère réservations confirmées                     │
│ 3. Pour chaque passager :                               │
│    ├─ Crée notification in-app                          │
│    ├─ Envoie push notification                          │
│    └─ Envoie WhatsApp (si urgent + optin)               │
│ 4. Log dans notification_logs                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ PASSAGERS REÇOIVENT                                     │
│ ─────────────────────────────────────────────────────── │
│ 🔔 Notification in-app : "Trajet annulé"               │
│ 📱 Push notification                                    │
│ 💬 WhatsApp (si départ < 24h et optin)                 │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ FLUX 3B : ANNULATION PAR PASSAGER

```
┌─────────────┐
│ PASSAGER    │
│ clique      │
│ "Annuler ma │
│ réservation"│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (my-reservations.tsx)                          │
│ ─────────────────────────────────────────────────────── │
│ handleCancelReservation(reservationId)                  │
│   ├─ Affiche confirmation                               │
│   └─ Appelle cancelReservation()                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ cancelReservation(reservationId)                        │
│   ├─ Met à jour status = 'cancelled_by_passenger'       │
│   ├─ Libère les places                                  │
│   ├─ Met à jour état local                              │
│   └─ Appelle Edge Function on-ride-status-changed       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-ride-status-changed)                  │
│ ─────────────────────────────────────────────────────── │
│ Payload: { cancelledBy: 'passenger', ... }              │
│                                                          │
│ 1. Récupère infos du conducteur                         │
│ 2. Crée notification in-app                             │
│ 3. Envoie push notification                             │
│ 4. Log dans notification_logs                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ CONDUCTEUR REÇOIT                                       │
│ ─────────────────────────────────────────────────────── │
│ 🔔 Notification in-app : "Passager a annulé"           │
│ 📱 Push notification                                    │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ FLUX 4 : FIN DU TRAJET

```
┌─────────────┐
│ CONDUCTEUR  │
│ clique      │
│ "Terminer   │
│  le trajet" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (my-rides.tsx)                                 │
│ ─────────────────────────────────────────────────────── │
│ handleEndRide(rideId)                                   │
│   └─ Redirige vers écran de paiement                    │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Écran de paiement (end-trip-payment.tsx)                │
│ ─────────────────────────────────────────────────────── │
│ 1. Affiche récapitulatif                                │
│ 2. Sélection mode de paiement                           │
│ 3. Confirmation paiement                                │
│ 4. Appelle endRide()                                    │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ endRide(rideId)                                         │
│   ├─ Calcule duration_actual_minutes                    │
│   ├─ Met à jour ride_status = 'ended'                   │
│   ├─ Enregistre ended_at                                │
│   ├─ Met à jour rating_requested_at                     │
│   ├─ Met à jour état local                              │
│   └─ Appelle Edge Function on-ride-status-changed       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-ride-status-changed)                  │
│ ─────────────────────────────────────────────────────── │
│ Payload: { status: 'ended', ... }                       │
│                                                          │
│ 1. Met à jour les statuts                               │
│ 2. Pas de notification immédiate                        │
│    (Les notifications seront envoyées par le cron)      │
└─────────────────────────────────────────────────────────┘
```

---

## ⭐ FLUX 5 : DEMANDE DE NOTATION (CRON JOB)

```
┌─────────────────────────────────────────────────────────┐
│ CRON JOB (toutes les 15 minutes)                        │
│ ─────────────────────────────────────────────────────── │
│ Déclenche : on-rating-request                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Edge Function (on-rating-request)                       │
│ ─────────────────────────────────────────────────────── │
│ 1. Trouve trajets terminés il y a 10-30 min             │
│ 2. Filtre ceux où rating_requested_at IS NULL           │
│ 3. Pour chaque trajet :                                 │
│    ├─ Envoie notification au conducteur                 │
│    ├─ Envoie notification à chaque passager             │
│    └─ Met à jour rating_requested_at                    │
│ 4. Log dans notification_logs                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──────────────────────┬──────────────────────────┐
       ▼                      ▼                          ▼
┌──────────────┐    ┌──────────────┐         ┌──────────────┐
│ CONDUCTEUR   │    │ PASSAGER 1   │         │ PASSAGER 2   │
│ REÇOIT       │    │ REÇOIT       │         │ REÇOIT       │
│              │    │              │         │              │
│ 🔔 In-app    │    │ 🔔 In-app    │         │ 🔔 In-app    │
│ 📱 Push      │    │ 📱 Push      │         │ 📱 Push      │
│              │    │              │         │              │
│ "Note tes    │    │ "Note ton    │         │ "Note ton    │
│  passagers"  │    │  conducteur" │         │  conducteur" │
└──────────────┘    └──────────────┘         └──────────────┘
```

---

## ⭐ FLUX 6 : NOTATION

```
┌─────────────┐
│ UTILISATEUR │
│ clique sur  │
│ notification│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Écran de notation (rate-trip.tsx)                       │
│ ─────────────────────────────────────────────────────── │
│ 1. Affiche infos du trajet                              │
│ 2. Sélection note (1-5 étoiles)                         │
│ 3. Commentaire optionnel                                │
│ 4. Appelle submitRating()                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Context (CovoiturageContext.tsx)                        │
│ ─────────────────────────────────────────────────────── │
│ submitRating(reservationId, rating, comment, isDriver)  │
│   ├─ Met à jour driver_rating ou passenger_rating       │
│   ├─ Enregistre commentaire                             │
│   ├─ Enregistre rated_at                                │
│   └─ Met à jour état local                              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ CONFIRMATION                                            │
│ ─────────────────────────────────────────────────────── │
│ ✅ "Merci pour votre évaluation !"                      │
│ Retour à l'écran précédent                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 TABLEAU RÉCAPITULATIF DES NOTIFICATIONS

| Événement | In-App | Push | WhatsApp | Destinataire |
|-----------|--------|------|----------|--------------|
| Arrivée conducteur | ✅ | ✅ | ✅ (si optin) | Passagers |
| Démarrage trajet | ✅ | ❌ | ❌ | Passagers |
| Annulation conducteur | ✅ | ✅ | ✅ (si < 24h) | Passagers |
| Annulation passager | ✅ | ✅ | ❌ | Conducteur |
| Fin trajet | ❌ | ❌ | ❌ | - |
| Demande notation | ✅ | ✅ | ❌ | Tous |

---

## 🔄 ÉTATS DU TRAJET

```
┌──────────┐
│ pending  │  Trajet créé, en attente de démarrage
└────┬─────┘
     │
     │ Conducteur clique "Démarrer"
     ▼
┌──────────┐
│ started  │  Trajet en cours
└────┬─────┘
     │
     │ Conducteur clique "Terminer"
     ▼
┌──────────┐
│  ended   │  Trajet terminé
└────┬─────┘
     │
     │ 10-30 min après
     ▼
┌──────────┐
│  rated   │  Notations envoyées
└──────────┘

     OU

┌──────────┐
│ pending  │
└────┬─────┘
     │
     │ Conducteur ou passager annule
     ▼
┌──────────┐
│cancelled │  Trajet annulé
└──────────┘
```

---

## 🎯 POINTS CLÉS

### **Notifications Critiques**
1. **Arrivée conducteur** : Push + WhatsApp pour réactivité maximale
2. **Annulation urgente** : WhatsApp si < 24h du départ
3. **Demande notation** : Push pour maximiser le taux de réponse

### **Optimisations**
1. **In-app uniquement** pour démarrage (événement moins urgent)
2. **Pas de notification** pour fin de trajet (géré par cron)
3. **Désactivation automatique** des tokens push invalides

### **Sécurité**
1. **RLS activé** sur toutes les tables
2. **Service role key** pour Edge Functions
3. **Respect du mode production** (IS_PRODUCTION_MODE)

---

**Dernière mise à jour :** 2 février 2025  
**Version :** 1.0.0

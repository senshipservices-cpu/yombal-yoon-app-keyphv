
# Système de Notifications Amélioré - Module Covoiturage

## Vue d'ensemble

Le système de notifications a été considérablement amélioré pour offrir une expérience similaire à Uber, Yango et autres applications de covoiturage professionnelles. Les notifications apparaissent maintenant **dans la barre de notification du téléphone** (iOS et Android), pas seulement dans l'icône de cloche de l'application.

## Fonctionnalités principales

### ✅ Notifications système natives
- **Apparition dans la barre de notification** : Les notifications s'affichent dans le centre de notifications du téléphone
- **Son et vibration** : Alertes sonores et haptiques pour attirer l'attention
- **Badge sur l'icône** : Compteur de notifications non lues sur l'icône de l'app
- **Persistance** : Les notifications restent visibles même après fermeture de l'app

### ✅ Canaux de notification Android
Trois canaux distincts avec priorité maximale :
- **`covoiturage-driver`** : Notifications pour conducteurs (nouvelles réservations)
- **`covoiturage-passenger`** : Notifications pour passagers (acceptation/refus)
- **`colis`** : Notifications pour livraisons de colis

### ✅ Types de notifications

#### Pour les conducteurs :
1. **Nouvelle réservation** 🚗
   - Titre : "🚗 Nouvelle réservation !"
   - Corps : "[Nom passager] souhaite réserver [X] place(s) pour [Départ] → [Arrivée]"
   - Navigation : Vers "Mes trajets publiés"

2. **Annulation de réservation**
   - Notification automatique quand un passager annule

#### Pour les passagers :
1. **Réservation acceptée** ✅
   - Titre : "✅ Réservation acceptée !"
   - Corps : "[Nom conducteur] a accepté votre réservation pour [Départ] → [Arrivée]"
   - Navigation : Vers "Mes réservations"

2. **Réservation refusée** ❌
   - Titre : "❌ Réservation refusée"
   - Corps : "[Nom conducteur] a refusé votre réservation"
   - Navigation : Vers "Mes réservations"

3. **Trajet annulé** ⚠️
   - Titre : "⚠️ Trajet annulé"
   - Corps : "Le trajet [Départ] → [Arrivée] du [Date] a été annulé par [Conducteur]"
   - Navigation : Vers "Mes réservations"

## Architecture technique

### Fichiers modifiés

1. **`utils/notificationSetup.ts`**
   - Configuration des canaux Android
   - Fonctions d'envoi de notifications système
   - Gestion des permissions

2. **`contexts/NotificationContext.tsx`**
   - Intégration avec le système de notifications amélioré
   - Gestion de l'historique des notifications
   - Navigation automatique lors du tap

3. **`contexts/CovoiturageContext.tsx`**
   - Intégration des notifications push dans les actions
   - Envoi automatique lors de réservation/acceptation/refus/annulation

### Fonctions principales

```typescript
// Demander les permissions
await requestNotificationPermissions();

// Envoyer une notification système
await sendPushNotification(
  "Titre",
  "Corps du message",
  { type: 'reservation_created', rideId: '123' },
  'covoiturage-driver' // Canal Android
);

// Notifications spécifiques
await notifyDriverNewReservation(...);
await notifyPassengerReservationAccepted(...);
await notifyPassengerReservationRefused(...);
await notifyPassengersRideCancelled(...);
```

## Configuration Android

Les canaux de notification sont configurés avec :
- **Importance** : `MAX` (priorité maximale)
- **Son** : Activé (son par défaut)
- **Vibration** : Pattern [0, 250, 250, 250]
- **LED** : Activée avec couleur spécifique
- **Badge** : Activé
- **Visibilité écran verrouillé** : `PUBLIC`

## Configuration iOS

Les notifications iOS utilisent :
- **Son** : Activé (son par défaut)
- **Badge** : Activé
- **Bannière** : Affichée en haut de l'écran
- **Centre de notifications** : Ajoutée à la liste

## Permissions

Les permissions sont demandées automatiquement au démarrage de l'app via `NotificationContext`. Si l'utilisateur refuse, les notifications ne fonctionneront pas mais l'app reste utilisable.

## Navigation automatique

Lorsqu'un utilisateur tape sur une notification :
- **Réservation créée** → Écran "Mes trajets publiés" (conducteur)
- **Réservation acceptée/refusée** → Écran "Mes réservations" (passager)
- **Trajet annulé** → Écran "Mes réservations" (passager)
- **Colis assigné** → Détail du colis (livreur)

## Feedback haptique

Chaque notification déclenche un retour haptique :
- **iOS** : `Haptics.notificationAsync(NotificationFeedbackType.Success)`
- **Android** : `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)`

## Historique des notifications

Toutes les notifications sont sauvegardées dans :
- **AsyncStorage** : Clé `@yombal_yoon_notifications`
- **Contexte** : Accessible via `useNotifications()`
- **Écran dédié** : `/notifications` pour consulter l'historique

## Test du système

### Test manuel
1. Publier un trajet en tant que conducteur
2. Réserver ce trajet en tant que passager (autre appareil/compte)
3. Vérifier que la notification apparaît dans la barre de notification
4. Taper sur la notification pour vérifier la navigation
5. Accepter/refuser la réservation et vérifier les notifications passager

### Logs de débogage
Tous les événements de notification sont loggés avec des emojis :
- 🔔 Initialisation
- ✅ Succès
- ❌ Erreur
- 📤 Envoi
- 📱 Réception
- 👆 Tap utilisateur

## Différences avec l'ancien système

| Fonctionnalité | Ancien système | Nouveau système |
|----------------|----------------|-----------------|
| Visibilité | Icône cloche uniquement | Barre de notification système |
| Son | ❌ Non | ✅ Oui |
| Vibration | ❌ Non | ✅ Oui |
| Badge app | ❌ Non | ✅ Oui |
| Canaux Android | ❌ Non | ✅ Oui (3 canaux) |
| Priorité | Normale | Maximale |
| Persistance | En mémoire | AsyncStorage + Système |
| Navigation auto | ❌ Non | ✅ Oui |
| Feedback haptique | ❌ Non | ✅ Oui |

## Compatibilité

- **iOS** : iOS 10+ (toutes versions supportées par Expo)
- **Android** : Android 8.0+ (API 26+) pour les canaux
- **Web** : Notifications navigateur (si permissions accordées)

## Limitations connues

1. **Notifications push serveur** : Le système actuel utilise des notifications locales. Pour des notifications push réelles (quand l'app est fermée), il faudrait :
   - Configurer Expo Push Notifications
   - Obtenir des tokens push
   - Envoyer via serveur backend

2. **Web** : Les notifications web nécessitent HTTPS et permissions navigateur

## Prochaines améliorations possibles

1. **Notifications push serveur** via Expo Push Notifications
2. **Notifications programmées** (rappels avant départ)
3. **Notifications de proximité** (conducteur proche du point de départ)
4. **Notifications de chat** (messages entre conducteur/passager)
5. **Notifications de paiement** (confirmation de paiement)

## Support et débogage

En cas de problème :
1. Vérifier les logs console (rechercher 🔔, ✅, ❌)
2. Vérifier les permissions dans les paramètres du téléphone
3. Tester sur un appareil physique (les notifications ne fonctionnent pas toujours sur simulateur)
4. Vérifier que `expo-notifications` est bien installé

## Conclusion

Le système de notifications est maintenant **robuste et professionnel**, offrant une expérience utilisateur comparable aux applications de covoiturage leaders du marché. Les notifications apparaissent de manière fiable dans la barre de notification du téléphone, avec son, vibration et navigation automatique.

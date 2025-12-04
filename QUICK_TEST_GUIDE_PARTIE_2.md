
# Guide de Test Rapide - Partie 2 Notifications

## 🧪 Tests Essentiels

### Test 1 : Démarrage de Trajet

**Objectif :** Vérifier que le conducteur peut démarrer un trajet et que les passagers sont notifiés.

**Étapes :**
1. Créer un trajet en tant que conducteur
2. Créer une réservation en tant que passager
3. Accepter la réservation
4. Aller dans "Mes trajets publiés"
5. Cliquer sur "Démarrer le trajet"
6. Confirmer

**Résultat Attendu :**
- ✅ Le bouton "Démarrer" disparaît
- ✅ Le bouton "Terminer le trajet" apparaît
- ✅ Le statut du trajet passe à "started"
- ✅ Les passagers reçoivent une notification push : "🚗 Trajet démarré"

---

### Test 2 : Annulation de Dernière Minute

**Objectif :** Vérifier que les annulations < 24h déclenchent WhatsApp + Push.

**Étapes :**
1. Créer un trajet pour aujourd'hui ou demain
2. Créer et accepter une réservation
3. Annuler le trajet
4. Confirmer l'annulation

**Résultat Attendu :**
- ✅ Notification push au passager : "Trajet annulé ❌"
- ✅ Message WhatsApp envoyé (si Twilio configuré)
- ✅ Statut du trajet = "Annulé"
- ✅ Log dans `notification_logs` avec channel='whatsapp'

**Vérification DB :**
```sql
SELECT * FROM notification_logs 
WHERE type = 'ride_cancelled_last_minute' 
ORDER BY created_at DESC LIMIT 5;
```

---

### Test 3 : Annulation par Passager

**Objectif :** Vérifier que le conducteur est notifié quand un passager annule.

**Étapes :**
1. Créer un trajet
2. Créer une réservation
3. En tant que passager, aller dans "Mes réservations"
4. Annuler la réservation

**Résultat Attendu :**
- ✅ Notification push au conducteur : "[Nom] a annulé sa réservation"
- ✅ Nombre de places disponibles mis à jour
- ✅ Réservation supprimée de la liste

---

### Test 4 : Fin de Trajet

**Objectif :** Vérifier le processus complet de fin de trajet.

**Étapes :**
1. Démarrer un trajet (voir Test 1)
2. Attendre quelques minutes (ou pas)
3. Cliquer sur "Terminer le trajet"
4. Compléter le paiement

**Résultat Attendu :**
- ✅ Écran de récapitulatif affiché
- ✅ Durée du trajet calculée
- ✅ Notification push à tous : "✅ Trajet terminé"
- ✅ Statut du trajet = "ended"

**Vérification DB :**
```sql
SELECT 
  id, 
  ride_status, 
  started_at, 
  ended_at, 
  duration_actual_minutes 
FROM carpool_rides 
WHERE ride_status = 'ended' 
ORDER BY ended_at DESC LIMIT 5;
```

---

### Test 5 : Demande de Notation

**Objectif :** Vérifier que les notifications de notation sont envoyées.

**Étapes :**
1. Terminer un trajet (voir Test 4)
2. Attendre 10 minutes (ou modifier le timeout dans le code pour tester)

**Résultat Attendu :**
- ✅ Notification push au conducteur : "⭐ Note tes passagers"
- ✅ Notification push aux passagers : "⭐ Note ton conducteur"
- ✅ Tap sur la notification ouvre l'écran de notation

**Note :** Pour tester immédiatement, modifier le timeout dans `CovoiturageContext.tsx` :
```typescript
// Ligne ~850
setTimeout(async () => {
  // ...
}, 10 * 60 * 1000); // Changer à 1000 pour 1 seconde
```

---

### Test 6 : Soumission de Notation

**Objectif :** Vérifier que les notes sont enregistrées correctement.

**Étapes :**
1. Après avoir reçu la notification de notation
2. Ouvrir l'écran de notation
3. Sélectionner une note (1-5 étoiles)
4. Ajouter un commentaire (optionnel)
5. Cliquer sur "Envoyer l'évaluation"

**Résultat Attendu :**
- ✅ Message de succès affiché
- ✅ Retour à l'écran précédent
- ✅ Note enregistrée dans la DB

**Vérification DB :**
```sql
SELECT 
  id,
  passenger_name,
  driver_rating,
  driver_rating_comment,
  passenger_rating,
  passenger_rating_comment,
  rated_at
FROM carpool_bookings 
WHERE rated_at IS NOT NULL 
ORDER BY rated_at DESC LIMIT 5;
```

---

## 🔍 Vérifications Supplémentaires

### Vérifier les Logs de Notification

```sql
-- Toutes les notifications des dernières 24h
SELECT 
  type,
  channel,
  status,
  recipient,
  message,
  created_at
FROM notification_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Taux de réussite par canal
SELECT 
  channel,
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY channel), 2) as percentage
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY channel, status
ORDER BY channel, status;
```

### Vérifier les Statuts de Trajet

```sql
-- Distribution des statuts
SELECT 
  ride_status,
  COUNT(*) as count
FROM carpool_rides
GROUP BY ride_status
ORDER BY count DESC;

-- Trajets en cours
SELECT 
  id,
  driver_name,
  departure_city,
  arrival_city,
  ride_status,
  started_at,
  ended_at
FROM carpool_rides
WHERE ride_status IN ('started', 'ended')
ORDER BY started_at DESC;
```

---

## 🐛 Dépannage

### Problème : Notifications Push ne s'affichent pas

**Solutions :**
1. Vérifier les permissions :
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. Vérifier les canaux Android :
   ```typescript
   const channels = await Notifications.getNotificationChannelsAsync();
   console.log('Channels:', channels);
   ```

3. Tester avec une notification simple :
   ```typescript
   await sendPushNotification('Test', 'Message de test');
   ```

### Problème : WhatsApp ne s'envoie pas

**Solutions :**
1. Vérifier les variables d'environnement dans Supabase
2. Vérifier les logs de l'Edge Function
3. Tester avec un numéro de téléphone vérifié dans Twilio

### Problème : Durée du trajet incorrecte

**Solutions :**
1. Vérifier que `started_at` est bien enregistré
2. Vérifier le calcul dans `endRide()` :
   ```typescript
   const startTime = new Date(ride.startedAt);
   const endTime = new Date(endedAt);
   const minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
   ```

---

## ✅ Checklist de Test Complet

- [ ] Test 1 : Démarrage de trajet
- [ ] Test 2 : Annulation de dernière minute
- [ ] Test 3 : Annulation par passager
- [ ] Test 4 : Fin de trajet
- [ ] Test 5 : Demande de notation
- [ ] Test 6 : Soumission de notation
- [ ] Vérification des logs de notification
- [ ] Vérification des statuts de trajet
- [ ] Test des notifications push
- [ ] Test WhatsApp (si configuré)
- [ ] Test de la durée du trajet

---

## 📱 Test sur Différentes Plateformes

### iOS
- [ ] Notifications apparaissent dans le centre de notifications
- [ ] Son et vibration fonctionnent
- [ ] Tap sur notification ouvre l'app
- [ ] Badge de notification mis à jour

### Android
- [ ] Notifications apparaissent dans la barre de notification
- [ ] Canaux de notification configurés
- [ ] Son et vibration fonctionnent
- [ ] Tap sur notification ouvre l'app

### Web
- [ ] Confirmations avec `window.confirm()`
- [ ] Alertes avec `window.alert()`
- [ ] Notifications in-app fonctionnent

---

**Temps Estimé :** 30-45 minutes pour tous les tests  
**Prérequis :** 2 comptes utilisateurs (conducteur + passager)  
**Environnement :** Test ou Production

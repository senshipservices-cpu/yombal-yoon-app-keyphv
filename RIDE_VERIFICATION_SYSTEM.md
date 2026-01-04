
# Système de Vérification de Trajet Covoiturage

## Vue d'ensemble

Ce système permet de vérifier qu'un conducteur a effectivement réalisé un trajet de covoiturage avec le nombre correct de passagers, en utilisant:

- **Suivi GPS en temps réel** pendant le trajet
- **Géofencing** pour vérifier le départ et l'arrivée
- **Calcul de distance** pour comparer la distance parcourue vs prévue
- **Confirmation des passagers** pour compter les passagers embarqués

## Architecture

### 1. Base de données

Deux nouvelles tables ont été créées:

#### `ride_tracking`
Stocke les données de suivi GPS pour chaque trajet:
- **Statut du suivi**: not_started, tracking, completed, cancelled
- **Vérification départ**: coordonnées réelles, distance du point prévu
- **Vérification arrivée**: coordonnées réelles, distance du point prévu
- **Distance**: distance totale parcourue, distance prévue, pourcentage de correspondance
- **Passagers**: nombre confirmé vs nombre attendu
- **Points GPS**: tableau JSONB des points de tracking
- **Résultat de vérification**: passé/échoué avec notes

#### `passenger_confirmations`
Enregistre les confirmations d'embarquement des passagers:
- **Confirmation**: par conducteur, passager ou QR code
- **QR Code**: code unique pour chaque passager
- **Localisation**: coordonnées GPS au moment de la confirmation

### 2. Utilitaires (`utils/rideTrackingUtils.ts`)

Fonctions principales:

#### Calculs géographiques
- `calculateDistance()`: Distance entre deux points (formule Haversine)
- `isWithinGeofence()`: Vérifie si dans un rayon de 500m
- `calculateTotalDistance()`: Distance totale d'une série de points

#### Gestion du suivi
- `initializeRideTracking()`: Initialise l'enregistrement de suivi
- `startRideTracking()`: Démarre le suivi GPS
- `addTrackingPoint()`: Ajoute un point GPS
- `verifyDeparture()`: Vérifie la position au départ
- `verifyDestination()`: Vérifie la position à l'arrivée
- `completeRideTracking()`: Termine et valide le trajet

#### Confirmation des passagers
- `generatePassengerQRCode()`: Génère un QR code unique
- `confirmPassengerBoarding()`: Confirme l'embarquement d'un passager

### 3. Interface utilisateur (`app/covoiturage/ride-tracking.tsx`)

Écran de suivi en temps réel avec:

#### Affichage du statut
- ✅ Départ vérifié / ⚪ Non vérifié
- ✅ Arrivée vérifiée / ⚪ Non vérifiée
- Distance parcourue vs distance prévue
- Pourcentage de correspondance

#### Liste des passagers
- Nom et nombre de places
- Bouton "Confirmer" pour chaque passager
- Badge "Confirmé" une fois validé

#### Position actuelle
- Latitude / Longitude
- Vitesse en temps réel

#### Boutons d'action
- "Démarrer le suivi" - Lance le tracking GPS
- "Terminer le suivi" - Arrête et valide le trajet

## Fonctionnement

### 1. Démarrage du trajet

Quand le conducteur clique sur "Démarrer le trajet" dans `my-rides.tsx`:

1. Le système initialise un enregistrement `ride_tracking`
2. Demande les permissions de localisation (foreground + background)
3. Récupère la position actuelle
4. Charge les réservations acceptées

### 2. Pendant le trajet

Le conducteur accède à l'écran "Suivi GPS":

1. **Suivi GPS actif**:
   - Enregistre un point GPS toutes les 10 secondes ou tous les 50 mètres
   - Calcule la distance totale parcourue
   - Vérifie automatiquement les zones de géofencing

2. **Vérification du départ**:
   - Détecte automatiquement quand le conducteur entre dans la zone de départ (500m)
   - Enregistre les coordonnées réelles
   - Marque le départ comme vérifié ✅

3. **Vérification de l'arrivée**:
   - Détecte automatiquement quand le conducteur entre dans la zone d'arrivée (500m)
   - Enregistre les coordonnées réelles
   - Marque l'arrivée comme vérifiée ✅

4. **Confirmation des passagers**:
   - Le conducteur confirme chaque passager qui embarque
   - Génère un QR code unique (optionnel pour scan futur)
   - Enregistre la position GPS de la confirmation
   - Met à jour le compteur de passagers confirmés

### 3. Fin du trajet

Quand le conducteur clique sur "Terminer le suivi":

1. **Arrêt du tracking GPS**
2. **Calcul du pourcentage de correspondance**:
   ```
   % = (distance_parcourue / distance_prévue) × 100
   ```

3. **Vérification finale** - Le trajet est validé SI:
   - ✅ Départ vérifié (dans la zone de 500m)
   - ✅ Arrivée vérifiée (dans la zone de 500m)
   - ✅ Distance parcourue ≥ 80% de la distance prévue
   - ✅ Au moins 1 passager confirmé

4. **Résultat**:
   - ✅ **Vérification réussie**: Le trajet est validé
   - ⚠️ **Vérification échouée**: Notes explicatives sur les critères non remplis

## Critères de validation

| Critère | Seuil | Description |
|---------|-------|-------------|
| **Départ** | 500m | Distance max du point de départ prévu |
| **Arrivée** | 500m | Distance max du point d'arrivée prévu |
| **Distance** | 80% | Pourcentage minimum de la distance prévue |
| **Passagers** | ≥ 1 | Nombre minimum de passagers confirmés |

## Avantages

### Pour la plateforme
- ✅ **Preuve objective** que le trajet a été effectué
- ✅ **Protection contre la fraude** (trajets fictifs)
- ✅ **Données pour résoudre les litiges**
- ✅ **Historique complet** de chaque trajet

### Pour les conducteurs
- ✅ **Transparence** sur la validation du trajet
- ✅ **Protection** en cas de litige
- ✅ **Suivi en temps réel** de leur progression

### Pour les passagers
- ✅ **Assurance** que le conducteur suit bien l'itinéraire
- ✅ **Confirmation** de leur embarquement
- ✅ **Sécurité** accrue

## Permissions requises

### iOS
- `NSLocationWhenInUseUsageDescription`: Suivi en premier plan
- `NSLocationAlwaysAndWhenInUseUsageDescription`: Suivi en arrière-plan
- `UIBackgroundModes`: ["location"] pour le suivi continu

### Android
- `ACCESS_FINE_LOCATION`: Localisation précise
- `ACCESS_COARSE_LOCATION`: Localisation approximative
- `ACCESS_BACKGROUND_LOCATION`: Suivi en arrière-plan (Android 10+)
- `FOREGROUND_SERVICE`: Service en premier plan
- `FOREGROUND_SERVICE_LOCATION`: Service de localisation (Android 14+)

## Configuration dans app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Yombal Yoon utilise votre position pour suivre vos trajets de covoiturage et vérifier leur réalisation."
        }
      ]
    ]
  }
}
```

## Intégration avec le système de paiement

Le système de vérification est intégré avec le paiement:

1. **Avant le paiement**: Le système vérifie que le trajet a été validé
2. **Paiement conditionnel**: Le paiement au conducteur n'est libéré que si la vérification est réussie
3. **Commission**: La commission est calculée uniquement sur les passagers confirmés

## Évolutions futures possibles

### Court terme
- [ ] Scan de QR code par les passagers pour confirmation automatique
- [ ] Notifications push lors des vérifications (départ/arrivée)
- [ ] Affichage de la carte avec le trajet parcouru

### Moyen terme
- [ ] Détection automatique des arrêts intermédiaires
- [ ] Analyse de la vitesse moyenne et du temps de trajet
- [ ] Système de notation basé sur la qualité du suivi

### Long terme
- [ ] Machine learning pour détecter les comportements suspects
- [ ] Intégration avec des systèmes de navigation (Waze, Google Maps)
- [ ] API pour les assurances et partenaires

## Support et maintenance

### Logs
Tous les événements sont loggés avec le préfixe `[RideTracking]`:
```
[RideTracking] Initializing tracking for ride: xxx
[RideTracking] Tracking started successfully
[RideTracking] Departure verification: PASSED (250m)
[RideTracking] Destination verification: PASSED (180m)
[RideTracking] Tracking completed. Verification: PASSED
```

### Debugging
Pour déboguer le système:
1. Vérifier les permissions de localisation
2. Consulter les logs dans la console
3. Vérifier les données dans les tables `ride_tracking` et `passenger_confirmations`
4. Tester avec des coordonnées GPS simulées

### Performance
- Le suivi GPS consomme de la batterie - optimisé avec des intervalles de 10s/50m
- Les points GPS sont stockés en JSONB pour une requête efficace
- Les calculs de distance utilisent la formule Haversine (précise et rapide)

## Conclusion

Ce système offre une solution complète et robuste pour vérifier l'exécution réelle des trajets de covoiturage, protégeant à la fois la plateforme, les conducteurs et les passagers contre la fraude tout en fournissant des données précieuses pour améliorer le service.

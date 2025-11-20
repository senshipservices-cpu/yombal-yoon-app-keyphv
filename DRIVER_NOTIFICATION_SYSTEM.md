
# Système de Notification et Validation pour les Livreurs

## Vue d'ensemble

Ce document décrit le système de notification et de validation pour les livreurs dans le module "Envoi de colis (Thiak Thiak)" de l'application Yombal Yoon.

## Fonctionnalités implémentées

### 1️⃣ Structure de données Supabase

La table `parcels` a été mise à jour avec les colonnes suivantes :

- **assigned_driver_id** (TEXT) : Identifiant du livreur assigné
- **assigned_at** (TIMESTAMP) : Date/heure d'assignation
- **accepted_at** (TIMESTAMP) : Date/heure d'acceptation
- **refused_at** (TIMESTAMP) : Date/heure de refus
- **refused_reason** (TEXT) : Raison du refus
- **status** : Mis à jour pour inclure 'accepted' et 'refused'

### 2️⃣ Flux d'assignation et notification

Lorsqu'un colis est créé :

1. Le colis est créé avec `status = 'pending'`
2. Le système recherche automatiquement les livreurs disponibles dans un rayon de 5 km
3. Le colis est assigné au livreur le plus proche :
   - `status = 'assigned'`
   - `assigned_driver_id = id_du_livreur`
   - `assigned_at = timestamp`
4. Une notification push est envoyée à tous les livreurs à proximité :
   - **Titre** : "Nouvelle demande de colis"
   - **Corps** : "Colis à récupérer à {pickup_address} ({distance} km)"
   - **Données** : `{ type: 'parcel_assignment', parcelId, deliveryPersonId, assignmentId }`

### 3️⃣ Écran "Détail de la demande de colis"

**Chemin** : `/colis/driver-parcel-detail`

**Paramètres** :
- `parcelId` : ID du colis
- `assignmentId` : ID de l'assignation

**Affichage** :
- Adresse de départ (pickup_address)
- Adresse d'arrivée (dropoff_address)
- Description du colis
- Nom de l'expéditeur
- Téléphone de l'expéditeur (masqué : 77 *** ** 86)
- Nom du destinataire
- Téléphone du destinataire (masqué)
- Distance et prix estimés
- Boutons "Appeler" et "WhatsApp" pour contacter expéditeur et destinataire

**Boutons d'action** :
- ✅ **ACCEPTER** : En bas à droite
- ❌ **REFUSER** : En bas à gauche

### 4️⃣ Action du bouton "ACCEPTER"

Lorsque le livreur clique sur "ACCEPTER" :

1. Vérification que le colis n'a pas déjà été accepté par un autre livreur
2. Si disponible :
   - Mise à jour dans Supabase :
     - `status = 'accepted'`
     - `assigned_driver_id = id_du_livreur`
     - `accepted_at = timestamp`
   - Mise à jour locale de l'assignation
   - Changement du statut du livreur à 'busy'
   - Refus automatique des autres assignations pour ce colis
   - Notification aux autres livreurs : "Colis déjà pris"
3. Message de confirmation : "Vous avez accepté cette demande de colis."
4. Redirection vers `/delivery/active-delivery`

Si le colis a déjà été accepté :
- Message : "Ce colis a déjà été accepté par un autre livreur."
- Retour à l'écran précédent

### 5️⃣ Action du bouton "REFUSER"

Lorsque le livreur clique sur "REFUSER" :

1. Affichage d'une confirmation : "Êtes-vous sûr de vouloir refuser cette demande ?"
2. Si confirmé :
   - Mise à jour dans Supabase :
     - `status = 'pending'`
     - `assigned_driver_id = null`
     - `refused_at = timestamp`
     - `refused_reason = 'Refusé par le livreur'`
   - Mise à jour locale de l'assignation
3. Message : "Vous avez refusé cette demande."
4. Retour à l'écran précédent

### 6️⃣ Navigation depuis la notification

Lorsqu'un livreur tape sur une notification :

1. L'application s'ouvre
2. Navigation automatique vers `/colis/driver-parcel-detail`
3. Chargement des détails du colis avec les paramètres :
   - `parcelId` : ID du colis
   - `assignmentId` : ID de l'assignation

### 7️⃣ Écran "Demandes en attente"

**Chemin** : `/colis/driver-pending-requests`

**Affichage** :
- Liste de toutes les demandes en attente pour le livreur
- Badge "NOUVEAU" sur chaque demande
- Temps écoulé depuis l'assignation
- Adresses de départ et d'arrivée
- Distance et prix
- Bouton "Voir les détails" pour chaque demande

**Fonctionnalités** :
- Pull-to-refresh pour actualiser la liste
- Tap sur une demande pour voir les détails
- Affichage d'un message si aucune demande en attente

## Sécurité et confidentialité

### Masquage des numéros de téléphone

Les numéros de téléphone sont affichés masqués dans l'interface :
- Format : `77 *** ** 86`
- Les 2 premiers et 2 derniers chiffres sont visibles
- Les chiffres du milieu sont masqués

### Boutons de contact fonctionnels

Malgré le masquage dans l'UI :
- Le bouton "Appeler" utilise le vrai numéro : `tel:{realPhoneNumber}`
- Le bouton "WhatsApp" ouvre WhatsApp avec le vrai numéro : `https://wa.me/{realPhoneNumber}`

## Architecture technique

### Contextes

1. **ColisContext** : Gestion des colis
   - `getParcelById()` : Récupérer un colis par ID
   - `updateParcelStatus()` : Mettre à jour le statut d'un colis

2. **DeliveryContext** : Gestion des livreurs et assignations
   - `findNearbyDeliveryPersons()` : Trouver les livreurs à proximité
   - `assignParcelToNearbyDeliveryPersons()` : Assigner un colis aux livreurs proches
   - `acceptAssignment()` : Accepter une assignation
   - `refuseAssignment()` : Refuser une assignation
   - `getPendingAssignmentsForDeliveryPerson()` : Récupérer les assignations en attente

3. **NotificationContext** : Gestion des notifications
   - `sendLocalNotification()` : Envoyer une notification locale
   - `registerForPushNotifications()` : Enregistrer pour les notifications push

### Composants

1. **DriverParcelDetailScreen** : Écran de détail d'une demande de colis
2. **DriverPendingRequestsScreen** : Écran de liste des demandes en attente
3. **ContactButtons** : Boutons "Appeler" et "WhatsApp"
4. **IconSymbol** : Icônes cross-platform (iOS/Android)

### Utilitaires

1. **maskPhoneNumber()** : Masquer un numéro de téléphone
2. **calculateDistance()** : Calculer la distance entre deux points

## Flux utilisateur complet

### Pour l'expéditeur

1. Remplir le formulaire d'envoi de colis
2. Valider l'envoi
3. Le colis est créé avec `status = 'pending'`
4. Le système assigne automatiquement le colis aux livreurs à proximité
5. L'expéditeur reçoit une confirmation

### Pour le livreur

1. Recevoir une notification push : "Nouvelle demande de colis"
2. Taper sur la notification
3. L'application s'ouvre sur l'écran de détail du colis
4. Consulter les informations du colis
5. Décider d'accepter ou de refuser :
   - **Accepter** : Le colis est assigné au livreur, redirection vers les livraisons actives
   - **Refuser** : Le colis redevient disponible pour d'autres livreurs

### Gestion des conflits

Si plusieurs livreurs tentent d'accepter le même colis :
- Le premier à accepter obtient le colis
- Les autres reçoivent un message : "Ce colis a déjà été accepté par un autre livreur"
- Leurs assignations sont automatiquement refusées

## Améliorations futures possibles

1. **Authentification des livreurs** : Système de login pour identifier les livreurs
2. **Historique des livraisons** : Écran pour voir toutes les livraisons effectuées
3. **Évaluation des livreurs** : Système de notation après chaque livraison
4. **Suivi en temps réel** : Partage de la position du livreur pendant la livraison
5. **Chat intégré** : Communication directe entre expéditeur et livreur
6. **Notifications push réelles** : Intégration avec Firebase Cloud Messaging ou Expo Push Notifications
7. **Gestion des zones de livraison** : Définir des zones spécifiques pour chaque livreur
8. **Optimisation des trajets** : Suggérer des trajets optimisés pour plusieurs livraisons

## Notes de développement

- Les livreurs sont actuellement simulés avec des données mock dans `DeliveryContext`
- L'ID du livreur est hardcodé à `'dp1'` pour les tests
- En production, il faudra implémenter un système d'authentification pour identifier le livreur connecté
- Les notifications sont actuellement locales (via Expo Notifications)
- Pour des notifications push réelles, il faudra intégrer un service comme Firebase Cloud Messaging

## Support et maintenance

Pour toute question ou problème :
- Consulter les logs de l'application
- Vérifier la connexion Supabase
- Vérifier les permissions de notification
- Consulter la documentation Expo Notifications : https://docs.expo.dev/versions/latest/sdk/notifications/

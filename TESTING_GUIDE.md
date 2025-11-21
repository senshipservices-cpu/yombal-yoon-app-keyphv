
# Yombal Yoon - Guide de Tests Complet

Ce document contient tous les scénarios de tests à effectuer avant la soumission de l'application Yombal Yoon sur les stores.

---

## 🎯 Objectif des Tests

Valider que tous les flux critiques de l'application fonctionnent correctement sur des appareils Android et iOS réels avant la soumission aux stores.

---

## 📱 Environnement de Test

### Appareils Recommandés

#### Android
- **Minimum**: Android 10 (API 29)
- **Recommandé**: Android 13 ou 14
- **Appareils suggérés**:
  - Samsung Galaxy S21/S22/S23
  - Google Pixel 5/6/7
  - Xiaomi Redmi Note 11/12

#### iOS
- **Minimum**: iOS 13
- **Recommandé**: iOS 16 ou 17
- **Appareils suggérés**:
  - iPhone 12/13/14/15
  - iPhone SE (3ème génération)

### Connexion Réseau
- Tester avec WiFi
- Tester avec données mobiles (4G/5G)
- Tester avec connexion lente (pour vérifier les timeouts)

---

## 🧪 Scénarios de Tests

### 1️⃣ Premier Lancement de l'Application

#### Test 1.1: Installation et Splash Screen
**Objectif**: Vérifier que l'app s'installe et démarre correctement

**Étapes**:
1. Installer l'application depuis Internal Testing (Android) ou TestFlight (iOS)
2. Ouvrir l'application
3. Observer le splash screen

**Résultat attendu**:
- ✅ L'application s'installe sans erreur
- ✅ Le splash screen s'affiche (fond blanc + logo Yombal Yoon)
- ✅ Durée du splash screen: 1-3 secondes
- ✅ Transition fluide vers l'écran d'accueil

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 1.2: Écran d'Accueil
**Objectif**: Vérifier que l'écran d'accueil s'affiche correctement

**Étapes**:
1. Observer l'écran d'accueil après le splash screen

**Résultat attendu**:
- ✅ Logo Yombal Yoon visible en haut
- ✅ 3 modules affichés: Covoiturage, Envoi de colis, Livraison 14 régions
- ✅ Icônes et textes clairs
- ✅ Barre de navigation en bas avec 5 onglets
- ✅ Pas d'écran blanc ou de freeze

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 1.3: Navigation entre Onglets
**Objectif**: Vérifier que la navigation fonctionne

**Étapes**:
1. Cliquer sur l'onglet "Covoiturage"
2. Cliquer sur l'onglet "Colis"
3. Cliquer sur l'onglet "Livraison"
4. Cliquer sur l'onglet "Profil"
5. Revenir à l'onglet "Accueil"

**Résultat attendu**:
- ✅ Chaque onglet s'affiche correctement
- ✅ Transition fluide entre les onglets
- ✅ Pas de lag ou de freeze
- ✅ Icônes de la barre de navigation changent de couleur

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 2️⃣ Module Covoiturage

#### Test 2.1: Publier un Trajet (Sans Vérification OTP)
**Objectif**: Vérifier que le formulaire bloque la publication sans OTP

**Étapes**:
1. Aller dans l'onglet "Covoiturage"
2. Cliquer sur "Publier un trajet"
3. Remplir tous les champs:
   - Ville de départ: Dakar
   - Ville d'arrivée: Saint-Louis
   - Date: Demain
   - Heure: 10:00
   - Prix: 5000 FCFA
   - Places disponibles: 3
4. Cliquer sur "Publier un trajet"

**Résultat attendu**:
- ✅ Le formulaire s'affiche correctement
- ✅ Autocomplétion des villes fonctionne
- ✅ Sélection de date/heure fonctionne
- ✅ Modal de vérification OTP s'affiche
- ✅ Message: "Veuillez vérifier votre numéro pour publier un trajet"

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 2.2: Vérification OTP pour Covoiturage
**Objectif**: Vérifier le flux de vérification OTP

**Étapes**:
1. Dans le modal OTP, entrer un numéro de téléphone: +221 77 123 45 67
2. Cliquer sur "Envoyer le code"
3. Entrer le code OTP: 123456 (code de test)
4. Cliquer sur "Vérifier"

**Résultat attendu**:
- ✅ Modal OTP s'affiche correctement
- ✅ Champ de numéro de téléphone fonctionnel
- ✅ Bouton "Envoyer le code" fonctionnel
- ✅ Champ de code OTP s'affiche
- ✅ Vérification réussie
- ✅ Message de confirmation: "Numéro vérifié avec succès"
- ✅ Modal se ferme

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 2.3: Publier un Trajet (Avec Vérification OTP)
**Objectif**: Vérifier que la publication fonctionne après OTP

**Étapes**:
1. Après vérification OTP, remplir à nouveau le formulaire
2. Cliquer sur "Publier un trajet"

**Résultat attendu**:
- ✅ Pas de modal OTP (déjà vérifié)
- ✅ Message de succès: "Trajet publié avec succès"
- ✅ Redirection vers "Mes trajets"
- ✅ Le trajet apparaît dans la liste

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 2.4: Rechercher un Trajet
**Objectif**: Vérifier la recherche de trajets

**Étapes**:
1. Aller dans "Covoiturage" > "Rechercher un trajet"
2. Entrer:
   - Départ: Dakar
   - Arrivée: Saint-Louis
   - Date: Aujourd'hui ou demain
3. Cliquer sur "Rechercher"

**Résultat attendu**:
- ✅ Formulaire de recherche fonctionnel
- ✅ Autocomplétion des villes fonctionne
- ✅ Résultats affichés (si trajets disponibles)
- ✅ Chaque trajet affiche: départ, arrivée, date, heure, prix, places
- ✅ Badge "Conducteur Vérifié" visible

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 2.5: Réserver un Trajet
**Objectif**: Vérifier la réservation d'un trajet

**Étapes**:
1. Dans les résultats de recherche, cliquer sur un trajet
2. Sélectionner le nombre de places: 1
3. Cliquer sur "Réserver"

**Résultat attendu**:
- ✅ Détails du trajet affichés
- ✅ Sélection du nombre de places fonctionne
- ✅ Message de confirmation: "Réservation effectuée avec succès"
- ✅ Redirection vers "Mes réservations"
- ✅ La réservation apparaît dans la liste

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 2.6: Masquage des Numéros et Boutons Contact
**Objectif**: Vérifier la sécurité des numéros de téléphone

**Étapes**:
1. Dans "Mes réservations", ouvrir une réservation
2. Observer le numéro du conducteur
3. Cliquer sur le bouton "Appeler"
4. Cliquer sur le bouton "WhatsApp"

**Résultat attendu**:
- ✅ Numéro masqué: +221 XX XXX XX 67
- ✅ Badge "Conducteur Vérifié" visible
- ✅ Bouton "Appeler" ouvre le dialer avec le numéro réel
- ✅ Bouton "WhatsApp" ouvre WhatsApp avec le numéro réel
- ✅ Aucun numéro affiché en clair dans l'interface

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 3️⃣ Module Envoi de Colis (Thiak Thiak)

#### Test 3.1: Formulaire Envoi de Colis (Sans OTP)
**Objectif**: Vérifier que le formulaire bloque l'envoi sans OTP

**Étapes**:
1. Aller dans l'onglet "Colis"
2. Cliquer sur "Envoyer un colis"
3. Remplir tous les champs:
   - Nom expéditeur: Jean Dupont
   - Téléphone expéditeur: +221 77 123 45 67
   - Adresse expéditeur: Dakar, Plateau (utiliser autocomplétion)
   - Nom destinataire: Marie Martin
   - Téléphone destinataire: +221 77 987 65 43
   - Adresse destinataire: Saint-Louis, Centre-ville (utiliser autocomplétion)
   - Description: Vêtements
   - Poids: 5 kg
4. Observer le calcul automatique de la distance et du prix
5. Cliquer sur "Envoyer mon colis"

**Résultat attendu**:
- ✅ Formulaire s'affiche correctement
- ✅ Autocomplétion Google Maps fonctionne (Web, Android, iOS)
- ✅ Distance calculée automatiquement (ex: 250 km)
- ✅ Prix calculé automatiquement (ex: 5000 FCFA)
- ✅ Modal de vérification OTP s'affiche
- ✅ Message: "Veuillez vérifier votre numéro pour envoyer un colis"

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.2: Vérification OTP pour Envoi de Colis
**Objectif**: Vérifier le flux de vérification OTP

**Étapes**:
1. Dans le modal OTP, entrer le numéro: +221 77 123 45 67
2. Cliquer sur "Envoyer le code"
3. Entrer le code OTP: 123456
4. Cliquer sur "Vérifier"

**Résultat attendu**:
- ✅ Modal OTP fonctionnel
- ✅ Vérification réussie
- ✅ Message: "Numéro vérifié avec succès"
- ✅ Modal se ferme

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.3: Envoi de Colis (Avec OTP)
**Objectif**: Vérifier que l'envoi fonctionne après OTP

**Étapes**:
1. Après vérification OTP, remplir à nouveau le formulaire
2. Cliquer sur "Envoyer mon colis"

**Résultat attendu**:
- ✅ Pas de modal OTP (déjà vérifié)
- ✅ Message de succès: "Colis enregistré avec succès"
- ✅ Redirection vers "Mes colis"
- ✅ Le colis apparaît avec statut "En attente"

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.4: Acceptation par un Livreur
**Objectif**: Vérifier le flux d'acceptation côté livreur

**Étapes**:
1. Se connecter en tant que livreur (ou utiliser un compte livreur de test)
2. Aller dans "Demandes en attente"
3. Voir la liste des demandes de colis
4. Cliquer sur une demande
5. Cliquer sur "ACCEPTER"

**Résultat attendu**:
- ✅ Liste des demandes affichée
- ✅ Détails du colis affichés (expéditeur, destinataire, adresses)
- ✅ Boutons "ACCEPTER" et "REFUSER" visibles
- ✅ Confirmation demandée avant acceptation
- ✅ Message: "Demande acceptée avec succès"
- ✅ Statut du colis passe à "accepted"
- ✅ Notification envoyée à l'expéditeur

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.5: Trajet 1 - Récupération du Colis
**Objectif**: Vérifier le trajet vers l'expéditeur

**Étapes**:
1. Après acceptation, le livreur est redirigé vers "Route vers récupération"
2. Observer la carte avec la position du livreur
3. Observer l'itinéraire vers l'expéditeur
4. Observer l'ETA
5. Cliquer sur "J'ai récupéré le colis"

**Résultat attendu**:
- ✅ Carte affichée avec position du livreur
- ✅ Itinéraire vers l'expéditeur visible
- ✅ ETA calculé et affiché (ex: 15 min)
- ✅ Position du livreur mise à jour en temps réel
- ✅ Bouton "J'ai récupéré le colis" fonctionnel
- ✅ Confirmation demandée
- ✅ Statut du colis passe à "picked_up"
- ✅ Notification envoyée à l'expéditeur

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.6: Trajet 2 - Livraison du Colis
**Objectif**: Vérifier le trajet vers le destinataire

**Étapes**:
1. Après récupération, le livreur est redirigé vers "Route vers livraison"
2. Observer la carte avec la position du livreur
3. Observer l'itinéraire vers le destinataire
4. Observer l'ETA
5. Cliquer sur "Livraison effectuée"

**Résultat attendu**:
- ✅ Carte affichée avec position du livreur
- ✅ Itinéraire vers le destinataire visible
- ✅ ETA calculé et affiché
- ✅ Position du livreur mise à jour en temps réel
- ✅ Bouton "Livraison effectuée" fonctionnel
- ✅ Confirmation demandée
- ✅ Statut du colis passe à "delivered"
- ✅ Statut du livreur redevient "available"
- ✅ Notification envoyée à l'expéditeur et destinataire

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 3.7: Suivi Côté Expéditeur
**Objectif**: Vérifier le suivi en temps réel

**Étapes**:
1. Se reconnecter en tant qu'expéditeur
2. Aller dans "Mes colis"
3. Ouvrir le colis en cours de livraison
4. Observer la carte avec la position du livreur
5. Observer les statuts

**Résultat attendu**:
- ✅ Liste des colis affichée
- ✅ Statuts corrects: "En attente", "Accepté", "Récupéré", "Livré"
- ✅ Carte avec position du livreur en temps réel
- ✅ ETA affiché et mis à jour
- ✅ Messages de statut clairs en français
- ✅ Badge "Livreur Vérifié" visible
- ✅ Boutons Appeler/WhatsApp fonctionnels

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 4️⃣ Module Livraison 14 Régions

#### Test 4.1: Formulaire Livraison Inter-Régions
**Objectif**: Vérifier le formulaire de livraison

**Étapes**:
1. Aller dans l'onglet "Livraison"
2. Remplir le formulaire:
   - Nom: Pierre Sow
   - Téléphone: +221 77 555 66 77
   - Email: pierre@example.com
   - Région de départ: Dakar
   - Région d'arrivée: Thiès
   - Description du colis: Électronique
   - Poids: 10 kg
3. Cliquer sur "COMMANDER"

**Résultat attendu**:
- ✅ Formulaire s'affiche correctement
- ✅ Sélection des régions fonctionne (14 régions du Sénégal)
- ✅ Tous les champs validés
- ✅ Message de succès: "Demande de livraison enregistrée"
- ✅ Email envoyé à senshipservices@gmail.com
- ✅ WhatsApp envoyé à +221 77 567 64 86

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 4.2: Vérification des Notifications
**Objectif**: Vérifier que les notifications sont envoyées

**Étapes**:
1. Vérifier l'email à senshipservices@gmail.com
2. Vérifier le WhatsApp à +221 77 567 64 86

**Résultat attendu**:
- ✅ Email reçu avec toutes les informations
- ✅ WhatsApp reçu avec toutes les informations
- ✅ Contenu clair et complet

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 5️⃣ Module Profil et Feedback

#### Test 5.1: Écran Profil
**Objectif**: Vérifier l'affichage du profil

**Étapes**:
1. Aller dans l'onglet "Profil"
2. Observer les informations affichées

**Résultat attendu**:
- ✅ Numéro de téléphone affiché (masqué si non vérifié)
- ✅ Statut de vérification affiché
- ✅ Boutons "Mes trajets", "Mes réservations", "Mes colis" visibles
- ✅ Bouton "Feedback" visible
- ✅ Boutons de contact Yombal Yoon visibles

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 5.2: Contact Yombal Yoon
**Objectif**: Vérifier les boutons de contact

**Étapes**:
1. Dans le profil, cliquer sur "Appeler Yombal Yoon"
2. Cliquer sur "WhatsApp Yombal Yoon"

**Résultat attendu**:
- ✅ Bouton "Appeler" ouvre le dialer avec +221 76 567 64 86
- ✅ Bouton "WhatsApp" ouvre WhatsApp avec +221 76 567 64 86
- ✅ Numéros corrects et fonctionnels

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 5.3: Formulaire Feedback
**Objectif**: Vérifier le formulaire de feedback

**Étapes**:
1. Cliquer sur "Feedback"
2. Remplir le formulaire:
   - Type: Avis positif
   - Message: "Application très utile !"
   - Email: test@example.com (optionnel)
3. Cliquer sur "Envoyer"

**Résultat attendu**:
- ✅ Formulaire s'affiche correctement
- ✅ Sélection du type de feedback fonctionne
- ✅ Champ de message fonctionnel
- ✅ Message de succès: "Merci pour votre retour"
- ✅ Insertion dans `feedbacks` réussie

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 6️⃣ Tests de Performance et Stabilité

#### Test 6.1: Navigation Rapide
**Objectif**: Vérifier la stabilité lors de navigation rapide

**Étapes**:
1. Naviguer rapidement entre tous les onglets (10 fois)
2. Ouvrir et fermer plusieurs écrans rapidement

**Résultat attendu**:
- ✅ Pas de crash
- ✅ Pas de freeze
- ✅ Navigation fluide
- ✅ Pas de fuite mémoire

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 6.2: Connexion Lente
**Objectif**: Vérifier le comportement avec connexion lente

**Étapes**:
1. Activer une connexion lente (3G ou limiter la bande passante)
2. Essayer de publier un trajet
3. Essayer d'envoyer un colis
4. Essayer de rechercher un trajet

**Résultat attendu**:
- ✅ Indicateurs de chargement affichés
- ✅ Pas d'écran blanc
- ✅ Messages d'erreur clairs si timeout
- ✅ Possibilité de réessayer

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 6.3: Mode Hors Ligne
**Objectif**: Vérifier le comportement sans connexion

**Étapes**:
1. Désactiver WiFi et données mobiles
2. Essayer d'utiliser l'application

**Résultat attendu**:
- ✅ Message clair: "Pas de connexion Internet"
- ✅ Pas de crash
- ✅ Possibilité de naviguer dans l'app (écrans déjà chargés)

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

### 7️⃣ Tests de Sécurité

#### Test 7.1: Vérification OTP Obligatoire
**Objectif**: Vérifier que l'OTP est obligatoire

**Étapes**:
1. Essayer de publier un trajet sans OTP
2. Essayer d'envoyer un colis sans OTP

**Résultat attendu**:
- ✅ Modal OTP s'affiche
- ✅ Impossible de continuer sans vérification
- ✅ Message clair

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 7.2: Masquage des Numéros
**Objectif**: Vérifier qu'aucun numéro n'est affiché en clair

**Étapes**:
1. Parcourir toute l'application
2. Vérifier tous les écrans où des numéros sont affichés

**Résultat attendu**:
- ✅ Tous les numéros masqués: +221 XX XXX XX 86
- ✅ Aucun numéro en clair dans l'interface
- ✅ Boutons Appeler/WhatsApp utilisent les numéros réels

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

#### Test 7.3: Badges de Vérification
**Objectif**: Vérifier que les badges sont affichés

**Étapes**:
1. Vérifier les badges dans les résultats de recherche de covoiturage
2. Vérifier les badges dans le suivi de colis

**Résultat attendu**:
- ✅ Badge "Conducteur Vérifié" affiché pour les conducteurs vérifiés
- ✅ Badge "Expéditeur Vérifié" affiché pour les expéditeurs vérifiés
- ✅ Badge "Livreur Vérifié" affiché pour les livreurs vérifiés
- ✅ Badges visibles et bien positionnés

**Résultat**: ⬜ Réussi / ⬜ Échoué

---

## 📊 Rapport de Tests

### Résumé des Tests

| Module | Tests Réussis | Tests Échoués | Taux de Réussite |
|--------|---------------|---------------|------------------|
| Premier Lancement | __ / 3 | __ / 3 | __% |
| Covoiturage | __ / 6 | __ / 6 | __% |
| Envoi de Colis | __ / 7 | __ / 7 | __% |
| Livraison 14 Régions | __ / 2 | __ / 2 | __% |
| Profil et Feedback | __ / 3 | __ / 3 | __% |
| Performance | __ / 3 | __ / 3 | __% |
| Sécurité | __ / 3 | __ / 3 | __% |
| **TOTAL** | __ / 27 | __ / 27 | __% |

### Bugs Identifiés

| ID | Sévérité | Module | Description | Statut |
|----|----------|--------|-------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Sévérité**: Critique / Majeure / Mineure / Cosmétique

### Recommandations

1. 
2. 
3. 

### Conclusion

⬜ **Application prête pour soumission**
⬜ **Corrections mineures nécessaires**
⬜ **Corrections majeures nécessaires**

---

## 📝 Notes du Testeur

### Appareil Android
- Modèle: _______________
- Version Android: _______________
- Date du test: _______________
- Testeur: _______________

### Appareil iOS
- Modèle: _______________
- Version iOS: _______________
- Date du test: _______________
- Testeur: _______________

### Commentaires Généraux

```
[Ajouter vos commentaires ici]
```

---

*Guide de tests préparé pour Yombal Yoon v1.0.0*
*Date: Janvier 2025*

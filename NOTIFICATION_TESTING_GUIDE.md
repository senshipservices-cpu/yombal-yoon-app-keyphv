
# 🧪 Guide de Test des Notifications Livreur

## Vue d'Ensemble

Ce guide vous aide à tester le nouveau système de notification plein écran pour les livreurs dans le module "Envoi de colis (Thiak Thiak)".

## Prérequis

### Configuration Requise
- ✅ App installée sur un appareil physique (iOS ou Android)
- ✅ Permissions de notification accordées
- ✅ Connexion internet active
- ✅ Son du téléphone activé (pas en mode silencieux)

### Vérification des Permissions

#### iOS
1. Ouvrir **Réglages** → **Notifications** → **Yombal Yoon**
2. Vérifier que "Autoriser les notifications" est activé
3. Vérifier que "Sons" est activé
4. Vérifier que "Badges" est activé

#### Android
1. Ouvrir **Paramètres** → **Applications** → **Yombal Yoon** → **Notifications**
2. Vérifier que les notifications sont activées
3. Vérifier que le canal "Livraison de Colis" est activé
4. Vérifier que l'importance est réglée sur "Urgent" ou "Élevée"

## Scénarios de Test

### 📱 Scénario 1 : App en Premier Plan (Foreground)

**Objectif :** Vérifier que l'écran s'ouvre automatiquement quand l'app est ouverte

**Étapes :**
1. Ouvrir l'app Yombal Yoon
2. Rester sur l'écran d'accueil
3. Créer un nouveau colis (via un autre appareil ou l'interface web)
4. **Attendre 2-3 secondes**

**Résultats Attendus :**
- ✅ Son de notification joué
- ✅ Vibration du téléphone (pattern : pause-vibration-pause-vibration)
- ✅ Feedback haptique (sensation tactile)
- ✅ **L'écran "Détail de la demande" s'ouvre automatiquement**
- ✅ Toutes les infos du colis sont affichées
- ✅ Boutons ACCEPTER et REFUSER visibles
- ✅ Une notification apparaît aussi dans l'icône cloche (badge)

**Capture d'Écran :**
```
┌─────────────────────────────┐
│  🚨 Nouvelle demande        │
│  Colis Thiak Thiak          │
├─────────────────────────────┤
│                             │
│  ⚠️ Veuillez accepter ou    │
│     refuser rapidement      │
│                             │
│  📦 Informations du colis   │
│  📍 Adresse de départ       │
│  📍 Adresse d'arrivée       │
│  💰 Prix : 2500 FCFA        │
│                             │
│  👤 Expéditeur              │
│  👤 Destinataire            │
│                             │
├─────────────────────────────┤
│  ❌ REFUSER  │  ✅ ACCEPTER │
└─────────────────────────────┘
```

---

### 📲 Scénario 2 : App en Arrière-Plan (Background)

**Objectif :** Vérifier que la notification système fonctionne et ouvre l'écran

**Étapes :**
1. Ouvrir l'app Yombal Yoon
2. Appuyer sur le bouton **Home** (mettre l'app en arrière-plan)
3. Créer un nouveau colis
4. **Attendre que la notification apparaisse**
5. Taper sur la notification dans la barre système

**Résultats Attendus :**
- ✅ Notification apparaît dans la barre système
- ✅ Titre : "🚨 Nouvelle demande de colis"
- ✅ Corps : "Colis à récupérer à [adresse] (X.X km)"
- ✅ Son de notification joué
- ✅ Vibration du téléphone
- ✅ **Taper sur la notification ouvre l'app**
- ✅ **L'app s'ouvre directement sur l'écran "Détail de la demande"**
- ✅ Feedback haptique au tap

**Notification Système (Android) :**
```
┌─────────────────────────────────────┐
│ 🚨 Nouvelle demande de colis        │
│ Yombal Yoon • Maintenant            │
│                                     │
│ Colis à récupérer à Dakar Plateau   │
│ (2.3 km)                            │
└─────────────────────────────────────┘
```

---

### 🔒 Scénario 3 : Écran Verrouillé (Lock Screen)

**Objectif :** Vérifier que la notification apparaît sur l'écran verrouillé

**Étapes :**
1. Ouvrir l'app Yombal Yoon
2. **Verrouiller le téléphone** (bouton power)
3. Créer un nouveau colis
4. **Attendre que la notification apparaisse**
5. Déverrouiller le téléphone
6. Taper sur la notification

**Résultats Attendus :**
- ✅ Notification apparaît sur l'écran verrouillé
- ✅ Son de notification joué (même si verrouillé)
- ✅ Vibration du téléphone
- ✅ Écran s'allume brièvement
- ✅ **Taper sur la notification déverrouille et ouvre l'app**
- ✅ **L'app s'ouvre sur l'écran "Détail de la demande"**

---

### ✅ Scénario 4 : Action ACCEPTER

**Objectif :** Vérifier que l'acceptation fonctionne correctement

**Étapes :**
1. Ouvrir l'écran "Détail de la demande" (via notification)
2. Lire les informations du colis
3. Taper sur le bouton **ACCEPTER** (vert)
4. Attendre la confirmation

**Résultats Attendus :**
- ✅ Feedback haptique au tap du bouton
- ✅ Bouton affiche "ACCEPTATION..." pendant le traitement
- ✅ Boîte de dialogue de confirmation apparaît :
  - Titre : "✅ Demande acceptée"
  - Message : "Vous avez accepté cette demande de colis..."
- ✅ **Navigation vers l'écran "Livraisons actives"**
- ✅ Le colis apparaît dans les livraisons actives
- ✅ Statut du colis mis à jour : "Accepté"
- ✅ Autres livreurs reçoivent une notification "Colis déjà pris"

**Boîte de Dialogue :**
```
┌─────────────────────────────┐
│  ✅ Demande acceptée         │
│                             │
│  Vous avez accepté cette    │
│  demande de colis.          │
│  Rendez-vous à l'adresse    │
│  de départ pour récupérer   │
│  le colis.                  │
│                             │
│           [ OK ]            │
└─────────────────────────────┘
```

---

### ❌ Scénario 5 : Action REFUSER

**Objectif :** Vérifier que le refus fonctionne correctement

**Étapes :**
1. Ouvrir l'écran "Détail de la demande" (via notification)
2. Taper sur le bouton **REFUSER** (rouge)
3. Confirmer le refus dans la boîte de dialogue
4. Attendre la confirmation

**Résultats Attendus :**
- ✅ Feedback haptique au tap du bouton
- ✅ Boîte de dialogue de confirmation apparaît :
  - Titre : "Refuser la demande"
  - Message : "Êtes-vous sûr de vouloir refuser cette demande ?"
  - Boutons : "Annuler" et "Refuser"
- ✅ Après confirmation :
  - Bouton affiche "REFUS..." pendant le traitement
  - Boîte de dialogue finale : "Demande refusée"
- ✅ **Navigation vers l'écran précédent**
- ✅ Statut du colis mis à jour : "En attente" (pending)
- ✅ Le colis peut être réassigné à un autre livreur

**Boîte de Dialogue de Confirmation :**
```
┌─────────────────────────────┐
│  Refuser la demande         │
│                             │
│  Êtes-vous sûr de vouloir   │
│  refuser cette demande ?    │
│                             │
│  [ Annuler ]  [ Refuser ]   │
└─────────────────────────────┘
```

---

### 🔄 Scénario 6 : Colis Déjà Pris

**Objectif :** Vérifier le comportement quand un autre livreur a déjà accepté

**Étapes :**
1. Créer un colis (assigné à plusieurs livreurs)
2. **Livreur A** accepte le colis
3. **Livreur B** essaie d'accepter le même colis
4. Observer le résultat

**Résultats Attendus pour Livreur B :**
- ✅ Notification reçue : "❌ Colis déjà pris"
- ✅ Message : "Ce colis a été accepté par un autre livreur"
- ✅ Si l'écran "Détail" est ouvert :
  - Boîte de dialogue : "Colis déjà pris"
  - Navigation automatique vers l'écran précédent
- ✅ Le colis n'apparaît pas dans les livraisons actives

---

### 🔔 Scénario 7 : Historique des Notifications

**Objectif :** Vérifier que les notifications sont sauvegardées dans la cloche

**Étapes :**
1. Recevoir plusieurs notifications de colis
2. Taper sur l'icône **cloche** en haut à droite
3. Observer la liste des notifications

**Résultats Attendus :**
- ✅ Toutes les notifications sont listées
- ✅ Badge avec le nombre de notifications non lues
- ✅ Notifications non lues ont une bordure colorée
- ✅ Taper sur une notification ouvre l'écran "Détail"
- ✅ Bouton "Tout marquer comme lu" fonctionne
- ✅ Bouton "Tout effacer" fonctionne

---

## 🎯 Checklist de Test Complète

### Fonctionnalités de Base
- [ ] Son de notification joué
- [ ] Vibration du téléphone
- [ ] Feedback haptique
- [ ] Navigation automatique (foreground)
- [ ] Navigation par tap (background)
- [ ] Affichage des détails du colis
- [ ] Boutons ACCEPTER/REFUSER visibles

### Informations Affichées
- [ ] Adresse de départ
- [ ] Adresse d'arrivée
- [ ] Description du colis
- [ ] Distance en km
- [ ] Prix en FCFA
- [ ] Nom de l'expéditeur
- [ ] Téléphone expéditeur (masqué)
- [ ] Nom du destinataire
- [ ] Téléphone destinataire (masqué)

### Actions
- [ ] Bouton ACCEPTER fonctionne
- [ ] Navigation vers "Livraisons actives"
- [ ] Statut mis à jour dans Supabase
- [ ] Bouton REFUSER fonctionne
- [ ] Boîte de dialogue de confirmation
- [ ] Navigation vers l'écran précédent

### Cas Limites
- [ ] Colis déjà pris par un autre livreur
- [ ] Notification "Colis déjà pris" reçue
- [ ] Plusieurs notifications simultanées
- [ ] App fermée complètement (force quit)
- [ ] Connexion internet perdue
- [ ] Permissions de notification refusées

### Historique
- [ ] Notifications sauvegardées dans la cloche
- [ ] Badge avec nombre non lu
- [ ] Marquer comme lu fonctionne
- [ ] Effacer tout fonctionne

---

## 🐛 Problèmes Connus et Solutions

### Problème 1 : Pas de Son
**Symptôme :** La notification arrive mais sans son

**Solutions :**
1. Vérifier que le téléphone n'est pas en mode silencieux
2. Vérifier le volume des notifications dans les paramètres
3. iOS : Vérifier que "Sons" est activé dans Réglages → Notifications
4. Android : Vérifier l'importance du canal de notification

### Problème 2 : Pas de Vibration
**Symptôme :** La notification arrive mais sans vibration

**Solutions :**
1. Vérifier que la vibration est activée dans les paramètres du téléphone
2. Android : Vérifier que le canal de notification a la vibration activée
3. iOS : Vérifier que "Vibration" est activée dans Réglages → Sons et vibrations

### Problème 3 : Navigation Automatique Ne Fonctionne Pas
**Symptôme :** L'écran ne s'ouvre pas automatiquement (foreground)

**Solutions :**
1. Vérifier les logs console pour les erreurs
2. Vérifier que `parcelId` et `assignmentId` sont passés dans la notification
3. Attendre 2-3 secondes (délai de 500ms + temps de chargement)
4. Redémarrer l'app

### Problème 4 : Notification N'Apparaît Pas
**Symptôme :** Aucune notification reçue

**Solutions :**
1. Vérifier les permissions de notification
2. Vérifier que l'app a accès à internet
3. Vérifier que le livreur est dans le rayon de 10 km
4. Vérifier les logs console pour les erreurs d'envoi

---

## 📊 Rapport de Test

Utilisez ce template pour documenter vos tests :

```
Date : _______________
Testeur : _______________
Appareil : _______________
OS : _______________

Scénario 1 (Foreground) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 2 (Background) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 3 (Lock Screen) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 4 (Accepter) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 5 (Refuser) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 6 (Déjà Pris) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Scénario 7 (Historique) : ☐ Réussi ☐ Échoué
Notes : _________________________________

Problèmes Rencontrés :
_________________________________
_________________________________

Suggestions d'Amélioration :
_________________________________
_________________________________
```

---

## 🎉 Conclusion

Ce système de notification plein écran offre une **expérience utilisateur optimale** pour les livreurs :

- ⚡ **Réactivité immédiate** : Pas besoin de chercher dans la cloche
- 🔊 **Impossible à manquer** : Son + vibration + haptic
- 👀 **Toutes les infos visibles** : Écran plein écran complet
- ⚡ **Action rapide** : Boutons ACCEPTER/REFUSER accessibles
- 📱 **Fonctionne partout** : Foreground, background, lock screen

**Le livreur peut réagir en quelques secondes à chaque nouvelle demande !**

---

**Bon test ! 🚀**

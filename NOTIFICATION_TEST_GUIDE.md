
# Guide de Test - Système de Notifications Covoiturage

## 🎯 Objectif
Vérifier que les notifications apparaissent bien dans la **barre de notification du téléphone** (comme Uber/Yango) et pas seulement dans l'icône cloche de l'app.

## 📱 Prérequis
- Application installée sur un appareil physique (iOS ou Android)
- Permissions de notification accordées
- Deux comptes/appareils pour tester conducteur et passager

## ✅ Tests à effectuer

### Test 1 : Nouvelle réservation (Conducteur)

**Étapes :**
1. **Appareil A (Conducteur)** :
   - Ouvrir l'app
   - Aller dans "Covoiturage"
   - Publier un nouveau trajet
   - **Mettre l'app en arrière-plan** (bouton Home)

2. **Appareil B (Passager)** :
   - Ouvrir l'app
   - Aller dans "Covoiturage" → "Rechercher un trajet"
   - Trouver le trajet publié
   - Faire une réservation

3. **Vérification sur Appareil A** :
   - ✅ Une notification doit apparaître dans la barre de notification
   - ✅ Le téléphone doit vibrer
   - ✅ Un son doit être joué
   - ✅ Le badge de l'app doit s'incrémenter
   - ✅ Titre : "🚗 Nouvelle réservation !"
   - ✅ Corps : "[Nom] souhaite réserver [X] place(s)..."

4. **Test de navigation** :
   - Taper sur la notification
   - ✅ L'app doit s'ouvrir sur "Mes trajets publiés"

---

### Test 2 : Réservation acceptée (Passager)

**Étapes :**
1. **Appareil B (Passager)** :
   - **Mettre l'app en arrière-plan**

2. **Appareil A (Conducteur)** :
   - Ouvrir "Mes trajets publiés"
   - Accepter la réservation en attente

3. **Vérification sur Appareil B** :
   - ✅ Notification dans la barre de notification
   - ✅ Vibration + son
   - ✅ Titre : "✅ Réservation acceptée !"
   - ✅ Corps : "[Conducteur] a accepté votre réservation..."

4. **Test de navigation** :
   - Taper sur la notification
   - ✅ L'app doit s'ouvrir sur "Mes réservations"

---

### Test 3 : Réservation refusée (Passager)

**Étapes :**
1. Créer une nouvelle réservation (comme Test 1)
2. **Appareil B** : Mettre en arrière-plan
3. **Appareil A** : Refuser la réservation
4. **Vérification sur Appareil B** :
   - ✅ Notification : "❌ Réservation refusée"
   - ✅ Vibration + son

---

### Test 4 : Trajet annulé (Passager)

**Étapes :**
1. Créer et accepter une réservation
2. **Appareil B (Passager)** : Mettre en arrière-plan
3. **Appareil A (Conducteur)** :
   - Aller dans "Mes trajets publiés"
   - Cliquer sur "Annuler le trajet"
   - Confirmer l'annulation

4. **Vérification sur Appareil B** :
   - ✅ Notification : "⚠️ Trajet annulé"
   - ✅ Corps : "Le trajet [Départ] → [Arrivée] du [Date] a été annulé..."
   - ✅ Vibration + son

---

### Test 5 : App complètement fermée

**Étapes :**
1. **Appareil A** :
   - Fermer complètement l'app (swipe up dans le multitâche)
   
2. **Appareil B** :
   - Créer une nouvelle réservation

3. **Vérification sur Appareil A** :
   - ✅ La notification doit quand même apparaître
   - ✅ Taper dessus doit ouvrir l'app

---

### Test 6 : Notifications multiples

**Étapes :**
1. Créer 3 réservations différentes rapidement
2. **Vérification** :
   - ✅ 3 notifications distinctes dans la barre
   - ✅ Badge de l'app = 3
   - ✅ Historique dans l'écran "Notifications"

---

### Test 7 : Écran verrouillé

**Étapes :**
1. **Appareil A** : Verrouiller l'écran
2. **Appareil B** : Créer une réservation
3. **Vérification sur Appareil A** :
   - ✅ Notification visible sur écran verrouillé
   - ✅ Vibration + son même écran verrouillé

---

## 🔍 Points de vérification Android

### Canaux de notification
1. Aller dans **Paramètres** → **Applications** → **Yombal Yoon** → **Notifications**
2. Vérifier la présence de 3 canaux :
   - ✅ "Notifications Conducteur"
   - ✅ "Notifications Passager"
   - ✅ "Livraison de Colis"
3. Vérifier que tous sont activés avec priorité "Urgente"

### Permissions
1. Vérifier que les permissions de notification sont accordées
2. Si refusées, les réactiver manuellement

---

## 🔍 Points de vérification iOS

### Paramètres de notification
1. Aller dans **Réglages** → **Notifications** → **Yombal Yoon**
2. Vérifier :
   - ✅ "Autoriser les notifications" activé
   - ✅ "Sons" activé
   - ✅ "Badges" activé
   - ✅ "Bannières" activé
   - ✅ Style de bannière : "Temporaire" ou "Persistante"

---

## 📊 Checklist complète

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Nouvelle réservation (conducteur) | ⬜ |
| 2 | Réservation acceptée (passager) | ⬜ |
| 3 | Réservation refusée (passager) | ⬜ |
| 4 | Trajet annulé (passager) | ⬜ |
| 5 | App fermée | ⬜ |
| 6 | Notifications multiples | ⬜ |
| 7 | Écran verrouillé | ⬜ |
| 8 | Son activé | ⬜ |
| 9 | Vibration activée | ⬜ |
| 10 | Badge app mis à jour | ⬜ |
| 11 | Navigation automatique | ⬜ |
| 12 | Historique sauvegardé | ⬜ |

---

## 🐛 Dépannage

### Les notifications n'apparaissent pas

1. **Vérifier les permissions** :
   ```
   Paramètres → Applications → Yombal Yoon → Notifications
   ```

2. **Vérifier les logs** :
   - Ouvrir la console de développement
   - Chercher les messages avec 🔔, ✅, ❌
   - Vérifier "✅ Push notification permissions granted"

3. **Redémarrer l'app** :
   - Fermer complètement
   - Rouvrir
   - Les permissions seront redemandées

4. **Tester sur appareil physique** :
   - Les notifications ne fonctionnent pas toujours sur simulateur/émulateur

### Les notifications apparaissent mais sans son

1. Vérifier le volume du téléphone
2. Vérifier le mode "Ne pas déranger"
3. Vérifier les paramètres de canal (Android)

### Les notifications n'apparaissent que dans l'app

1. Vérifier que `expo-notifications` est bien installé
2. Vérifier la configuration dans `app.json`
3. Rebuilder l'app avec EAS

---

## 📝 Notes importantes

- **Simulateur iOS** : Les notifications peuvent ne pas fonctionner correctement
- **Émulateur Android** : Idem, préférer un appareil physique
- **Première utilisation** : Les permissions sont demandées au premier lancement
- **Web** : Les notifications web nécessitent HTTPS

---

## ✅ Résultat attendu

Après tous les tests, vous devriez avoir :
- ✅ Notifications visibles dans la barre de notification système
- ✅ Son et vibration fonctionnels
- ✅ Badge de l'app mis à jour
- ✅ Navigation automatique vers les bons écrans
- ✅ Historique complet dans l'écran "Notifications"
- ✅ Expérience similaire à Uber/Yango

---

## 🎉 Félicitations !

Si tous les tests passent, votre système de notifications est **robuste et professionnel** ! 🚀


# Guide de Test Rapide - Notifications Covoiturage

## 🚀 Test Rapide en 5 Minutes

### Préparation
- 2 appareils ou 2 comptes
- Appareil A = **Conducteur**
- Appareil B = **Passager**

---

## ✅ Test 1: Notification Nouvelle Réservation (30 secondes)

**Sur Appareil A (Conducteur):**
1. Ouvrir "Covoiturage"
2. Cliquer "Publier un trajet"
3. Remplir: Dakar → Thiès, Demain, 4 places, 2000 FCFA
4. Publier

**Sur Appareil B (Passager):**
1. Ouvrir "Covoiturage"
2. Cliquer "Rechercher un trajet"
3. Chercher: Dakar → Thiès, Demain, 1 passager
4. Cliquer "Réserver" sur le trajet
5. Remplir nom et téléphone
6. Cliquer "Confirmer la réservation"

**✅ Vérifications:**
- [ ] Message de succès s'affiche sur Appareil B
- [ ] Notification push sur Appareil A
- [ ] Notification dans la cloche sur Appareil A
- [ ] Réservation visible dans "Mes trajets publiés" (Appareil A)

---

## ✅ Test 2: Notification Acceptation (20 secondes)

**Sur Appareil A (Conducteur):**
1. Aller dans "Mes trajets publiés"
2. Voir la réservation "En attente"
3. Cliquer "Accepter"

**✅ Vérifications:**
- [ ] Notification push sur Appareil B
- [ ] Notification dans la cloche sur Appareil B
- [ ] Statut "Acceptée" dans "Mes réservations" (Appareil B)
- [ ] Numéro du conducteur visible (Appareil B)
- [ ] Boutons "Appeler" et "WhatsApp" visibles (Appareil B)

---

## ✅ Test 3: Numéro de Téléphone (10 secondes)

**Sur Appareil B (Passager):**
1. Aller dans "Mes réservations"
2. Ouvrir la réservation acceptée
3. Vérifier le numéro du conducteur
4. Cliquer sur "Appeler"

**✅ Vérifications:**
- [ ] Le numéro affiché est correct
- [ ] L'appel se connecte au bon numéro
- [ ] Le bouton WhatsApp fonctionne

---

## ✅ Test 4: Notification Refus (20 secondes)

**Sur Appareil A (Conducteur):**
1. Créer une nouvelle réservation (répéter Test 1)
2. Cette fois, cliquer "Refuser"

**✅ Vérifications:**
- [ ] Notification push sur Appareil B
- [ ] Notification dans la cloche sur Appareil B
- [ ] Statut "Refusée" dans "Mes réservations" (Appareil B)
- [ ] Places restaurées dans le trajet (Appareil A)

---

## 🐛 Débogage Rapide

### Pas de notification push?
```bash
# Vérifier les permissions
1. Paramètres → Notifications → Yombal Yoon → Activé
2. Redémarrer l'app
3. Vérifier les logs: "✅ Push notification sent successfully"
```

### Message de confirmation ne s'affiche pas?
```bash
# Vérifier les logs
1. Console: "✅ Booking created successfully"
2. Si présent, le message devrait s'afficher
3. Vérifier Platform.OS (web vs native)
```

### Numéro incorrect?
```bash
# Vérifier la base de données
1. Supabase → Table carpool_rides
2. Colonne driver_phone
3. Doit commencer par "221" (indicatif Sénégal)
```

---

## 📊 Checklist Complète

### Notifications Conducteur
- [ ] Notification push reçue
- [ ] Notification dans la cloche
- [ ] Son de notification
- [ ] Vibration
- [ ] Badge sur l'icône de l'app

### Notifications Passager
- [ ] Notification push (acceptation)
- [ ] Notification push (refus)
- [ ] Notification dans la cloche
- [ ] Son de notification
- [ ] Vibration

### Messages de Confirmation
- [ ] Message après réservation
- [ ] Texte clair et informatif
- [ ] Option "Voir mes réservations"
- [ ] Fermeture automatique du formulaire

### Numéros de Téléphone
- [ ] Numéro masqué avant acceptation
- [ ] Numéro complet après acceptation
- [ ] Bouton "Appeler" fonctionne
- [ ] Bouton "WhatsApp" fonctionne
- [ ] Appel se connecte au bon numéro

---

## 🎯 Résultat Attendu

**Toutes les cases cochées = ✅ Système fonctionnel**

Si une case n'est pas cochée, consulter:
- `COVOITURAGE_NOTIFICATIONS_FIX_COMPLETE.md` pour les détails
- Logs de l'application
- Logs Supabase Edge Functions
- Permissions de l'appareil

---

## 📞 Support

En cas de problème persistant:
1. Vérifier les logs de l'application
2. Vérifier les logs Supabase
3. Vérifier les permissions de notification
4. Redémarrer l'application
5. Consulter la documentation complète

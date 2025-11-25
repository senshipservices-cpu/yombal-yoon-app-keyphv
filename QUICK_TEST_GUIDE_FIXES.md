
# 🧪 GUIDE DE TEST RAPIDE - CORRECTIONS CRITIQUES

## ⚡ Tests Prioritaires (15 minutes)

### ✅ Test 1: Validation formulaire "Envoi de colis"
**Durée:** 3 minutes | **Priorité:** 🔴 CRITIQUE

**Étapes:**
1. Ouvrir l'app → Module "Envoi de colis"
2. Remplir tous les champs (nom, téléphone, description)
3. Dans "Adresse de départ": taper "Golf" SANS sélectionner dans la liste
4. Dans "Adresse d'arrivée": taper "Mermoz" SANS sélectionner dans la liste
5. Appuyer sur "ENVOYER MON COLIS"

**Résultat attendu:**
- ❌ Le formulaire NE DOIT PAS être soumis
- ✅ Message d'erreur clair: "Veuillez sélectionner vos adresses dans la liste proposée pour Départ et Arrivée."
- ✅ Bordures rouges sur les champs "Adresse de départ" et "Adresse d'arrivée"

**Résultat actuel (AVANT correction):**
- ❌ Message d'erreur: "Une erreur est survenue lors de l'enregistrement du colis"

---

### ✅ Test 2: Soumission réussie "Envoi de colis"
**Durée:** 3 minutes | **Priorité:** 🔴 CRITIQUE

**Étapes:**
1. Ouvrir l'app → Module "Envoi de colis"
2. Remplir tous les champs
3. Dans "Adresse de départ": taper "Hôpital" et **SÉLECTIONNER** "Hôpital Principal de Dakar" dans la liste
4. Dans "Adresse d'arrivée": taper "Université" et **SÉLECTIONNER** "Université Cheikh Anta Diop" dans la liste
5. Appuyer sur "ENVOYER MON COLIS"

**Résultat attendu:**
- ✅ Colis enregistré avec succès
- ✅ Message de confirmation: "Demande envoyée en toute sécurité !"
- ✅ Distance et prix calculés automatiquement

---

### ✅ Test 3: Module Covoiturage (Crash fix)
**Durée:** 2 minutes | **Priorité:** 🔴 CRITIQUE

**Étapes:**
1. Ouvrir l'app → Module "Covoiturage"
2. Attendre 2 secondes

**Résultat attendu:**
- ✅ Écran s'affiche normalement
- ✅ Aucun crash
- ✅ Boutons "Publier un trajet" et "Rechercher un trajet" visibles

**Résultat actuel (AVANT correction):**
- ❌ Crash immédiat: "Too many re-renders"
- ❌ App se ferme ou affiche un écran d'erreur

---

### ✅ Test 4: Publier un trajet (Covoiturage)
**Durée:** 3 minutes | **Priorité:** 🔴 CRITIQUE

**Étapes:**
1. Ouvrir l'app → Module "Covoiturage" → "Publier un trajet"
2. Remplir le formulaire:
   - Ville de départ: taper "Dakar" et **SÉLECTIONNER** dans la liste
   - Ville d'arrivée: taper "Thiès" et **SÉLECTIONNER** dans la liste
   - Date: sélectionner une date future
   - Heure: sélectionner une heure
   - Places: 3
   - Prix: 5000
3. Appuyer sur "Publier un trajet"

**Résultat attendu:**
- ✅ Trajet publié avec succès
- ✅ Message de confirmation
- ✅ Distance et durée calculées automatiquement
- ✅ Redirection vers "Mes trajets publiés"

---

### ✅ Test 5: Autocomplétion iOS (TestFlight uniquement)
**Durée:** 4 minutes | **Priorité:** 🔴 CRITIQUE

**Plateforme:** iOS (TestFlight) uniquement

**Étapes:**
1. Ouvrir l'app sur iPhone (TestFlight)
2. Aller dans "Envoi de colis"
3. Taper "Dakar" dans "Adresse de départ"
4. Observer si des suggestions apparaissent

**Résultat attendu:**
- ✅ Liste de suggestions apparaît (Dakar, Dakar Plateau, etc.)
- ✅ Possibilité de sélectionner une suggestion

**Si aucune suggestion n'apparaît:**
1. Vérifier la connexion internet
2. Tester sur Web pour comparer
3. Consulter les logs dans Xcode Console
4. Vérifier la configuration Google Cloud Console (voir CRITICAL_FIXES_SUMMARY.md)

---

## 🔍 Tests Secondaires (10 minutes)

### Test 6: Validation formulaire "Publier un trajet"
**Durée:** 3 minutes

**Étapes:**
1. Ouvrir "Covoiturage" → "Publier un trajet"
2. Taper "Dakar" dans "Ville de départ" SANS sélectionner
3. Taper "Thiès" dans "Ville d'arrivée" SANS sélectionner
4. Remplir les autres champs
5. Appuyer sur "Publier un trajet"

**Résultat attendu:**
- ❌ Formulaire NE DOIT PAS être soumis
- ✅ Message d'erreur: "Veuillez sélectionner la ville dans la liste proposée"
- ✅ Bordures rouges sur les champs ville

---

### Test 7: Distance et prix automatiques (Envoi de colis)
**Durée:** 3 minutes

**Étapes:**
1. Ouvrir "Envoi de colis"
2. Sélectionner "Hôpital Principal de Dakar" comme départ
3. Sélectionner "Université Cheikh Anta Diop" comme arrivée
4. Observer la carte "Distance estimée" et "Prix estimé"

**Résultat attendu:**
- ✅ Distance calculée automatiquement (ex: 8.1 km)
- ✅ Prix calculé automatiquement (ex: 1670 FCFA)
- ✅ Détail de la tarification affiché:
  - Frais de base: 700 FCFA
  - Frais kilométriques: 970 FCFA
  - Total: 1670 FCFA

---

### Test 8: Distance et durée automatiques (Covoiturage)
**Durée:** 3 minutes

**Étapes:**
1. Ouvrir "Covoiturage" → "Publier un trajet"
2. Sélectionner "Dakar" comme départ
3. Sélectionner "Thiès" comme arrivée
4. Observer la carte "Distance estimée" et "Durée estimée"

**Résultat attendu:**
- ✅ Distance calculée automatiquement (ex: 70 km)
- ✅ Durée calculée automatiquement (ex: 1 h 15 min)

---

## 📊 Checklist de validation

### Envoi de colis
- [ ] Validation stricte des adresses (sélection obligatoire)
- [ ] Message d'erreur clair si adresses non sélectionnées
- [ ] Soumission réussie si adresses sélectionnées
- [ ] Distance et prix calculés automatiquement
- [ ] Autocomplétion fonctionne sur Web
- [ ] Autocomplétion fonctionne sur Android
- [ ] Autocomplétion fonctionne sur iOS (TestFlight)

### Covoiturage
- [ ] Module s'ouvre sans crash
- [ ] Validation stricte des villes (sélection obligatoire)
- [ ] Message d'erreur clair si villes non sélectionnées
- [ ] Soumission réussie si villes sélectionnées
- [ ] Distance et durée calculées automatiquement
- [ ] Autocomplétion fonctionne sur Web
- [ ] Autocomplétion fonctionne sur Android
- [ ] Autocomplétion fonctionne sur iOS (TestFlight)

### Général
- [ ] Aucun crash sur Web
- [ ] Aucun crash sur Android
- [ ] Aucun crash sur iOS (TestFlight)
- [ ] Messages d'erreur cohérents sur toutes les plateformes
- [ ] Comportement identique sur Web / Android / iOS

---

## 🆘 En cas de problème

### Problème: Autocomplétion ne fonctionne pas sur iOS
**Solution:**
1. Vérifier la connexion internet
2. Tester sur Web pour comparer
3. Consulter `CRITICAL_FIXES_SUMMARY.md` section "Autocomplétion iOS"
4. Vérifier la configuration Google Cloud Console

### Problème: Crash du module Covoiturage
**Solution:**
1. Vérifier que le fichier `contexts/CovoiturageContext.tsx` a été mis à jour
2. Redémarrer l'app complètement
3. Vider le cache de l'app
4. Consulter les logs de l'app

### Problème: Erreur "Une erreur est survenue lors de l'enregistrement du colis"
**Solution:**
1. Vérifier que les adresses ont été **sélectionnées** dans la liste (pas tapées manuellement)
2. Vérifier que le fichier `contexts/ColisContext.tsx` a été mis à jour
3. Consulter les logs Supabase

---

**Temps total estimé:** 25 minutes
**Tests critiques:** 15 minutes
**Tests secondaires:** 10 minutes

**Dernière mise à jour:** 25 Janvier 2025

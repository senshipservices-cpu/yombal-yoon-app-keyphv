
# 🧪 Guide de Test iOS TestFlight - Module Livraison 14 Régions

## 📱 Préparation

### Avant de Commencer

1. **Installer la dernière version depuis TestFlight**
   - Ouvrir TestFlight sur iPhone
   - Vérifier qu'une nouvelle version est disponible
   - Installer la mise à jour

2. **Activer les logs (optionnel mais recommandé)**
   - Connecter l'iPhone à un Mac
   - Ouvrir Xcode
   - Window > Devices and Simulators
   - Sélectionner votre iPhone
   - Cliquer sur "Open Console"

3. **Préparer les données de test**
   - Nom expéditeur: "Amadou Diop"
   - Téléphone expéditeur: "77 123 45 67"
   - Nom destinataire: "Fatou Sall"
   - Téléphone destinataire: "76 987 65 43"

## ✅ Test 1: Recherche Simple (2 minutes)

### Objectif
Vérifier que l'autocomplétion affiche des suggestions quand on tape.

### Étapes

1. Ouvrir l'app Yombal Yoon
2. Aller dans l'onglet **"Livraison 14 régions"** (icône éclair ⚡)
3. Remplir rapidement:
   - Nom expéditeur: "Amadou Diop"
   - Téléphone: "77 123 45 67"
   - Nom destinataire: "Fatou Sall"
   - Téléphone: "76 987 65 43"
4. **Taper "thi" dans le champ "Destination"**

### ✅ Résultat Attendu

Une liste de suggestions doit apparaître **immédiatement** avec:

```
┌─────────────────────────────────────────┐
│         2 résultats trouvés             │
├─────────────────────────────────────────┤
│ 🗺️ Thiès                                │
│    Région                         3500 F│
├─────────────────────────────────────────┤
│ 📍 Thiès                                │
│    Département - Thiès            3500 F│
└─────────────────────────────────────────┘
```

### ❌ Si ça ne fonctionne pas

- Vérifier que vous avez bien installé la dernière version
- Vérifier que vous êtes dans le bon module (Livraison 14 régions, PAS Covoiturage)
- Redémarrer l'app
- Vérifier les logs Xcode si disponibles

## ✅ Test 2: Sélection d'une Suggestion (1 minute)

### Objectif
Vérifier que taper sur une suggestion remplit le champ et affiche la tarification.

### Étapes

1. Continuer depuis le Test 1
2. **Taper sur "🗺️ Thiès (Région)"**

### ✅ Résultat Attendu

1. Le champ "Destination" est rempli avec "Thiès"
2. Les suggestions disparaissent
3. Le clavier se ferme
4. Une carte "Tarification" apparaît en dessous:

```
┌─────────────────────────────────────────┐
│ Tarification                            │
├─────────────────────────────────────────┤
│ Frais de base              1 000 FCFA   │
│ Frais destination (Thiès)  3 500 FCFA   │
├─────────────────────────────────────────┤
│ Total                      4 500 FCFA   │
└─────────────────────────────────────────┘
```

### ❌ Si ça ne fonctionne pas

- Les suggestions disparaissent avant que vous puissiez taper? → Problème de timing, signaler
- Le champ ne se remplit pas? → Problème de sélection, signaler
- Pas de tarification? → Problème de calcul, signaler

## ✅ Test 3: Recherche de Département (2 minutes)

### Objectif
Vérifier que la recherche fonctionne aussi pour les départements.

### Étapes

1. Effacer le champ "Destination" (bouton ❌ à droite)
2. **Taper "dag"**

### ✅ Résultat Attendu

Une liste de suggestions avec:

```
┌─────────────────────────────────────────┐
│         2 résultats trouvés             │
├─────────────────────────────────────────┤
│ 🗺️ Dakar                                │
│    Région                         2000 F│
├─────────────────────────────────────────┤
│ 📍 Dagana                               │
│    Département - Saint-Louis      6000 F│
└─────────────────────────────────────────┘
```

3. **Taper sur "📍 Dagana"**

### ✅ Résultat Attendu

- Champ rempli avec "Dagana"
- Tarification: 1000 + 6000 = **7000 FCFA**

## ✅ Test 4: Recherche Sans Résultat (1 minute)

### Objectif
Vérifier que le message "Aucun résultat" s'affiche correctement.

### Étapes

1. Effacer le champ "Destination"
2. **Taper "xyz"**

### ✅ Résultat Attendu

Un message s'affiche:

```
┌─────────────────────────────────────────┐
│ 🔍 Aucune région ou département trouvé  │
│    pour "xyz"                           │
└─────────────────────────────────────────┘
```

## ✅ Test 5: Recherche de Touba (1 minute)

### Objectif
Vérifier que les destinations spéciales fonctionnent.

### Étapes

1. Effacer le champ "Destination"
2. **Taper "touba"**

### ✅ Résultat Attendu

```
┌─────────────────────────────────────────┐
│         1 résultat trouvé               │
├─────────────────────────────────────────┤
│ 🕌 Touba                                │
│    Ville - Diourbel               4500 F│
└─────────────────────────────────────────┘
```

3. **Taper sur "🕌 Touba"**

### ✅ Résultat Attendu

- Champ rempli avec "Touba"
- Tarification: 1000 + 4500 = **5500 FCFA**

## ✅ Test 6: Scroll dans les Suggestions (1 minute)

### Objectif
Vérifier que le scroll fonctionne quand il y a beaucoup de résultats.

### Étapes

1. Effacer le champ "Destination"
2. **Taper "a"** (une seule lettre)

### ✅ Résultat Attendu

- Plusieurs résultats s'affichent (Dakar, Dagana, Matam, etc.)
- **Essayer de scroller dans la liste**
- Le scroll doit fonctionner sans fermer les suggestions

## ✅ Test 7: Soumission Complète (3 minutes)

### Objectif
Vérifier que tout le processus fonctionne de bout en bout.

### Étapes

1. Remplir le formulaire complet:
   - Nom expéditeur: "Amadou Diop"
   - Téléphone expéditeur: "77 123 45 67"
   - Nom destinataire: "Fatou Sall"
   - Téléphone destinataire: "76 987 65 43"
   - Destination: Rechercher et sélectionner "Thiès"
   - Description: "Colis urgent - Documents"

2. Vérifier la tarification:
   - Frais de base: 1 000 FCFA
   - Frais destination: 3 500 FCFA
   - Total: 4 500 FCFA

3. **Cliquer sur le bouton "COMMANDER"**

### ✅ Résultat Attendu

1. Message de succès s'affiche:
   ```
   ✅ Demande enregistrée
   
   Votre demande de livraison vers la région a été 
   enregistrée. L'équipe Yombal Yoon vous contactera 
   pour la prise en charge.
   ```

2. Le formulaire est réinitialisé (tous les champs vides)

3. Un message de succès vert apparaît en haut du formulaire

## ✅ Test 8: Mode Sombre (2 minutes)

### Objectif
Vérifier que l'autocomplétion fonctionne aussi en mode sombre.

### Étapes

1. Activer le mode sombre sur iPhone:
   - Réglages > Luminosité et affichage > Sombre
   - Ou utiliser le Centre de contrôle

2. Retourner dans l'app Yombal Yoon

3. Répéter le Test 1 (recherche "thi")

### ✅ Résultat Attendu

- Les suggestions s'affichent avec des couleurs adaptées au mode sombre
- Le texte est lisible (blanc sur fond sombre)
- Les icônes sont visibles
- Pas de problème de contraste

## 📊 Tableau de Résultats

Cocher ✅ ou ❌ pour chaque test:

| Test | Description | Résultat | Notes |
|------|-------------|----------|-------|
| 1 | Recherche simple "thi" | ⬜ | |
| 2 | Sélection suggestion | ⬜ | |
| 3 | Recherche département "dag" | ⬜ | |
| 4 | Recherche sans résultat "xyz" | ⬜ | |
| 5 | Recherche Touba | ⬜ | |
| 6 | Scroll dans suggestions | ⬜ | |
| 7 | Soumission complète | ⬜ | |
| 8 | Mode sombre | ⬜ | |

## 🐛 Rapport de Bug

Si un test échoue, noter:

### Informations Système
- **Modèle iPhone**: (ex: iPhone 14 Pro)
- **Version iOS**: (ex: iOS 17.2)
- **Version App**: (visible dans TestFlight)

### Description du Problème
- **Test échoué**: (numéro du test)
- **Comportement observé**: (ce qui s'est passé)
- **Comportement attendu**: (ce qui aurait dû se passer)

### Logs (si disponibles)
```
Copier-coller les logs Xcode ici
```

### Captures d'Écran
Prendre des captures d'écran du problème.

## ✅ Critères de Succès

L'autocomplétion est considérée comme **fonctionnelle** si:

- ✅ Les 8 tests passent avec succès
- ✅ Aucun crash de l'app
- ✅ Aucun freeze de l'interface
- ✅ Les suggestions s'affichent en moins de 100ms
- ✅ Les taps sont enregistrés du premier coup
- ✅ Le clavier se comporte correctement

## 🎯 Tests Rapides (5 minutes)

Si vous n'avez que 5 minutes, faites ces tests essentiels:

1. ✅ **Test 1**: Recherche "thi" → Suggestions s'affichent?
2. ✅ **Test 2**: Taper sur suggestion → Champ rempli?
3. ✅ **Test 7**: Soumettre formulaire → Succès?

Si ces 3 tests passent, l'autocomplétion fonctionne! 🎉

## 📞 Contact

En cas de problème:

1. **Prendre des captures d'écran**
2. **Noter les logs Xcode** (si disponibles)
3. **Remplir le rapport de bug** ci-dessus
4. **Contacter l'équipe technique**

---

**Durée totale des tests**: 15-20 minutes
**Niveau de difficulté**: Facile
**Prérequis**: iPhone avec TestFlight installé

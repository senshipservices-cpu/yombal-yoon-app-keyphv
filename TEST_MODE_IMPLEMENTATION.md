
# Test Mode Implementation - Commission à 0%

## 📋 Vue d'ensemble

Pendant la phase de test, les conducteurs (covoiturage) et livreurs (colis) peuvent travailler **sans qu'aucune commission ne soit prélevée**, tout en gardant le wallet fonctionnel.

## ✅ Modifications effectuées

### 1. Configuration du mode test (`config/testMode.ts`)

Un nouveau fichier de configuration a été créé avec :

- **`IS_TEST_MODE`** : Variable globale pour activer/désactiver le mode test
  - `true` = Phase test (0% de commission)
  - `false` = Mode production (commissions normales)

- **`COMMISSION_RATES`** : Taux de commission pour la production
  - Covoiturage : 12%
  - Colis : 15%

- **`getCommissionRate(type)`** : Fonction qui retourne 0 en mode test, sinon le taux normal

- **`calculateCommissionAmounts(prixTotal, type)`** : Calcule les montants avec commission à 0 en mode test

- **`getCommissionDisplayText(type)`** : Retourne le texte d'affichage approprié
  - Mode test : "Commission Yombal Yoon (Phase test)"
  - Production : "Commission Yombal Yoon (12%)" ou "(15%)"

### 2. Mise à jour de `utils/walletUtils.ts`

- Import de `IS_TEST_MODE` depuis la configuration
- **`calculateAmounts()`** : Utilise `IS_TEST_MODE` pour calculer la commission
  - Mode test : `commissionRate = 0`
  - Production : `commissionRate = COMMISSION_RATE`

- **`blockCommission()`** : Skip le blocage de commission en mode test
  ```typescript
  if (IS_TEST_MODE) {
    console.log('TEST MODE: Skipping commission blocking');
    return { success: true, error: null };
  }
  ```

- **`debitCommission()`** : Skip le prélèvement de commission en mode test
  ```typescript
  if (IS_TEST_MODE) {
    console.log('TEST MODE: Skipping commission deduction');
    return { success: true, error: null };
  }
  ```

### 3. Écrans de paiement mis à jour

#### **Covoiturage** (`app/covoiturage/end-trip-payment.tsx`)

- Import de `IS_TEST_MODE` et `getCommissionDisplayText`
- Affichage dynamique du texte de commission
- Couleur verte pour la commission en mode test (au lieu de rouge)
- Message d'information adapté :
  - Mode test : "🎉 Mode test activé : Vous recevrez 100% du montant sans commission !"
  - Production : Message normal sur le prélèvement

#### **Livraison de colis** (`app/colis/delivery-complete-payment.tsx`)

- Import de `IS_TEST_MODE`, `getCommissionRate`, et `getCommissionDisplayText`
- Utilisation de `getCommissionRate('colis')` pour calculer la commission
- Affichage dynamique identique au covoiturage
- Message d'information adapté au mode test

### 4. Contexte Covoiturage (`contexts/CovoiturageContext.tsx`)

- Utilise déjà `calculateAmounts()` de `walletUtils`
- Aucune modification nécessaire car la logique est centralisée
- Le mode test est automatiquement respecté

## 🎯 Résultats en mode test

### Pour les conducteurs/livreurs :

1. **Commission = 0 FCFA**
   - `commissionRate = 0`
   - `commissionYombal = 0`
   - `prixPrestataire = prixTotal` (100% du montant)

2. **Wallet crédité correctement**
   - Le gain complet est crédité
   - Aucun débit de commission n'est effectué

3. **Affichage clair**
   - "Commission Yombal Yoon (Phase test) : 0 FCFA"
   - Message explicite : "🎉 Mode test activé : Vous recevrez 100% du montant sans commission !"
   - Couleur verte pour indiquer le mode test

### Historique des transactions :

- Transaction de **gain** : Montant complet
- **Pas de transaction de commission** en mode test

## 🔄 Passage en production

Pour activer les commissions en production, il suffit de modifier **une seule ligne** dans `config/testMode.ts` :

```typescript
export const IS_TEST_MODE = false; // Passer à false pour la production
```

Toute l'architecture (wallet, historique, calculs) reste prête pour la production.

## 📊 Exemples de calculs

### Mode Test (IS_TEST_MODE = true)

**Covoiturage - Prix total : 10 000 FCFA**
- Commission Yombal : 0 FCFA (0%)
- Montant conducteur : 10 000 FCFA (100%)

**Livraison - Prix total : 5 000 FCFA**
- Commission Yombal : 0 FCFA (0%)
- Montant livreur : 5 000 FCFA (100%)

### Mode Production (IS_TEST_MODE = false)

**Covoiturage - Prix total : 10 000 FCFA**
- Commission Yombal : 1 200 FCFA (12%)
- Montant conducteur : 8 800 FCFA (88%)

**Livraison - Prix total : 5 000 FCFA**
- Commission Yombal : 750 FCFA (15%)
- Montant livreur : 4 250 FCFA (85%)

## 🔍 Vérification

Pour vérifier que le mode test est actif :

1. Ouvrir `config/testMode.ts`
2. Vérifier que `IS_TEST_MODE = true`
3. Dans les écrans de paiement, vous devriez voir :
   - "Commission Yombal Yoon (Phase test)"
   - Montant de commission : 0 FCFA
   - Message : "🎉 Mode test activé..."
   - Couleur verte pour la commission

## 📝 Notes importantes

- Le mode test est **global** et affecte tous les services (covoiturage + colis)
- Les données du wallet restent cohérentes en mode test
- Aucune modification de la base de données n'est nécessaire
- Le passage en production est instantané (changement d'une variable)
- Les logs console indiquent clairement quand le mode test est actif

## 🚀 Prochaines étapes

Avant le passage en production :

1. Tester complètement le système en mode test
2. Vérifier que tous les calculs sont corrects
3. S'assurer que le wallet fonctionne correctement
4. Valider l'expérience utilisateur
5. Passer `IS_TEST_MODE` à `false` dans `config/testMode.ts`
6. Tester à nouveau en mode production avant le lancement

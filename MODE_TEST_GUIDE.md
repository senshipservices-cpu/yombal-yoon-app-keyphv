
# Guide Rapide - Mode Test / Production

## 🎯 Activation / Désactivation du Mode Test

### Fichier à modifier : `config/testMode.ts`

```typescript
// PHASE TEST - Aucune commission prélevée
export const IS_TEST_MODE = true;

// PRODUCTION - Commissions normales (12% covoiturage, 15% colis)
export const IS_TEST_MODE = false;
```

## 📊 Comparaison des modes

| Aspect | Mode Test (true) | Mode Production (false) |
|--------|------------------|-------------------------|
| **Commission covoiturage** | 0% | 12% |
| **Commission colis** | 0% | 15% |
| **Montant conducteur/livreur** | 100% du prix | Prix - commission |
| **Débit wallet** | Non | Oui |
| **Blocage commission** | Non | Oui |
| **Affichage** | "Phase test" | Pourcentage normal |
| **Couleur commission** | Vert | Orange/Rouge |
| **Message info** | "Mode test activé..." | Message normal |

## ✅ Checklist avant passage en production

- [ ] Tous les tests en mode test sont réussis
- [ ] Le wallet fonctionne correctement
- [ ] Les calculs de commission sont vérifiés
- [ ] L'expérience utilisateur est validée
- [ ] Les notifications fonctionnent
- [ ] Les paiements sont testés
- [ ] La documentation est à jour
- [ ] L'équipe est informée du changement
- [ ] Un backup de la base de données est fait
- [ ] Le monitoring est en place

## 🔄 Procédure de passage en production

1. **Ouvrir** `config/testMode.ts`
2. **Modifier** la ligne :
   ```typescript
   export const IS_TEST_MODE = false;
   ```
3. **Sauvegarder** le fichier
4. **Redémarrer** l'application
5. **Vérifier** que les commissions s'affichent correctement
6. **Tester** un paiement complet
7. **Confirmer** que le wallet est débité

## 🎨 Indicateurs visuels

### Mode Test
- 🟢 Texte : "Commission Yombal Yoon (Phase test)"
- 🟢 Montant : 0 FCFA (en vert)
- 🟢 Message : "🎉 Mode test activé : Vous recevrez 100% du montant sans commission !"

### Mode Production
- 🟠 Texte : "Commission Yombal Yoon (12%)" ou "(15%)"
- 🟠 Montant : Calculé selon le taux (en orange/rouge)
- 🔵 Message : "Après confirmation, votre wallet sera crédité du montant net..."

## 📱 Exemple de test rapide

### Test en mode test :
1. Publier un trajet à 10 000 FCFA
2. Terminer le trajet
3. Vérifier : Wallet crédité de **10 000 FCFA** (100%)
4. Vérifier : Aucune transaction de commission

### Test en mode production :
1. Publier un trajet à 10 000 FCFA
2. Terminer le trajet
3. Vérifier : Wallet crédité de **8 800 FCFA** (88%)
4. Vérifier : Transaction de commission de **1 200 FCFA** (12%)

## 🐛 Dépannage

### La commission est toujours à 0 en production
- Vérifier que `IS_TEST_MODE = false` dans `config/testMode.ts`
- Redémarrer complètement l'application
- Vider le cache si nécessaire

### Les montants ne correspondent pas
- Vérifier les taux dans `COMMISSION_RATES`
- Covoiturage : 0.12 (12%)
- Colis : 0.15 (15%)

### Le wallet n'est pas débité
- Vérifier que `IS_TEST_MODE = false`
- Vérifier les logs console pour "TEST MODE: Skipping..."
- Si les logs apparaissent, le mode test est encore actif

## 📞 Support

En cas de problème :
1. Vérifier les logs console
2. Vérifier le fichier `config/testMode.ts`
3. Vérifier que l'application a été redémarrée
4. Consulter `TEST_MODE_IMPLEMENTATION.md` pour plus de détails

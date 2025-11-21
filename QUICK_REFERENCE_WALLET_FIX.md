
# 🚀 Quick Reference : Wallet Loading Fix

## 📌 Résumé en 30 Secondes

**Problème :** "Impossible de charger votre wallet"

**Solution :** Création automatique du profil et wallet + retry logic + RLS policies corrigées

**Statut :** ✅ CORRIGÉ

---

## 🔑 Fonctions Clés

### 1. `ensureProfileAndWallet(userId, userData?, retryCount?)`
**Où :** `utils/profileWalletUtils.ts`
**Fait quoi :** Garantit que profil et wallet existent, les crée si nécessaire
**Appelée par :** `ProfileContext.initializeUser()`, `loadWalletForProfil()`

### 2. `loadWalletForProfil(userId, retryCount?)`
**Où :** `utils/profileWalletUtils.ts`
**Fait quoi :** Charge le wallet pour la page Profil, crée si inexistant
**Appelée par :** `profile.tsx.loadWallet()`

### 3. `loadWallet()`
**Où :** `app/(tabs)/profile.tsx`
**Fait quoi :** Gère l'UI (loader, erreur, affichage) et appelle `loadWalletForProfil()`

---

## 🎯 Flux de Chargement

```
1. App démarre
   ↓
2. ProfileContext.initializeUser()
   ↓
3. ensureProfileAndWallet(userId)
   ↓
4. Profil créé (si nécessaire)
   ↓
5. Wallet créé (si nécessaire)
   ↓
6. Utilisateur navigue vers "Profil"
   ↓
7. profile.tsx.loadWallet()
   ↓
8. loadWalletForProfil(userId)
   ↓
9. Wallet affiché dans l'UI
```

---

## 🐛 Debugging Rapide

### Wallet ne se charge pas ?

1. **Vérifier les logs console**
   ```
   Chercher : 🔄 loadWalletForProfil called
   Puis : ✅ ou ❌
   ```

2. **Vérifier Supabase**
   ```sql
   -- Profil existe ?
   SELECT * FROM user_profiles WHERE id = 'user_xxxxx';
   
   -- Wallet existe ?
   SELECT * FROM wallets WHERE user_id = 'user_xxxxx';
   
   -- RLS OK ?
   SELECT * FROM pg_policies WHERE tablename = 'wallets';
   ```

3. **Forcer recréation**
   - Désinstaller l'app
   - Supprimer profil et wallet dans Supabase
   - Réinstaller → tout se recrée automatiquement

---

## ✅ Checklist Rapide

- [ ] RLS policies : 3 policies (select, insert, update) avec `USING (true)`
- [ ] `ensureProfileAndWallet()` appelée au démarrage
- [ ] `loadWalletForProfil()` appelée dans profile.tsx
- [ ] Loader affiché pendant chargement
- [ ] Message d'erreur + bouton "Réessayer" si échec
- [ ] Wallet affiché avec solde si succès

---

## 📱 Test Rapide

1. Désinstaller l'app
2. Réinstaller
3. Ouvrir l'app
4. Aller sur "Profil"
5. ✅ Wallet doit s'afficher avec solde 0 FCFA

**Si ça marche : tout est OK ! 🎉**

---

## 🆘 Support

**Logs à vérifier :**
- `🔄 ensureProfileAndWallet called`
- `✅ Profile created successfully` ou `✅ Profile already exists`
- `✅ Wallet created successfully` ou `✅ Wallet already exists`
- `✅ Step 4: Wallet section reloaded with data`

**Erreurs possibles :**
- `USER_NOT_AUTH` → userId manquant
- `WALLET_LOAD_ERROR` → Problème Supabase ou réseau
- `Profile ID not yet available` → iOS timing (normal, se résout automatiquement)

---

## 📚 Documentation Complète

- `WALLET_LOADING_FIX_COMPLETE.md` : Explication détaillée
- `WALLET_LOADING_TEST_GUIDE.md` : Guide de test complet
- `WALLET_FIX_SUMMARY.md` : Résumé des changements
- `QUICK_REFERENCE_WALLET_FIX.md` : Ce document (référence rapide)

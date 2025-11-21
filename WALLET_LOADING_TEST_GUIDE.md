
# 🧪 Guide de Test : Correction Wallet Loading

## 📋 Scénarios de Test

### ✅ Test 1 : Nouvel Utilisateur (Premier Lancement)

**Étapes :**
1. Désinstaller l'app complètement
2. Réinstaller et lancer l'app
3. Naviguer vers l'onglet "Profil"

**Résultat Attendu :**
- ✅ Loader affiché brièvement ("Chargement du wallet...")
- ✅ Carte wallet affichée avec solde 0 FCFA
- ✅ Aucun message d'erreur
- ✅ Logs console montrent :
  ```
  🔄 ensureProfileAndWallet called for user: user_xxxxx
  📝 Profile not found, creating automatically...
  ✅ Profile created successfully
  💰 Wallet not found, creating automatically...
  ✅ Wallet created successfully
  ✅ Step 4: Wallet section reloaded with data
  ```

---

### ✅ Test 2 : Utilisateur Existant avec Wallet

**Étapes :**
1. Lancer l'app (utilisateur déjà créé)
2. Naviguer vers l'onglet "Profil"

**Résultat Attendu :**
- ✅ Chargement rapide (< 1 seconde)
- ✅ Carte wallet affichée avec le solde actuel
- ✅ Logs console montrent :
  ```
  🔄 loadWalletForProfil called for user: user_xxxxx
  ✅ Profile already exists
  ✅ Wallet already exists
  ✅ Step 4: Wallet section reloaded with data
  ```

---

### ✅ Test 3 : Simulation Erreur Réseau

**Étapes :**
1. Activer le mode avion
2. Lancer l'app
3. Naviguer vers l'onglet "Profil"
4. Observer le message d'erreur
5. Désactiver le mode avion
6. Appuyer sur "Réessayer"

**Résultat Attendu :**
- ✅ Message d'erreur affiché : "Impossible de charger votre wallet pour le moment..."
- ✅ Bouton "Réessayer" visible
- ✅ Après désactivation mode avion et clic sur "Réessayer" : wallet se charge correctement
- ✅ Logs console montrent les tentatives de retry

---

### ✅ Test 4 : iOS - Timing Issue

**Étapes :**
1. Lancer l'app sur iOS
2. Naviguer rapidement vers "Profil" (< 1 seconde après lancement)

**Résultat Attendu :**
- ✅ Loader affiché : "Chargement du profil..."
- ✅ Puis loader : "Chargement du wallet..."
- ✅ Wallet affiché correctement après chargement
- ✅ Aucun message d'erreur "Profil non disponible"

---

### ✅ Test 5 : Utilisateur avec Solde Négatif

**Étapes :**
1. Modifier manuellement le solde dans Supabase pour le mettre négatif
2. Rafraîchir l'app
3. Naviguer vers "Profil"

**Résultat Attendu :**
- ✅ Carte wallet affichée avec fond rouge
- ✅ Message d'avertissement : "⚠️ Vous devez X FCFA à Yombal Yoon..."
- ✅ Solde affiché en négatif

---

### ✅ Test 6 : Utilisateur avec Solde Bloqué

**Étapes :**
1. Modifier manuellement `solde_bloque` dans Supabase
2. Rafraîchir l'app
3. Naviguer vers "Profil"

**Résultat Attendu :**
- ✅ Carte wallet affichée normalement
- ✅ Message supplémentaire : "Montant en attente : X FCFA (retraits ou courses en cours)"

---

## 🔍 Vérifications dans Supabase

### Vérifier les Politiques RLS

```sql
SELECT * FROM pg_policies WHERE tablename = 'wallets';
```

**Résultat Attendu :**
- ✅ 3 politiques : `select_wallets`, `insert_wallets`, `update_wallets`
- ✅ Toutes avec `USING (true)` ou `WITH CHECK (true)`

### Vérifier les Wallets Créés

```sql
SELECT id, user_id, solde, solde_bloque, total_gagne, total_commissions, created_at 
FROM wallets 
ORDER BY created_at DESC 
LIMIT 10;
```

**Résultat Attendu :**
- ✅ Un wallet par utilisateur
- ✅ `user_id` correspond à l'ID du profil
- ✅ Valeurs par défaut : `solde: 0`, `solde_bloque: 0`, etc.

### Vérifier les Profils

```sql
SELECT id, phone_number, full_name, is_phone_verified, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

**Résultat Attendu :**
- ✅ Un profil par utilisateur
- ✅ `id` correspond au `user_id` du wallet

---

## 📱 Tests par Plateforme

### iOS
- ✅ Test 1 : Nouvel utilisateur
- ✅ Test 2 : Utilisateur existant
- ✅ Test 4 : Timing issue spécifique iOS

### Android
- ✅ Test 1 : Nouvel utilisateur
- ✅ Test 2 : Utilisateur existant
- ✅ Test 3 : Erreur réseau

### Web
- ✅ Test 1 : Nouvel utilisateur
- ✅ Test 2 : Utilisateur existant
- ✅ Test 3 : Erreur réseau

---

## 🐛 Debugging

### Si le wallet ne se charge toujours pas :

1. **Vérifier les logs console**
   - Chercher les emojis : 🔄, ✅, ❌
   - Identifier l'étape qui échoue

2. **Vérifier Supabase**
   - Profil existe ? `SELECT * FROM user_profiles WHERE id = 'user_xxxxx'`
   - Wallet existe ? `SELECT * FROM wallets WHERE user_id = 'user_xxxxx'`
   - RLS activé ? `SELECT * FROM pg_policies WHERE tablename = 'wallets'`

3. **Vérifier AsyncStorage**
   - User ID stocké ? Chercher `@yombal_yoon_user_id` dans les logs
   - Profil stocké ? Chercher `@yombal_yoon_profile` dans les logs

4. **Forcer la recréation**
   - Supprimer le profil et wallet dans Supabase
   - Vider AsyncStorage (désinstaller/réinstaller l'app)
   - Relancer l'app → devrait tout recréer automatiquement

---

## ✅ Checklist de Validation Finale

- [ ] Test 1 réussi (Nouvel utilisateur)
- [ ] Test 2 réussi (Utilisateur existant)
- [ ] Test 3 réussi (Erreur réseau + retry)
- [ ] Test 4 réussi (iOS timing)
- [ ] Test 5 réussi (Solde négatif)
- [ ] Test 6 réussi (Solde bloqué)
- [ ] Aucun message "Impossible de charger votre wallet" sans raison valide
- [ ] Bouton "Réessayer" fonctionne toujours
- [ ] Logs console clairs et détaillés
- [ ] RLS policies correctement configurées dans Supabase

**Si tous les tests passent : ✅ La correction est validée !**


# 🚀 Référence Rapide - Configuration Actuelle

## 📋 Statut Actuel

```
┌─────────────────────────────────────────────────────────────┐
│                    YOMBAL YOON                               │
│              Configuration Actuelle (2025)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Twilio : ACTIF (WhatsApp + SMS)                         │
│  ✅ IS_PRODUCTION_MODE : true (Numéros uniques)             │
│  ✅ IS_TEST_MODE : true (Commissions à 0 FCFA)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Configuration en 3 Points

### 1. OTP / Vérification Téléphone
- **Méthode :** Twilio (Recommandé pour Expo) ✅
- **Mode :** Production (`IS_PRODUCTION_MODE = true`)
- **Comportement :** Numéros uniques, pas de réutilisation

### 2. Commissions
- **Mode :** Test (`IS_TEST_MODE = true`)
- **Taux :** 0% pour covoiturage et colis
- **Prestataires :** Reçoivent 100% du montant

### 3. Supabase
- **Variable à vérifier :** `IS_PRODUCTION_MODE = true`
- **Edge Function :** `send-otp-twilio` (v27)

---

## 📂 Fichiers Modifiés

| Fichier | Valeur | Statut |
|---------|--------|--------|
| `config/productionMode.ts` | `IS_PRODUCTION_MODE = true` | ✅ |
| `config/testMode.ts` | `IS_TEST_MODE = true` | ✅ |
| `supabase/functions/send-otp-twilio/index.ts` | Lit env var | ✅ |

---

## ⚡ Commandes Rapides

### Vérifier Supabase
```bash
supabase secrets list
```

### Définir le Mode Production
```bash
supabase secrets set IS_PRODUCTION_MODE=true
```

### Redéployer Edge Function
```bash
supabase functions deploy send-otp-twilio
```

### Voir les Logs
```bash
supabase functions logs send-otp-twilio --follow
```

---

## 🧪 Tests Rapides

### Test OTP (2 min)
1. Enregistrer : +221XXXXXXXXX
2. Recevoir OTP via WhatsApp
3. Vérifier le code ✅
4. Essayer de réutiliser → ❌ "Numéro déjà utilisé"

### Test Commission (2 min)
1. Publier trajet : 10 000 FCFA
2. Terminer le trajet
3. Wallet : +10 000 FCFA (100%) ✅
4. Affichage : "0 FCFA (Phase test)" ✅

---

## 🔄 Basculer vers Production Complète

Quand vous serez prêt à activer les commissions :

```typescript
// config/testMode.ts
export const IS_TEST_MODE = false; // Activer commissions
```

Puis redémarrer l'app.

**Résultat :**
- Covoiturage : 12% de commission
- Colis : 15% de commission

---

## 📞 Support Rapide

| Problème | Solution |
|----------|----------|
| OTP non reçu | Vérifier credentials Twilio |
| Numéro réutilisable | Vérifier `IS_PRODUCTION_MODE=true` |
| Commission ≠ 0 | Vérifier `IS_TEST_MODE=true` |
| Logs "Mode: Test" | Définir secret Supabase + redéployer |

---

## 📚 Documentation Complète

- **Configuration détaillée :** `CONFIGURATION_COMPLETE_TWILIO_PRODUCTION.md`
- **Action Supabase :** `ACTION_VERIFY_SUPABASE_PRODUCTION_MODE.md`
- **Résumé :** `RESUME_CONFIGURATION_FINALE_TWILIO.md`

---

## ✅ Checklist 1 Minute

- [x] Twilio configuré
- [x] IS_PRODUCTION_MODE = true (code)
- [x] IS_TEST_MODE = true (code)
- [ ] IS_PRODUCTION_MODE = true (Supabase) ← **À vérifier**
- [ ] Tests OTP réussis
- [ ] Tests commissions à 0% réussis

---

**Configuration :** Production OTP + Test Commissions (Recommandé pour Beta)
**Prochaine étape :** Vérifier variable Supabase → Tester → Déployer ! 🚀

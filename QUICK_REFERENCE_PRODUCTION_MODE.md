
# Carte de Référence Rapide - Mode Production

## 🎯 Objectif

Permettre la réutilisation des numéros de téléphone pendant les tests.

## ⚡ Configuration Rapide

### 1. Variable Supabase (OBLIGATOIRE)

```bash
# Mode Test (réutilisation des numéros)
supabase secrets set IS_PRODUCTION_MODE=false

# Mode Production (numéros uniques)
supabase secrets set IS_PRODUCTION_MODE=true
```

### 2. Fichiers de Configuration

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = false; // Test = false, Production = true

// config/testMode.ts
export const IS_TEST_MODE = true; // Test = true, Production = false
```

## 📊 Modes Disponibles

| Mode | OTP | Commissions | Usage |
|------|-----|-------------|-------|
| **Développement** | Test (false) | Test (true) | Tests quotidiens |
| **Beta** | Prod (true) | Test (true) | Tests utilisateurs |
| **Production** | Prod (true) | Prod (false) | Déploiement final |

## ✅ Vérification Rapide

### Vérifier le Mode Actuel

```bash
# Voir les secrets Supabase
supabase secrets list

# Voir les logs en temps réel
supabase functions logs send-otp-twilio --follow
```

### Dans les Logs

**Mode Test :**
```
📥 Request: { action: 'send', phoneNumber: '+221XXX', mode: 'Test' }
Code envoyé par WhatsApp (Mode Test)
```

**Mode Production :**
```
📥 Request: { action: 'send', phoneNumber: '+221XXX', mode: 'Production' }
Code envoyé par WhatsApp
```

## 🔧 Commandes Utiles

```bash
# Configurer le mode Test
supabase secrets set IS_PRODUCTION_MODE=false

# Configurer le mode Production
supabase secrets set IS_PRODUCTION_MODE=true

# Redéployer l'Edge Function
supabase functions deploy send-otp-twilio

# Voir les logs
supabase functions logs send-otp-twilio --follow

# Lister les secrets
supabase secrets list
```

## 🐛 Dépannage Express

### Problème : "Numéro déjà utilisé"

**Solution :**
1. Vérifier : `IS_PRODUCTION_MODE=false` dans Supabase
2. Redéployer : `supabase functions deploy send-otp-twilio`
3. Attendre 10 secondes
4. Réessayer

### Problème : Mode ne change pas

**Solution :**
1. Configurer la variable : `supabase secrets set IS_PRODUCTION_MODE=false`
2. Redéployer : `supabase functions deploy send-otp-twilio`
3. Vérifier les logs : `supabase functions logs send-otp-twilio --follow`

### Problème : OTP non reçu

**Solution :**
1. Vérifier les credentials Twilio dans Supabase
2. Essayer SMS au lieu de WhatsApp
3. Vérifier les logs Twilio

## 📋 Checklist Déploiement

### Avant Production

- [ ] `IS_PRODUCTION_MODE = true` dans `config/productionMode.ts`
- [ ] `IS_TEST_MODE = false` dans `config/testMode.ts`
- [ ] `IS_PRODUCTION_MODE=true` dans Supabase
- [ ] Edge Function redéployée
- [ ] Test avec numéro réel réussi
- [ ] Logs confirment "Mode: Production"
- [ ] Commissions actives vérifiées

## 🎨 Résumé Visuel

```
┌─────────────────────────────────────────┐
│         MODE TEST (Actuel)              │
├─────────────────────────────────────────┤
│ IS_PRODUCTION_MODE = false              │
│ IS_TEST_MODE = true                     │
│                                         │
│ ✅ Réutilisation numéros                │
│ ✅ Commissions à 0%                     │
│ ✅ Messages "(Mode Test)"               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         MODE PRODUCTION                 │
├─────────────────────────────────────────┤
│ IS_PRODUCTION_MODE = true               │
│ IS_TEST_MODE = false                    │
│                                         │
│ 🔒 Numéros uniques                      │
│ 💰 Commissions actives                  │
│ 📱 Messages standard                    │
└─────────────────────────────────────────┘
```

## 📚 Documentation Complète

- **Guide détaillé :** `PRODUCTION_MODE_GUIDE.md`
- **Configuration :** `CONFIGURATION_MODES.md`
- **Démarrage rapide :** `QUICK_START_PRODUCTION.md`
- **Résumé :** `PRODUCTION_MODE_CHANGES.md`

## 🚀 Action Immédiate

**Pour commencer à tester maintenant :**

```bash
# 1. Configurer Supabase
supabase secrets set IS_PRODUCTION_MODE=false

# 2. C'est tout ! Testez l'application
```

---

**Version Edge Function :** 19 ✅
**Statut :** Prêt pour les tests


# Guide de Configuration des Modes de l'Application

## Vue d'ensemble

L'application Yombal Yoon dispose de **deux systèmes de modes indépendants** :

1. **Mode Production OTP** (`productionMode.ts`) - Gère la vérification des numéros de téléphone
2. **Mode Test Commissions** (`testMode.ts`) - Gère les commissions sur les transactions

## 1. Mode Production OTP (productionMode.ts)

### Objectif
Contrôle la réutilisation des numéros de téléphone pendant les tests.

### Configuration

**Fichier :** `config/productionMode.ts`

```typescript
// Mode Test - Permet la réutilisation des numéros
export const IS_PRODUCTION_MODE = false;

// Mode Production - Numéros uniques par utilisateur
export const IS_PRODUCTION_MODE = true;
```

### Configuration Supabase

**Important :** Vous devez également configurer la variable d'environnement dans Supabase :

```bash
# Mode Test
supabase secrets set IS_PRODUCTION_MODE=false

# Mode Production
supabase secrets set IS_PRODUCTION_MODE=true
```

### Comportement

| Fonctionnalité | Mode Test (false) | Mode Production (true) |
|----------------|-------------------|------------------------|
| Réutilisation numéros | ✅ Autorisée | ❌ Interdite |
| Nettoyage auto OTP | ✅ Oui | ❌ Non |
| Contraintes unicité | ⚠️ Relaxées | 🔒 Strictes |
| Messages | "(Mode Test)" | Standard |

### Quand l'utiliser

- **Mode Test (false) :** Pendant le développement et les tests
- **Mode Production (true) :** Pour le déploiement en production

## 2. Mode Test Commissions (testMode.ts)

### Objectif
Désactive les commissions pendant la phase de test pour faciliter les tests de paiement.

### Configuration

**Fichier :** `config/testMode.ts`

```typescript
// Phase test - Commissions à 0%
export const IS_TEST_MODE = true;

// Phase production - Commissions actives
export const IS_TEST_MODE = false;
```

### Taux de Commission

```typescript
export const COMMISSION_RATES = {
  covoiturage: 0.12, // 12% pour le covoiturage
  colis: 0.15,       // 15% pour la livraison de colis
};
```

### Comportement

| Fonctionnalité | Mode Test (true) | Mode Production (false) |
|----------------|------------------|-------------------------|
| Commission Covoiturage | 0% | 12% |
| Commission Colis | 0% | 15% |
| Affichage | "(Phase test)" | Pourcentage réel |

### Quand l'utiliser

- **Mode Test (true) :** Pendant les tests de paiement et de wallet
- **Mode Production (false) :** Pour le déploiement en production

## Configurations Recommandées

### Phase de Développement

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = false; // ✅ Test OTP

// config/testMode.ts
export const IS_TEST_MODE = true; // ✅ Pas de commissions
```

**Supabase :**
```bash
supabase secrets set IS_PRODUCTION_MODE=false
```

**Avantages :**
- Réutilisation libre des numéros de test
- Pas de commissions à gérer
- Tests rapides et efficaces

### Phase de Test Utilisateur (Beta)

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = true; // ✅ Production OTP

// config/testMode.ts
export const IS_TEST_MODE = true; // ✅ Pas de commissions
```

**Supabase :**
```bash
supabase secrets set IS_PRODUCTION_MODE=true
```

**Avantages :**
- Numéros de téléphone réels et uniques
- Pas de commissions pour les testeurs
- Proche de la production

### Phase de Production

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = true; // ✅ Production OTP

// config/testMode.ts
export const IS_TEST_MODE = false; // ✅ Commissions actives
```

**Supabase :**
```bash
supabase secrets set IS_PRODUCTION_MODE=true
```

**Avantages :**
- Sécurité maximale
- Commissions actives
- Configuration finale

## Checklist de Déploiement

### Avant le Déploiement en Production

- [ ] Vérifier `IS_PRODUCTION_MODE = true` dans `config/productionMode.ts`
- [ ] Vérifier `IS_TEST_MODE = false` dans `config/testMode.ts`
- [ ] Configurer `IS_PRODUCTION_MODE=true` dans Supabase
- [ ] Redéployer l'Edge Function `send-otp-twilio`
- [ ] Tester avec un numéro réel
- [ ] Vérifier les logs pour confirmer le mode Production
- [ ] Tester une transaction complète avec commissions

### Commandes de Vérification

```bash
# Vérifier les secrets Supabase
supabase secrets list

# Redéployer l'Edge Function
supabase functions deploy send-otp-twilio

# Voir les logs en temps réel
supabase functions logs send-otp-twilio --follow
```

## Dépannage

### Problème : Numéros de test ne peuvent pas être réutilisés

**Cause :** `IS_PRODUCTION_MODE = true` ou variable Supabase mal configurée

**Solution :**
1. Vérifier `config/productionMode.ts` → `IS_PRODUCTION_MODE = false`
2. Vérifier Supabase : `supabase secrets set IS_PRODUCTION_MODE=false`
3. Redéployer : `supabase functions deploy send-otp-twilio`

### Problème : Commissions toujours à 0%

**Cause :** `IS_TEST_MODE = true`

**Solution :**
1. Vérifier `config/testMode.ts` → `IS_TEST_MODE = false`
2. Redémarrer l'application

### Problème : Commissions appliquées pendant les tests

**Cause :** `IS_TEST_MODE = false`

**Solution :**
1. Vérifier `config/testMode.ts` → `IS_TEST_MODE = true`
2. Redémarrer l'application

## Résumé Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    MODES DE L'APPLICATION                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. MODE PRODUCTION OTP (productionMode.ts)                 │
│     ├─ false (Test) : Réutilisation numéros OK             │
│     └─ true (Prod)  : Numéros uniques                       │
│                                                              │
│  2. MODE TEST COMMISSIONS (testMode.ts)                     │
│     ├─ true (Test)  : Commissions à 0%                      │
│     └─ false (Prod) : Commissions actives                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    CONFIGURATIONS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DÉVELOPPEMENT                                              │
│  ├─ IS_PRODUCTION_MODE = false                              │
│  └─ IS_TEST_MODE = true                                     │
│                                                              │
│  BETA / TEST UTILISATEUR                                    │
│  ├─ IS_PRODUCTION_MODE = true                               │
│  └─ IS_TEST_MODE = true                                     │
│                                                              │
│  PRODUCTION                                                 │
│  ├─ IS_PRODUCTION_MODE = true                               │
│  └─ IS_TEST_MODE = false                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Support

Pour toute question :
1. Consultez les logs de l'application
2. Vérifiez les logs Supabase Edge Functions
3. Référez-vous à `PRODUCTION_MODE_GUIDE.md` pour plus de détails sur le mode OTP

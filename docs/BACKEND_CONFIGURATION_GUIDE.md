
# 🎛️ Guide de Configuration Backend - Yombal Yoon

Ce guide explique comment modifier les règles métier de l'application Yombal Yoon **sans avoir besoin de rebuilder ou republier l'application**.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Accès à la Configuration](#accès-à-la-configuration)
3. [Commissions](#commissions)
4. [Tarification](#tarification)
5. [Wallet](#wallet)
6. [Méthodes de Paiement](#méthodes-de-paiement)
7. [Feature Flags](#feature-flags)
8. [Sécurité](#sécurité)
9. [Audit et Historique](#audit-et-historique)
10. [Exemples Pratiques](#exemples-pratiques)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que la Configuration Dynamique ?

La configuration dynamique permet de modifier les paramètres de l'application (commissions, prix, limites, etc.) directement depuis la base de données Supabase, **sans avoir à rebuilder ou republier l'application** sur les stores.

### Avantages

- ✅ **Pas de rebuild nécessaire** - Changements instantanés
- ✅ **Pas de soumission store** - Pas d'attente de validation Apple/Google
- ✅ **Flexibilité maximale** - Ajustez les paramètres en temps réel
- ✅ **Audit complet** - Historique de tous les changements
- ✅ **Rollback facile** - Revenez en arrière si nécessaire

### Table de Configuration

Tous les paramètres sont stockés dans la table `app_config` :

```sql
SELECT * FROM app_config ORDER BY category, key;
```

---

## 🔐 Accès à la Configuration

### Via Supabase Dashboard

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet Yombal Yoon
3. Allez dans **SQL Editor**
4. Exécutez vos requêtes de modification

### Via Supabase CLI

```bash
# Se connecter au projet
supabase link --project-ref drxtaxepofuoelplgrei

# Exécuter une requête
supabase db execute "SELECT * FROM app_config"
```

### Fonctions Helper

Trois fonctions SQL facilitent l'accès à la configuration :

```sql
-- Récupérer une valeur texte
SELECT get_config_value('commission_rate_covoiturage');

-- Récupérer une valeur numérique
SELECT get_config_number('colis_price_per_km');

-- Récupérer une valeur booléenne
SELECT get_config_boolean('feature_commission_enabled');
```

---

## 💰 Commissions

### Taux de Commission Actuels

| Service | Clé | Taux Actuel | Description |
|---------|-----|-------------|-------------|
| Covoiturage | `commission_rate_covoiturage` | 12% | Commission sur trajets |
| Colis | `commission_rate_colis` | 15% | Commission sur livraisons |
| Livraison Express | `commission_rate_livraison_express` | 15% | Commission express |
| Livraison 14 Régions | `commission_rate_livraison_14_regions` | 10% | Commission inter-régions |

### Modifier un Taux de Commission

```sql
-- Exemple: Passer le covoiturage de 12% à 10%
UPDATE app_config 
SET value = '0.10', updated_by = 'admin', updated_at = NOW()
WHERE key = 'commission_rate_covoiturage';

-- Exemple: Passer les colis de 15% à 12%
UPDATE app_config 
SET value = '0.12', updated_by = 'admin', updated_at = NOW()
WHERE key = 'commission_rate_colis';
```

### Activer/Désactiver les Commissions

**⚠️ IMPORTANT:** Actuellement en MODE TEST (commissions désactivées)

```sql
-- Activer les commissions (PRODUCTION)
UPDATE app_config 
SET value = 'true', updated_by = 'admin', updated_at = NOW()
WHERE key = 'feature_commission_enabled';

-- Désactiver les commissions (TEST)
UPDATE app_config 
SET value = 'false', updated_by = 'admin', updated_at = NOW()
WHERE key = 'feature_commission_enabled';
```

### Vérifier le Statut des Commissions

```sql
SELECT 
  key,
  value,
  CASE 
    WHEN value = 'true' THEN '✅ ACTIVÉ (Production)'
    WHEN value = 'false' THEN '⚠️ DÉSACTIVÉ (Test)'
  END as statut
FROM app_config
WHERE key = 'feature_commission_enabled';
```

---

## 💵 Tarification

### Prix Actuels

| Service | Clé | Prix Actuel | Description |
|---------|-----|-------------|-------------|
| Colis - Prix/km | `colis_price_per_km` | 200 FCFA | Prix par kilomètre |
| Colis - Prix de base | `colis_base_price` | 1000 FCFA | Prix de base |
| Express - Prix/km | `livraison_express_price_per_km` | 300 FCFA | Prix par kilomètre |
| Express - Prix de base | `livraison_express_base_price` | 1500 FCFA | Prix de base |
| 14 Régions - Prix de base | `livraison_14_regions_base_price` | 5000 FCFA | Prix par région |
| Covoiturage - Prix min | `min_price_per_seat_covoiturage` | 500 FCFA | Prix minimum/place |
| Covoiturage - Prix max | `max_price_per_seat_covoiturage` | 50000 FCFA | Prix maximum/place |

### Modifier les Prix

```sql
-- Augmenter le prix par km des colis de 200 à 250 FCFA
UPDATE app_config 
SET value = '250', updated_by = 'admin', updated_at = NOW()
WHERE key = 'colis_price_per_km';

-- Augmenter le prix de base livraison express de 1500 à 2000 FCFA
UPDATE app_config 
SET value = '2000', updated_by = 'admin', updated_at = NOW()
WHERE key = 'livraison_express_base_price';

-- Modifier le prix minimum covoiturage de 500 à 1000 FCFA
UPDATE app_config 
SET value = '1000', updated_by = 'admin', updated_at = NOW()
WHERE key = 'min_price_per_seat_covoiturage';
```

### Voir Tous les Prix

```sql
SELECT 
  key,
  value || ' FCFA' as prix,
  description
FROM app_config
WHERE category = 'pricing'
ORDER BY key;
```

---

## 💳 Wallet

### Limites Actuelles

| Paramètre | Clé | Valeur Actuelle | Description |
|-----------|-----|-----------------|-------------|
| Recharge min | `wallet_min_recharge` | 1000 FCFA | Recharge minimum |
| Recharge max | `wallet_max_recharge` | 500000 FCFA | Recharge maximum |
| Retrait min | `wallet_min_withdrawal` | 5000 FCFA | Retrait minimum |
| Retrait max | `wallet_max_withdrawal` | 1000000 FCFA | Retrait maximum |
| Seuil dette | `wallet_debt_threshold` | -10000 FCFA | Seuil de blocage |

### Modifier les Limites Wallet

```sql
-- Augmenter le retrait minimum de 5000 à 10000 FCFA
UPDATE app_config 
SET value = '10000', updated_by = 'admin', updated_at = NOW()
WHERE key = 'wallet_min_withdrawal';

-- Augmenter la recharge maximum de 500000 à 1000000 FCFA
UPDATE app_config 
SET value = '1000000', updated_by = 'admin', updated_at = NOW()
WHERE key = 'wallet_max_recharge';

-- Modifier le seuil de dette de -10000 à -20000 FCFA
UPDATE app_config 
SET value = '-20000', updated_by = 'admin', updated_at = NOW()
WHERE key = 'wallet_debt_threshold';
```

### Voir Toutes les Limites Wallet

```sql
SELECT 
  key,
  value || ' FCFA' as limite,
  description
FROM app_config
WHERE key LIKE 'wallet_%'
ORDER BY key;
```

---

## 💳 Méthodes de Paiement

### Méthodes Actuelles

| Méthode | Clé | Statut | Description |
|---------|-----|--------|-------------|
| Wave | `payment_method_wave_enabled` | ✅ Activé | Paiement Wave |
| Orange Money | `payment_method_orange_money_enabled` | ✅ Activé | Paiement OM |
| Espèces | `payment_method_especes_enabled` | ✅ Activé | Paiement cash |
| Wallet | `payment_method_wallet_enabled` | ✅ Activé | Paiement wallet |
| Carte Bancaire | `payment_method_carte_bancaire_enabled` | ❌ Désactivé | Paiement CB |

### Activer/Désactiver une Méthode

```sql
-- Activer la carte bancaire
UPDATE app_config 
SET value = 'true', updated_by = 'admin', updated_at = NOW()
WHERE key = 'payment_method_carte_bancaire_enabled';

-- Désactiver les espèces
UPDATE app_config 
SET value = 'false', updated_by = 'admin', updated_at = NOW()
WHERE key = 'payment_method_especes_enabled';
```

### Voir Toutes les Méthodes

```sql
SELECT 
  key,
  CASE 
    WHEN value = 'true' THEN '✅ Activé'
    WHEN value = 'false' THEN '❌ Désactivé'
  END as statut,
  description
FROM app_config
WHERE key LIKE 'payment_method_%'
ORDER BY key;
```

---

## 🎛️ Feature Flags

### Features Actuels

| Feature | Clé | Statut | Description |
|---------|-----|--------|-------------|
| Wallet | `feature_wallet_enabled` | ✅ Activé | Fonctionnalité wallet |
| Commissions | `feature_commission_enabled` | ⚠️ Désactivé | Mode test actif |
| Vérification OTP | `feature_phone_verification_required` | ✅ Activé | OTP obligatoire |
| Notations | `feature_ratings_enabled` | ✅ Activé | Système de notation |
| Partage trajet | `feature_trip_sharing_enabled` | ✅ Activé | Partage sécurité |

### Activer/Désactiver une Feature

```sql
-- Désactiver temporairement les notations
UPDATE app_config 
SET value = 'false', updated_by = 'admin', updated_at = NOW()
WHERE key = 'feature_ratings_enabled';

-- Réactiver les notations
UPDATE app_config 
SET value = 'true', updated_by = 'admin', updated_at = NOW()
WHERE key = 'feature_ratings_enabled';
```

### Voir Toutes les Features

```sql
SELECT 
  key,
  CASE 
    WHEN value = 'true' THEN '✅ Activé'
    WHEN value = 'false' THEN '❌ Désactivé'
  END as statut,
  description
FROM app_config
WHERE category = 'feature'
ORDER BY key;
```

---

## 🔒 Sécurité

### Paramètres de Sécurité

| Paramètre | Clé | Valeur | Description |
|-----------|-----|--------|-------------|
| Tentatives OTP max | `security_max_otp_attempts` | 5 | Tentatives max |
| Expiration OTP | `security_otp_expiry_minutes` | 10 min | Durée validité OTP |
| Trajets max/conducteur | `security_max_active_rides_per_driver` | 5 | Limite trajets actifs |
| Colis max/expéditeur | `security_max_active_parcels_per_sender` | 10 | Limite colis actifs |

### Modifier les Paramètres de Sécurité

```sql
-- Augmenter les tentatives OTP de 5 à 10
UPDATE app_config 
SET value = '10', updated_by = 'admin', updated_at = NOW()
WHERE key = 'security_max_otp_attempts';

-- Réduire l'expiration OTP de 10 à 5 minutes
UPDATE app_config 
SET value = '5', updated_by = 'admin', updated_at = NOW()
WHERE key = 'security_otp_expiry_minutes';
```

---

## 📊 Audit et Historique

### Voir l'Historique des Modifications

```sql
SELECT 
  config_key,
  old_value,
  new_value,
  changed_by,
  changed_at,
  change_reason
FROM app_config_audit
ORDER BY changed_at DESC
LIMIT 20;
```

### Voir les Dernières Modifications par Catégorie

```sql
SELECT 
  c.category,
  a.config_key,
  a.old_value,
  a.new_value,
  a.changed_by,
  a.changed_at
FROM app_config_audit a
JOIN app_config c ON a.config_key = c.key
WHERE c.category = 'commission'  -- ou 'pricing', 'payment', etc.
ORDER BY a.changed_at DESC;
```

### Rollback d'une Modification

```sql
-- Exemple: Revenir à l'ancienne valeur de commission
UPDATE app_config 
SET value = '0.12',  -- ancienne valeur
    updated_by = 'admin_rollback',
    updated_at = NOW()
WHERE key = 'commission_rate_covoiturage';
```

---

## 💡 Exemples Pratiques

### Scénario 1: Lancement Production

**Objectif:** Activer les commissions après la période de test

```sql
-- 1. Vérifier le statut actuel
SELECT value FROM app_config WHERE key = 'feature_commission_enabled';
-- Résultat: 'false' (Mode test)

-- 2. Activer les commissions
UPDATE app_config 
SET value = 'true', 
    updated_by = 'admin_production_launch',
    updated_at = NOW()
WHERE key = 'feature_commission_enabled';

-- 3. Vérifier l'activation
SELECT value FROM app_config WHERE key = 'feature_commission_enabled';
-- Résultat: 'true' (Mode production)
```

**✅ Résultat:** Les commissions sont maintenant actives pour tous les nouveaux trajets/livraisons, **sans rebuild de l'app**.

### Scénario 2: Ajustement Tarifaire

**Objectif:** Augmenter les prix suite à l'inflation

```sql
-- 1. Voir les prix actuels
SELECT key, value, description 
FROM app_config 
WHERE category = 'pricing';

-- 2. Augmenter tous les prix de 10%
UPDATE app_config 
SET value = (value::NUMERIC * 1.10)::TEXT,
    updated_by = 'admin_price_adjustment',
    updated_at = NOW()
WHERE category = 'pricing' AND data_type = 'number';

-- 3. Vérifier les nouveaux prix
SELECT key, value, description 
FROM app_config 
WHERE category = 'pricing';
```

**✅ Résultat:** Tous les prix sont augmentés de 10%, **sans rebuild de l'app**.

### Scénario 3: Promotion Temporaire

**Objectif:** Réduire les commissions pendant 1 mois

```sql
-- 1. Sauvegarder les taux actuels
CREATE TEMP TABLE commission_backup AS
SELECT key, value FROM app_config WHERE category = 'commission';

-- 2. Réduire les commissions de 50%
UPDATE app_config 
SET value = (value::NUMERIC * 0.5)::TEXT,
    updated_by = 'admin_promo',
    updated_at = NOW()
WHERE category = 'commission';

-- 3. Après 1 mois, restaurer les taux
UPDATE app_config c
SET value = b.value,
    updated_by = 'admin_promo_end',
    updated_at = NOW()
FROM commission_backup b
WHERE c.key = b.key;
```

**✅ Résultat:** Promotion appliquée et retirée, **sans rebuild de l'app**.

### Scénario 4: Désactiver une Méthode de Paiement

**Objectif:** Désactiver temporairement Wave pour maintenance

```sql
-- 1. Désactiver Wave
UPDATE app_config 
SET value = 'false',
    updated_by = 'admin_maintenance',
    updated_at = NOW()
WHERE key = 'payment_method_wave_enabled';

-- 2. Après maintenance, réactiver
UPDATE app_config 
SET value = 'true',
    updated_by = 'admin_maintenance_end',
    updated_at = NOW()
WHERE key = 'payment_method_wave_enabled';
```

**✅ Résultat:** Wave désactivé puis réactivé, **sans rebuild de l'app**.

---

## 🎯 Bonnes Pratiques

### 1. Toujours Renseigner `updated_by`

```sql
-- ✅ BON
UPDATE app_config 
SET value = '0.15', updated_by = 'admin_john', updated_at = NOW()
WHERE key = 'commission_rate_colis';

-- ❌ MAUVAIS
UPDATE app_config 
SET value = '0.15'
WHERE key = 'commission_rate_colis';
```

### 2. Vérifier Avant de Modifier

```sql
-- Toujours vérifier la valeur actuelle avant modification
SELECT key, value, description 
FROM app_config 
WHERE key = 'commission_rate_covoiturage';

-- Puis modifier
UPDATE app_config 
SET value = '0.10', updated_by = 'admin', updated_at = NOW()
WHERE key = 'commission_rate_covoiturage';

-- Et vérifier après
SELECT key, value, description 
FROM app_config 
WHERE key = 'commission_rate_covoiturage';
```

### 3. Tester en Staging d'abord

Si vous avez un environnement de staging, testez toujours les modifications là-bas avant de les appliquer en production.

### 4. Documenter les Changements Importants

```sql
-- Ajouter une raison pour les changements importants
INSERT INTO app_config_audit (config_key, old_value, new_value, changed_by, change_reason)
VALUES (
  'commission_rate_covoiturage',
  '0.12',
  '0.10',
  'admin',
  'Réduction temporaire pour promotion Black Friday'
);
```

---

## 🆘 Support

### En Cas de Problème

1. **Vérifier l'historique:**
   ```sql
   SELECT * FROM app_config_audit 
   WHERE config_key = 'votre_cle' 
   ORDER BY changed_at DESC;
   ```

2. **Rollback si nécessaire:**
   ```sql
   UPDATE app_config 
   SET value = 'ancienne_valeur',
       updated_by = 'admin_rollback',
       updated_at = NOW()
   WHERE key = 'votre_cle';
   ```

3. **Contacter le support technique**

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [QA Post-Build Report](./QA_POST_BUILD_REPORT.md)
- [Store Metadata](../STORE_METADATA.md)

---

**Document préparé par:** Natively AI  
**Date:** Janvier 2025  
**Version:** 1.0.0

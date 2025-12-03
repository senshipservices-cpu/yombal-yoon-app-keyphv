
# Guide de Démarrage Rapide - Mode Production

## Objectif

Ce guide vous permet de passer rapidement du mode Test au mode Production pour l'application Yombal Yoon.

## Étape 1 : Configuration des Fichiers

### 1.1 Mode Production OTP

**Fichier :** `config/productionMode.ts`

```typescript
export const IS_PRODUCTION_MODE = true; // ✅ Activer le mode Production
```

### 1.2 Mode Commissions

**Fichier :** `config/testMode.ts`

```typescript
export const IS_TEST_MODE = false; // ✅ Activer les commissions
```

## Étape 2 : Configuration Supabase

### 2.1 Via Supabase CLI

```bash
# Configurer le mode Production pour OTP
supabase secrets set IS_PRODUCTION_MODE=true

# Redéployer l'Edge Function
supabase functions deploy send-otp-twilio
```

### 2.2 Via Supabase Dashboard

1. Allez dans **Settings** → **Edge Functions**
2. Ajoutez/Modifiez la variable :
   - **Nom :** `IS_PRODUCTION_MODE`
   - **Valeur :** `true`
3. Sauvegardez

## Étape 3 : Vérification

### 3.1 Vérifier les Secrets

```bash
supabase secrets list
```

Vous devriez voir :
```
IS_PRODUCTION_MODE=true
```

### 3.2 Tester l'Application

1. **Tester l'OTP :**
   - Envoyer un code OTP à un nouveau numéro
   - Vérifier que le message ne contient pas "(Mode Test)"
   - Essayer de réutiliser le même numéro → Devrait échouer

2. **Tester les Commissions :**
   - Créer une course de covoiturage
   - Vérifier que la commission de 12% est appliquée
   - Créer une livraison de colis
   - Vérifier que la commission de 15% est appliquée

### 3.3 Vérifier les Logs

```bash
# Logs Edge Function
supabase functions logs send-otp-twilio --follow
```

Recherchez :
```
mode: 'Production'
```

## Étape 4 : Checklist Finale

Avant de déployer en production, vérifiez :

- [ ] `IS_PRODUCTION_MODE = true` dans `config/productionMode.ts`
- [ ] `IS_TEST_MODE = false` dans `config/testMode.ts`
- [ ] Variable `IS_PRODUCTION_MODE=true` configurée dans Supabase
- [ ] Edge Function redéployée
- [ ] Test OTP avec un numéro réel réussi
- [ ] Test de commission réussi
- [ ] Logs confirment le mode Production
- [ ] Credentials Twilio en production configurés
- [ ] Numéros Twilio vérifiés et actifs

## Retour au Mode Test

Si vous devez revenir au mode Test :

### Fichiers

```typescript
// config/productionMode.ts
export const IS_PRODUCTION_MODE = false;

// config/testMode.ts
export const IS_TEST_MODE = true;
```

### Supabase

```bash
supabase secrets set IS_PRODUCTION_MODE=false
supabase functions deploy send-otp-twilio
```

## Résumé des Modes

| Configuration | Développement | Beta | Production |
|---------------|---------------|------|------------|
| IS_PRODUCTION_MODE | false | true | true |
| IS_TEST_MODE | true | true | false |
| Réutilisation numéros | ✅ | ❌ | ❌ |
| Commissions | 0% | 0% | 12-15% |

## Support

- Documentation complète : `CONFIGURATION_MODES.md`
- Guide OTP détaillé : `PRODUCTION_MODE_GUIDE.md`
- Logs Supabase : `supabase functions logs send-otp-twilio --follow`

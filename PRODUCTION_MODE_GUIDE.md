
# Guide de Configuration du Mode Production

## Vue d'ensemble

L'application Yombal Yoon dispose maintenant d'un système de gestion des modes **Test** et **Production** pour la vérification des numéros de téléphone via OTP.

## Problème Résolu

**Avant :** En mode sandbox/test, lorsque vous enregistriez un numéro de téléphone et que vous reveniez plus tard pour tester avec le même numéro, vous obteniez l'erreur : "Numéro déjà utilisé par un autre compte".

**Après :** En mode Test, vous pouvez maintenant réutiliser les mêmes numéros de téléphone autant de fois que nécessaire pour vos tests.

## Configuration

### 1. Mode Test (Par défaut)

Le mode Test est activé par défaut pour faciliter le développement et les tests.

**Fichier :** `config/productionMode.ts`

```typescript
export const IS_PRODUCTION_MODE = false; // Mode Test activé
```

**Caractéristiques du Mode Test :**
- ✅ Les numéros de téléphone peuvent être réutilisés
- ✅ Les anciennes entrées OTP sont automatiquement supprimées
- ✅ Les contraintes d'unicité des numéros sont contournées
- ✅ Messages affichent "(Mode Test)" pour clarté

### 2. Mode Production

Pour passer en mode Production (déploiement réel) :

**Fichier :** `config/productionMode.ts`

```typescript
export const IS_PRODUCTION_MODE = true; // Mode Production activé
```

**Caractéristiques du Mode Production :**
- 🔒 Les numéros de téléphone sont uniques par utilisateur
- 🔒 Vérification stricte des doublons
- 🔒 Contraintes d'intégrité de la base de données appliquées
- 🔒 Sécurité maximale

### 3. Configuration Supabase Edge Function

Pour que le mode soit appliqué dans la fonction Edge, vous devez définir la variable d'environnement dans Supabase :

**Via Supabase Dashboard :**
1. Allez dans **Settings** → **Edge Functions**
2. Ajoutez la variable d'environnement :
   - **Nom :** `IS_PRODUCTION_MODE`
   - **Valeur :** `false` (pour Test) ou `true` (pour Production)

**Via Supabase CLI :**
```bash
# Mode Test
supabase secrets set IS_PRODUCTION_MODE=false

# Mode Production
supabase secrets set IS_PRODUCTION_MODE=true
```

## Comportement par Mode

### Mode Test (IS_PRODUCTION_MODE = false)

1. **Envoi OTP :**
   - Supprime automatiquement les anciennes entrées OTP pour le même numéro
   - Permet l'envoi de nouveaux codes sans restriction
   - Message : "Code envoyé par WhatsApp/SMS (Mode Test)"

2. **Vérification OTP :**
   - Ignore les contraintes d'unicité des numéros de téléphone
   - Si un numéro existe déjà, il est libéré puis réattribué
   - Message : "Numéro vérifié avec succès (Mode Test)"

3. **Base de données :**
   - Les anciennes vérifications sont nettoyées automatiquement
   - Pas de blocage sur les numéros déjà utilisés

### Mode Production (IS_PRODUCTION_MODE = true)

1. **Envoi OTP :**
   - Conserve l'historique des OTP
   - Applique les limites de tentatives
   - Message : "Code envoyé par WhatsApp/SMS"

2. **Vérification OTP :**
   - Vérifie strictement l'unicité des numéros
   - Bloque si le numéro est déjà utilisé par un autre compte
   - Message : "Numéro vérifié avec succès"

3. **Base de données :**
   - Contraintes d'intégrité complètes
   - Historique complet des vérifications
   - Sécurité maximale

## Workflow de Test Recommandé

### Phase de Développement

1. **Activer le Mode Test :**
   ```typescript
   // config/productionMode.ts
   export const IS_PRODUCTION_MODE = false;
   ```

2. **Configurer Supabase :**
   ```bash
   supabase secrets set IS_PRODUCTION_MODE=false
   ```

3. **Tester librement :**
   - Utilisez les mêmes numéros de test autant que nécessaire
   - Pas de nettoyage de base de données requis
   - Tests rapides et efficaces

### Phase de Production

1. **Activer le Mode Production :**
   ```typescript
   // config/productionMode.ts
   export const IS_PRODUCTION_MODE = true;
   ```

2. **Configurer Supabase :**
   ```bash
   supabase secrets set IS_PRODUCTION_MODE=true
   ```

3. **Déployer :**
   - Redéployer l'Edge Function
   - Vérifier que la variable d'environnement est bien définie
   - Tester avec de vrais numéros

## Vérification du Mode Actuel

### Dans l'Application

Le mode actuel est visible dans les logs :

```
📱 Sending OTP to: +221XXXXXXXXX via whatsapp userId: xxx Mode: Test
```

ou

```
📱 Sending OTP to: +221XXXXXXXXX via whatsapp userId: xxx Mode: Production
```

### Dans la Console Supabase

Vérifiez les logs de l'Edge Function pour voir :
```
📥 Request: { action: 'send', phoneNumber: '+221XXXXXXXXX', userId: 'xxx', mode: 'Test' }
```

## Commandes Utiles

### Vérifier les Secrets Supabase
```bash
supabase secrets list
```

### Redéployer l'Edge Function
```bash
supabase functions deploy send-otp-twilio
```

### Voir les Logs en Temps Réel
```bash
supabase functions logs send-otp-twilio --follow
```

## Dépannage

### Problème : Le mode ne change pas

**Solution :**
1. Vérifiez que la variable d'environnement est bien définie dans Supabase
2. Redéployez l'Edge Function
3. Attendez quelques secondes pour la propagation

### Problème : Toujours l'erreur "Numéro déjà utilisé"

**Solution :**
1. Vérifiez que `IS_PRODUCTION_MODE=false` dans Supabase
2. Vérifiez les logs pour confirmer le mode
3. Nettoyez manuellement la base de données si nécessaire :
   ```sql
   DELETE FROM phone_verifications WHERE phone_number = '+221XXXXXXXXX';
   UPDATE user_profiles SET phone_number = NULL WHERE phone_number = '+221XXXXXXXXX';
   ```

### Problème : Les OTP ne sont pas envoyés

**Solution :**
1. Vérifiez les credentials Twilio dans Supabase
2. Vérifiez les logs de l'Edge Function
3. Testez avec SMS si WhatsApp échoue

## Sécurité

⚠️ **IMPORTANT :** Ne jamais déployer en production avec `IS_PRODUCTION_MODE = false`

- Le mode Test est uniquement pour le développement
- En production, toujours utiliser `IS_PRODUCTION_MODE = true`
- Vérifiez la configuration avant chaque déploiement

## Résumé

| Aspect | Mode Test | Mode Production |
|--------|-----------|-----------------|
| Réutilisation numéros | ✅ Oui | ❌ Non |
| Nettoyage auto OTP | ✅ Oui | ❌ Non |
| Contraintes unicité | ⚠️ Relaxées | 🔒 Strictes |
| Messages | "(Mode Test)" | Standard |
| Usage | Développement | Production |

## Support

Pour toute question ou problème, consultez :
- Les logs Supabase Edge Functions
- Les logs de l'application (console.log)
- La documentation Twilio pour les problèmes d'envoi

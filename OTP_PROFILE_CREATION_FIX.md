
# Fix: "Erreur lors de la création du profil" - OTP Verification

## Problème Identifié

L'erreur "Erreur lors de la création du profil. Veuillez réessayer." se produisait lors de la vérification OTP après avoir ajouté le numéro au sandbox Twilio.

### Cause Racine

La table `user_profiles` a une contrainte **UNIQUE** sur la colonne `phone_number`. Lorsque l'Edge Function tentait de créer un nouveau profil avec un numéro de téléphone qui existait déjà dans la base de données (même d'un test précédent), cela provoquait une violation de contrainte (erreur PostgreSQL 23505).

## Solution Implémentée

### 1. Gestion Améliorée des Contraintes Uniques

L'Edge Function `send-otp-twilio` a été mise à jour pour gérer intelligemment les cas où le numéro de téléphone existe déjà :

#### En Mode Test (IS_PRODUCTION_MODE = false)
- **Avant la création** : Nettoie le numéro de téléphone des autres profils
- **Si erreur 23505** : Réassigne automatiquement le numéro au profil actuel
- Permet la réutilisation des numéros pour les tests

#### En Mode Production (IS_PRODUCTION_MODE = true)
- **Validation stricte** : Vérifie que le numéro n'est pas déjà utilisé
- **Message clair** : "Ce numéro est déjà utilisé par un autre compte"
- Empêche les doublons de numéros

### 2. Flux de Vérification Amélioré

```typescript
// 1. Vérifier si le profil existe
const { data: existingProfile, error: fetchError } = await supabase
  .from("user_profiles")
  .select("id, phone_number")
  .eq("id", userId)
  .single();

// 2. Si le profil n'existe pas (PGRST116)
if (fetchError?.code === 'PGRST116') {
  // En mode test : nettoyer les anciens numéros
  if (!IS_PRODUCTION_MODE) {
    await supabase
      .from("user_profiles")
      .update({ phone_number: null, is_phone_verified: false })
      .eq("phone_number", phoneNumber);
  }
  
  // Créer le nouveau profil
  const { error: createError } = await supabase
    .from("user_profiles")
    .insert({
      id: userId,
      phone_number: phoneNumber,
      is_phone_verified: true,
      phone_verified_at: new Date().toISOString(),
      full_name: 'Utilisateur',
      roles: {
        driver: true,
        passenger: true,
        delivery: false,
        sender: false,
      },
    });
  
  // 3. Si erreur de contrainte unique (23505)
  if (createError?.code === '23505') {
    // En mode test : réassigner le numéro
    if (!IS_PRODUCTION_MODE) {
      // Trouver et nettoyer l'ancien profil
      // Réessayer la création
    } else {
      // En production : refuser
      return error("Ce numéro est déjà utilisé");
    }
  }
}

// 4. Si le profil existe : mettre à jour
else {
  await supabase
    .from("user_profiles")
    .update({
      is_phone_verified: true,
      phone_verified_at: new Date().toISOString(),
      phone_number: phoneNumber,
    })
    .eq("id", userId);
}
```

### 3. Messages d'Erreur Améliorés

- **Contrainte unique (23505)** : "Ce numéro est déjà utilisé par un autre compte"
- **Erreur de création** : "Erreur lors de la création du profil: [détails]"
- **Mode test** : Messages incluent "(Mode Test)" pour clarté

## Test de la Solution

### Scénario 1 : Nouveau Numéro (Mode Test)
1. Entrer un nouveau numéro : `+221765676486`
2. Recevoir le code OTP
3. Vérifier le code
4. ✅ Profil créé avec succès

### Scénario 2 : Numéro Existant (Mode Test)
1. Utiliser un numéro déjà dans la base
2. Recevoir le code OTP
3. Vérifier le code
4. ✅ Ancien profil nettoyé, nouveau profil créé

### Scénario 3 : Numéro Existant (Mode Production)
1. Utiliser un numéro déjà dans la base
2. Recevoir le code OTP
3. Vérifier le code
4. ❌ Erreur : "Ce numéro est déjà utilisé par un autre compte"

## Vérification

Pour vérifier que la solution fonctionne :

```bash
# 1. Vérifier le mode actuel
echo $IS_PRODUCTION_MODE

# 2. Tester la vérification OTP
# Utiliser l'interface de l'app pour :
# - Entrer votre numéro : +221765676486
# - Recevoir le code OTP
# - Vérifier le code

# 3. Vérifier dans la base de données
SELECT id, phone_number, is_phone_verified, phone_verified_at
FROM user_profiles
WHERE phone_number = '+221765676486';
```

## Logs de Débogage

L'Edge Function inclut maintenant des logs détaillés :

```
📝 Updating user profile: [userId]
📝 Profile doesn't exist, creating new profile...
🧪 Test mode: Clearing phone from other profiles...
✅ Phone cleared from other profiles
⚠️ Phone number already exists, trying to update existing profile...
🧪 Test mode: Reassigning phone number to current user...
✅ Profile created successfully after reassignment
```

## Configuration Requise

### Variables d'Environnement Supabase

Assurez-vous que ces variables sont configurées dans Supabase Edge Functions :

```bash
IS_PRODUCTION_MODE=false  # ou true en production
SUPABASE_URL=https://drxtaxepofuoelplgrei.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[votre_clé]
TWILIO_ACCOUNT_SID=[votre_sid]
TWILIO_AUTH_TOKEN=[votre_token]
TWILIO_WHATSAPP_NUMBER=[votre_numéro]
TWILIO_PHONE_NUMBER=[votre_numéro_sms]
```

## Prochaines Étapes

1. ✅ Tester avec votre numéro Twilio sandbox : `+221765676486`
2. ✅ Vérifier que le profil est créé correctement
3. ✅ Confirmer que la vérification fonctionne
4. 📋 Passer en mode production quand prêt : `IS_PRODUCTION_MODE=true`

## Notes Importantes

- **Mode Test** : Permet la réutilisation des numéros pour faciliter les tests
- **Mode Production** : Protection stricte contre les doublons
- **Contrainte Unique** : La table `user_profiles` maintient l'unicité des numéros
- **Sandbox Twilio** : Assurez-vous que le numéro est bien ajouté au sandbox

## Résolution des Problèmes

### Si l'erreur persiste :

1. **Vérifier les logs Edge Function** :
   ```bash
   # Dans Supabase Dashboard > Edge Functions > send-otp-twilio > Logs
   ```

2. **Vérifier la base de données** :
   ```sql
   -- Voir tous les profils avec ce numéro
   SELECT * FROM user_profiles WHERE phone_number = '+221765676486';
   
   -- Nettoyer manuellement si nécessaire (mode test uniquement)
   UPDATE user_profiles 
   SET phone_number = NULL, is_phone_verified = false 
   WHERE phone_number = '+221765676486';
   ```

3. **Vérifier Twilio** :
   - Le numéro est bien dans le sandbox
   - Le format est correct : `+221765676486`
   - WhatsApp est installé sur ce numéro

## Déploiement

La solution a été déployée automatiquement :
- **Version** : 27
- **Status** : ACTIVE
- **Date** : 2025-06-04

Vous pouvez maintenant tester la vérification OTP avec votre numéro !

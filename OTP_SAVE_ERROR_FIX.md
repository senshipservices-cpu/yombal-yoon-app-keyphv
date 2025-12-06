
# Fix: "Erreur de sauvegarde" dans la vérification OTP

## Problème identifié

L'erreur "Erreur de sauvegarde" apparaissait lors de la vérification OTP dans le module de covoiturage. Cette erreur se produisait lorsque l'Edge Function `send-otp-twilio` tentait d'insérer un nouveau code OTP dans la table `phone_verifications`.

### Causes principales

1. **Mode Test avec Twilio Sandbox**: En mode test, vous réutilisez le même numéro de téléphone pour plusieurs tests, ce qui créait des conflits avec les anciennes entrées OTP non nettoyées.

2. **Gestion d'erreur insuffisante**: L'Edge Function retournait simplement "Erreur de sauvegarde" sans fournir de détails sur la cause réelle du problème.

3. **Nettoyage incomplet**: En mode test, les anciennes entrées OTP n'étaient pas toujours supprimées avant d'insérer une nouvelle entrée.

## Solution implémentée

### 1. Amélioration du nettoyage en mode test

```typescript
// In test mode, delete old OTP entries for this phone number to allow reuse
if (!IS_PRODUCTION_MODE) {
  console.log('🧪 Test mode: Cleaning old OTP entries for phone:', phoneNumber);
  const { error: deleteError } = await supabase
    .from("phone_verifications")
    .delete()
    .eq("phone_number", phoneNumber);
  
  if (deleteError) {
    console.error("⚠️ Error cleaning old OTP entries:", deleteError);
    // Don't fail here, just log the error
  } else {
    console.log('✅ Old OTP entries cleaned successfully');
  }
}
```

### 2. Messages d'erreur détaillés

```typescript
if (saveErr) {
  console.error("❌ DB SAVE ERROR:", {
    code: saveErr.code,
    message: saveErr.message,
    details: saveErr.details,
    hint: saveErr.hint,
  });
  
  // Provide more detailed error message
  let errorMessage = "Erreur de sauvegarde";
  if (saveErr.code === '23505') {
    errorMessage = "Une vérification est déjà en cours pour ce numéro. Veuillez réessayer dans quelques minutes.";
  } else if (saveErr.code === '23503') {
    errorMessage = "Erreur de référence utilisateur. Veuillez vous reconnecter.";
  } else {
    errorMessage = `Erreur de sauvegarde: ${saveErr.message}`;
  }
  
  return response({ 
    success: false, 
    error: errorMessage,
    details: IS_PRODUCTION_MODE ? undefined : saveErr.message 
  }, 500);
}
```

### 3. Création automatique de profil

Si le profil utilisateur n'existe pas lors de la vérification OTP, il est maintenant créé automatiquement:

```typescript
// If profile doesn't exist, create it
if (fetchError.code === 'PGRST116') {
  console.log("📝 Profile doesn't exist, creating new profile...");
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
  
  if (createError) {
    console.error("❌ Error creating profile:", createError);
    return response({ 
      success: false, 
      error: "Erreur lors de la création du profil: " + createError.message 
    }, 500);
  }
  
  console.log("✅ Profile created successfully");
}
```

### 4. Gestion des doublons en mode test

En mode test, si un numéro de téléphone est déjà utilisé par un autre profil, il est automatiquement libéré:

```typescript
if (!IS_PRODUCTION_MODE) {
  console.log('🧪 Test mode: Skipping duplicate phone check');
  
  // In test mode, clear the phone number from any other profile
  const { error: clearError } = await supabase
    .from("user_profiles")
    .update({ phone_number: null, is_phone_verified: false })
    .eq("phone_number", phoneNumber)
    .neq("id", userId);
  
  if (clearError) {
    console.error("⚠️ Error clearing phone from other profiles:", clearError);
  } else {
    console.log('✅ Phone cleared from other profiles');
  }
}
```

## Déploiement

L'Edge Function `send-otp-twilio` a été mise à jour et déployée avec succès:

- **Version**: 24
- **Status**: ACTIVE
- **Date**: 2025-01-05

## Test de la correction

Pour tester la correction:

1. **Ouvrir l'application** et naviguer vers le module Covoiturage
2. **Cliquer sur "Publier un trajet"** ou toute action nécessitant une vérification OTP
3. **Entrer votre numéro de téléphone** (format: +221XXXXXXXXX)
4. **Sélectionner la méthode d'envoi** (WhatsApp ou SMS)
5. **Cliquer sur "Envoyer le code"**
6. **Vérifier que**:
   - Le code OTP est envoyé avec succès
   - Aucune erreur "Erreur de sauvegarde" n'apparaît
   - Le message de confirmation indique "(Mode Test)" si vous êtes en mode test
7. **Entrer le code OTP** reçu
8. **Vérifier que** la vérification réussit et que le profil est mis à jour

## Logs à surveiller

Les logs de l'Edge Function afficheront maintenant:

- `🧪 Test mode: Cleaning old OTP entries for phone: +221XXXXXXXXX`
- `✅ Old OTP entries cleaned successfully`
- `💾 Saving OTP to database...`
- `✅ OTP saved to database`
- `📤 Sending OTP via whatsapp/sms`
- `✅ OTP sent successfully via whatsapp/sms`

En cas d'erreur, les logs fourniront des détails complets sur la cause du problème.

## Mode Production vs Mode Test

### Mode Test (IS_PRODUCTION_MODE = false)
- Les anciennes entrées OTP sont automatiquement supprimées
- Les numéros de téléphone peuvent être réutilisés
- Les messages d'erreur incluent des détails techniques
- Les doublons de numéros sont automatiquement résolus

### Mode Production (IS_PRODUCTION_MODE = true)
- Les entrées OTP ne sont pas supprimées automatiquement
- Les numéros de téléphone doivent être uniques par utilisateur
- Les messages d'erreur sont plus génériques
- Les doublons de numéros sont bloqués

## Configuration actuelle

Le mode actuel est défini dans `config/productionMode.ts`:

```typescript
export const IS_PRODUCTION_MODE = false; // Mode Test activé
```

Pour passer en mode production, changez cette valeur à `true` et redéployez l'Edge Function avec la variable d'environnement `IS_PRODUCTION_MODE=true`.

## Prochaines étapes

1. **Tester la correction** avec votre numéro Twilio sandbox
2. **Vérifier les logs** dans le dashboard Supabase pour confirmer le bon fonctionnement
3. **Passer en mode production** une fois les tests validés
4. **Configurer les numéros Twilio de production** (WhatsApp et SMS)

## Support

Si vous rencontrez toujours des problèmes:

1. Vérifiez les logs de l'Edge Function dans le dashboard Supabase
2. Assurez-vous que votre numéro est bien configuré dans le sandbox Twilio
3. Vérifiez que les variables d'environnement Twilio sont correctement configurées:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `TWILIO_PHONE_NUMBER`
   - `IS_PRODUCTION_MODE`

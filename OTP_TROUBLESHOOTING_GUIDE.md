
# Guide de Dépannage OTP WhatsApp

## Problèmes Résolus

### 1. ✅ Erreur "Erreur lors de la mise à jour du profil"
**Cause:** Le profil n'était pas rafraîchi après la vérification OTP réussie.

**Solution:** 
- Ajout de `refreshProfile()` après la vérification réussie dans `PhoneVerificationModal.tsx`
- Amélioration de la gestion des erreurs dans l'Edge Function
- Ajout de logs détaillés pour le débogage

### 2. ⚠️ Messages WhatsApp non reçus pour certains numéros

**Causes possibles:**

#### A. Twilio WhatsApp en mode Sandbox
Si vous utilisez Twilio WhatsApp en mode sandbox (gratuit), seuls les numéros pré-approuvés peuvent recevoir des messages.

**Comment vérifier:**
1. Allez sur https://console.twilio.com/
2. Naviguez vers "Messaging" > "Try it out" > "Send a WhatsApp message"
3. Vérifiez si vous êtes en mode "Sandbox"

**Solution pour le mode Sandbox:**
- Chaque numéro doit d'abord envoyer un message WhatsApp au numéro Twilio avec le code fourni
- Exemple: "join [votre-code-sandbox]" au numéro WhatsApp de Twilio
- Le numéro sera alors approuvé pour recevoir des messages

**Solution permanente:**
- Passer à un compte Twilio production avec WhatsApp Business API approuvé
- Coût: environ $0.005 par message WhatsApp

#### B. Numéro non enregistré sur WhatsApp
Le numéro de téléphone doit être enregistré sur WhatsApp pour recevoir des messages WhatsApp.

**Solution:**
- Vérifiez que le numéro est actif sur WhatsApp
- Utilisez l'option SMS comme alternative (automatiquement proposée en fallback)

#### C. Format de numéro incorrect
Le numéro doit être au format international complet.

**Format correct:**
- ✅ `+221772847171` (avec le + et le code pays)
- ❌ `772847171` (sans code pays)
- ❌ `00221772847171` (avec 00 au lieu de +)

### 3. 🔄 Fallback automatique SMS

L'Edge Function a été mise à jour pour basculer automatiquement vers SMS si WhatsApp échoue:

```typescript
// Si WhatsApp échoue, essaie SMS automatiquement
if (method === 'whatsapp' && smsNumber) {
  console.log('🔄 WhatsApp failed, trying SMS fallback...');
  return await sendViaTwilio(phone, otp, 'sms');
}
```

## Configuration Twilio Requise

### Variables d'environnement Supabase Edge Function:

```bash
# Obligatoire
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Pour WhatsApp (optionnel si SMS configuré)
TWILIO_WHATSAPP_NUMBER=+14155238886

# Pour SMS (optionnel si WhatsApp configuré)
TWILIO_PHONE_NUMBER=+1234567890
```

### Comment configurer:

1. **Via Supabase Dashboard:**
   ```
   Project Settings > Edge Functions > Secrets
   ```

2. **Via CLI:**
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=ACxxx
   supabase secrets set TWILIO_AUTH_TOKEN=xxx
   supabase secrets set TWILIO_WHATSAPP_NUMBER=+14155238886
   supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
   ```

## Tests Recommandés

### Test 1: Vérifier avec le numéro +221772847171
Ce numéro fonctionne déjà (vérifié dans la base de données).

**Résultat attendu:**
- ✅ Code OTP reçu par WhatsApp
- ✅ Vérification réussie
- ✅ Profil mis à jour

### Test 2: Vérifier avec un nouveau numéro

**Étapes:**
1. Assurez-vous que le numéro est enregistré sur WhatsApp
2. Si en mode Sandbox Twilio, envoyez d'abord le message d'activation
3. Essayez d'envoyer le code OTP
4. Si WhatsApp échoue, le système basculera automatiquement vers SMS

### Test 3: Vérifier le fallback SMS

**Étapes:**
1. Utilisez un numéro NON enregistré sur WhatsApp
2. Sélectionnez "WhatsApp" comme méthode
3. Le système devrait automatiquement basculer vers SMS
4. Vérifiez que vous recevez le code par SMS

## Logs de Débogage

Les logs suivants sont maintenant disponibles dans l'Edge Function:

```
📥 Request: { action, phoneNumber, userId }
📤 Sending OTP via [method] from [from] to [to]
✅ OTP sent successfully via [method]
🔄 WhatsApp failed, trying SMS fallback...
📝 Updating user profile: [userId]
📋 Existing profile: { id, phone_number }
✅ User profile updated successfully
```

Pour voir les logs:
```bash
# Via Supabase Dashboard
Project > Edge Functions > send-otp-twilio > Logs

# Via CLI
supabase functions logs send-otp-twilio
```

## Vérification de la Base de Données

### Vérifier les tentatives OTP:
```sql
SELECT 
  phone_number, 
  otp_code, 
  verification_method, 
  is_verified, 
  created_at, 
  expires_at
FROM phone_verifications 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Vérifier le profil utilisateur:
```sql
SELECT 
  id, 
  phone_number, 
  full_name, 
  is_phone_verified, 
  phone_verified_at
FROM user_profiles 
WHERE id = 'votre_user_id';
```

## Messages d'Erreur Améliorés

L'application affiche maintenant des messages d'erreur plus clairs:

- ✅ "Code envoyé par WhatsApp" / "Code envoyé par SMS"
- ❌ "Erreur d'envoi. Vérifiez que le numéro est correct et enregistré sur WhatsApp."
- ❌ "Ce numéro est déjà utilisé par un autre compte"
- ❌ "Code expiré. Veuillez demander un nouveau code."
- ❌ "Code incorrect"

## Prochaines Étapes

1. **Tester avec +221772847171** (devrait fonctionner)
2. **Tester avec un autre numéro enregistré sur WhatsApp**
3. **Si problème persiste:**
   - Vérifier les logs de l'Edge Function
   - Vérifier la configuration Twilio
   - Vérifier que le numéro est au format international correct
   - Essayer avec SMS au lieu de WhatsApp

## Support

Si le problème persiste après avoir suivi ce guide:

1. Vérifiez les logs de l'Edge Function
2. Vérifiez la table `phone_verifications` dans la base de données
3. Vérifiez la configuration Twilio (compte actif, crédits disponibles)
4. Vérifiez que le numéro WhatsApp de Twilio est correctement configuré

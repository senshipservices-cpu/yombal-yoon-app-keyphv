
# Guide de Test Rapide - Priorité WhatsApp sur SMS

## 🎯 Objectif

Tester que WhatsApp est bien prioritaire sur SMS avec fallback automatique.

## ⚡ Test Rapide (5 minutes)

### 1. Vérifier la Configuration

```bash
# Dans Supabase Dashboard > Project Settings > Edge Functions > Secrets
# Vérifiez que ces variables sont définies :

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
TWILIO_SMS_NUMBER=+1234567890
IS_PRODUCTION_MODE=true
```

### 2. Test OTP avec WhatsApp

**Scénario** : Envoyer un code OTP

```typescript
// Dans votre app ou via Supabase SQL Editor
const { data, error } = await supabase.functions.invoke('send-otp-twilio', {
  body: {
    action: 'send',
    phoneNumber: '+221771234567', // Votre numéro de test
    userId: 'test-user-id'
  }
});

console.log('Résultat:', data);
```

**Résultat Attendu** :

```json
{
  "success": true,
  "message": "Code envoyé par WhatsApp",
  "method": "whatsapp",
  "mode": "production"
}
```

### 3. Vérifier les Logs

**Dans Supabase Dashboard** :
1. Allez dans `Edge Functions`
2. Cliquez sur `send-otp-twilio`
3. Consultez les logs

**Logs Attendus (Succès WhatsApp)** :

```
📱 TENTATIVE 1/2 : Envoi via WhatsApp (prioritaire pour réduire les coûts)
📤 Sending OTP via WhatsApp from whatsapp:+14155238886 to whatsapp:+221771234567
✅ OTP envoyé avec succès via WhatsApp (coût réduit)
📊 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Logs Attendus (Fallback SMS)** :

```
📱 TENTATIVE 1/2 : Envoi via WhatsApp (prioritaire pour réduire les coûts)
📤 Sending OTP via WhatsApp from whatsapp:+14155238886 to whatsapp:+221771234567
❌ Erreur WhatsApp (Code 63007): Recipient not on WhatsApp
🔄 TENTATIVE 2/2 : Fallback automatique vers SMS...
📤 Sending OTP via SMS from +1234567890 to +221771234567
✅ OTP envoyé avec succès via SMS (fallback)
📊 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Test Notification Unifiée

**Scénario** : Envoyer une notification de réservation

```typescript
const { data, error } = await supabase.functions.invoke('send-notification-unified', {
  body: {
    type: 'reservation_created',
    userId: 'test-user-id',
    title: '🚗 Nouvelle réservation !',
    message: 'Test de notification avec priorité WhatsApp',
    phoneNumber: '+221771234567',
    channels: ['whatsapp']
  }
});

console.log('Résultat:', data);
```

**Résultat Attendu (Succès WhatsApp)** :

```json
{
  "success": true,
  "channels": {
    "whatsapp": {
      "success": true
    }
  },
  "mode": "production"
}
```

**Résultat Attendu (Fallback SMS)** :

```json
{
  "success": true,
  "channels": {
    "sms": {
      "success": true,
      "details": "Fallback SMS après échec WhatsApp: WhatsApp failed (Code 63007)"
    }
  },
  "mode": "production"
}
```

## 🔍 Diagnostic Rapide

### Problème : WhatsApp ne fonctionne jamais

**Causes possibles** :

1. **Numéro WhatsApp non configuré**
   ```bash
   # Vérifiez dans Supabase Secrets
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```

2. **Sandbox WhatsApp non activé**
   - Envoyez le code d'activation au sandbox Twilio
   - Format : `join <code>` au numéro WhatsApp Twilio

3. **Numéro de test pas sur WhatsApp**
   - Utilisez un numéro qui a WhatsApp installé
   - Vérifiez que le numéro est au format international (+221...)

### Problème : SMS ne fonctionne pas (fallback)

**Causes possibles** :

1. **Numéro SMS non configuré**
   ```bash
   # Vérifiez dans Supabase Secrets
   TWILIO_SMS_NUMBER=+1234567890
   ```

2. **Crédit Twilio insuffisant**
   - Vérifiez votre solde sur console.twilio.com

3. **Restrictions géographiques**
   - Vérifiez que le Sénégal (+221) est autorisé

## 📊 Vérification Console Twilio

1. Allez sur [console.twilio.com](https://console.twilio.com)
2. Cliquez sur `Monitor` > `Logs` > `Messaging`
3. Vérifiez les messages récents

**Indicateurs de Succès** :

- ✅ Status : `delivered` ou `sent`
- ✅ Channel : `whatsapp` (prioritaire) ou `sms` (fallback)
- ✅ Error Code : Aucun

**Indicateurs d'Échec** :

- ❌ Status : `failed` ou `undelivered`
- ❌ Error Code : 63007, 21211, etc.
- ❌ Error Message : Description de l'erreur

## 🎯 Checklist de Test

- [ ] Configuration Twilio vérifiée
- [ ] Test OTP WhatsApp réussi
- [ ] Test OTP SMS fallback réussi
- [ ] Test notification WhatsApp réussi
- [ ] Test notification SMS fallback réussi
- [ ] Logs Supabase consultés
- [ ] Logs Twilio consultés
- [ ] Coûts vérifiés (WhatsApp < SMS)

## 💡 Conseils

1. **Testez d'abord avec le sandbox WhatsApp**
   - Gratuit et rapide à configurer
   - Parfait pour le développement

2. **Utilisez plusieurs numéros de test**
   - Un avec WhatsApp activé
   - Un sans WhatsApp (pour tester le fallback)

3. **Surveillez les coûts**
   - WhatsApp : ~3 FCFA par message
   - SMS : ~30 FCFA par message
   - Objectif : >80% via WhatsApp

4. **Activez le mode production**
   ```bash
   IS_PRODUCTION_MODE=true
   ```

## 🚀 Prochaines Étapes

Une fois les tests réussis :

1. ✅ Déployez en production
2. ✅ Configurez le monitoring
3. ✅ Définissez des alertes de coûts
4. ✅ Formez les utilisateurs à activer WhatsApp

## 📞 Support

Si les tests échouent :

1. Consultez `TWILIO_WHATSAPP_PRIORITY_IMPLEMENTATION.md`
2. Vérifiez les logs détaillés
3. Contactez le support Twilio si nécessaire

## ✅ Validation Finale

Le système fonctionne correctement si :

- ✅ WhatsApp est tenté en premier
- ✅ SMS est utilisé en fallback automatique
- ✅ Les logs sont clairs et détaillés
- ✅ Les coûts sont réduits de ~90%
- ✅ Aucun message n'est perdu

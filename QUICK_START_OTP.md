
# 🚀 Quick Start - OTP Production

## Configuration en 5 minutes

### Étape 1: Créer un compte Twilio (2 min)
1. Allez sur [twilio.com](https://www.twilio.com)
2. Cliquez sur "Sign up"
3. Remplissez le formulaire
4. Vérifiez votre email

### Étape 2: Obtenir les credentials (1 min)
1. Connectez-vous au [Dashboard Twilio](https://console.twilio.com)
2. Notez ces 2 valeurs:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Cliquez sur "Show" pour le révéler

### Étape 3: Activer WhatsApp Sandbox (1 min)
1. Dans le menu: **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Envoyez un message WhatsApp à `+1 415 523 8886`
3. Contenu: `join [votre-sandbox-keyword]`
4. Attendez la confirmation

### Étape 4: Configurer les secrets Supabase (1 min)
1. Allez sur [supabase.com](https://supabase.com)
2. Projet: **drxtaxepofuoelplgrei**
3. Menu: **Edge Functions** > **Settings** > **Secrets**
4. Ajoutez:

```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER = whatsapp:+14155238886
```

### Étape 5: Tester (30 sec)
1. Lancez l'app Yombal Yoon
2. Allez dans l'onboarding
3. Sélectionnez un rôle
4. Entrez votre numéro (+221...)
5. Vérifiez la réception du code WhatsApp

## ✅ C'est tout !

Le système OTP est maintenant actif et fonctionnel.

## 📱 Test rapide

```bash
# Tester l'envoi d'OTP
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+221771234567",
    "method": "whatsapp"
  }'
```

Réponse attendue:
```json
{
  "success": true,
  "message": "Code OTP envoyé par WhatsApp",
  "method": "whatsapp"
}
```

## 🆘 Problèmes courants

### "Code non reçu"
- Vérifiez que vous avez rejoint le sandbox WhatsApp
- Vérifiez le format du numéro (+221...)
- Consultez les logs Twilio

### "Erreur Twilio"
- Vérifiez les credentials dans les secrets
- Vérifiez le solde du compte Twilio
- Consultez les logs de l'Edge Function

### "Code invalide"
- Vérifiez que le code n'a pas expiré (10 min)
- Vérifiez le nombre de tentatives (max 5)
- Demandez un nouveau code

## 💰 Coûts

### Mode Test (Gratuit)
- $15.50 de crédit d'essai
- Suffisant pour ~3000 messages WhatsApp

### Mode Production
- WhatsApp: ~$0.0042/message
- SMS: ~$0.05-$0.08/message
- **Recommandation**: WhatsApp est 10x moins cher

## 📚 Documentation complète

- `OTP_PRODUCTION_SETUP.md`: Guide complet
- `TWILIO_SECRETS_SETUP.md`: Configuration détaillée
- `OTP_IMPLEMENTATION_SUMMARY.md`: Résumé technique

## 🎯 Prochaines étapes

1. ✅ Tester en mode sandbox
2. ✅ Vérifier les coûts
3. 🔄 Passer en production (optionnel):
   - Upgrader le compte Twilio
   - Demander un numéro WhatsApp Business
   - Retirer les limitations du sandbox

## 💡 Astuce

Pour économiser des crédits pendant les tests:
- Utilisez toujours le même numéro de test
- Ajoutez-le dans "Verified Caller IDs" sur Twilio
- Les messages vers ces numéros ne consomment pas de crédits

## 🔗 Liens utiles

- [Dashboard Twilio](https://console.twilio.com)
- [Documentation Twilio](https://www.twilio.com/docs)
- [Supabase Dashboard](https://supabase.com/dashboard/project/drxtaxepofuoelplgrei)
- [Logs Edge Functions](https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions)

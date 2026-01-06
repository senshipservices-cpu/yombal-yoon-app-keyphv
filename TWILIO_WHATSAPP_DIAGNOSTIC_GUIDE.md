
# 🔍 Guide de Diagnostic WhatsApp Twilio

## Problème : WhatsApp ne reçoit pas les codes OTP

### Étape 1 : Vérifier la Configuration Twilio

1. **Connectez-vous à [Twilio Console](https://console.twilio.com/)**

2. **Vérifiez votre numéro +16822819620** :
   - Allez dans **Phone Numbers** → **Manage** → **Active numbers**
   - Cliquez sur +16822819620
   - Vérifiez que **Messaging** est activé
   - Vérifiez que **WhatsApp** est activé (pas seulement SMS)

3. **Vérifiez le Sender WhatsApp** :
   - Allez dans **Messaging** → **Senders** → **WhatsApp senders**
   - Votre numéro +16822819620 doit apparaître ici
   - Statut doit être **Active** ou **Approved**

### Étape 2 : Vérifier le Template WhatsApp

WhatsApp nécessite des templates pré-approuvés pour les messages commerciaux.

#### Option A : Utiliser le Sandbox (Test Rapide)

1. Allez dans **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Suivez les instructions pour rejoindre le Sandbox
3. Envoyez le message de jointure depuis votre téléphone
4. Testez l'envoi d'OTP

**Limitations du Sandbox** :
- Gratuit mais limité
- Les utilisateurs doivent d'abord envoyer un message au numéro Twilio
- Pas adapté pour la production

#### Option B : Créer un Template Approuvé (Production)

1. Allez dans **Messaging** → **Content Editor** → **Create Template**
2. Créez un template pour OTP :

```
Nom du template : yombal_yoon_otp
Catégorie : AUTHENTICATION
Langue : French (fr)

Contenu :
Votre code OTP Yombal Yoon est : {{1}}. Valide pendant 10 minutes.
```

3. Soumettez pour approbation (24-48h)
4. Une fois approuvé, modifiez votre Edge Function

### Étape 3 : Modifier l'Edge Function pour Utiliser le Template

Si vous utilisez un template approuvé, modifiez votre Edge Function :

```typescript
// Au lieu de :
body: new URLSearchParams({
  From: fromNumber,
  To: toNumber,
  Body: `Votre code OTP Yombal Yoon est : ${otp}. Valide pendant 10 minutes.`,
}),

// Utilisez :
body: new URLSearchParams({
  From: fromNumber,
  To: toNumber,
  ContentSid: 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // SID du template approuvé
  ContentVariables: JSON.stringify({ "1": otp }),
}),
```

### Étape 4 : Vérifier les Logs Twilio

1. Allez dans **Monitor** → **Logs** → **Messaging**
2. Cherchez les messages récents vers votre numéro de test
3. Vérifiez le statut :
   - **Delivered** ✅ : Message reçu
   - **Failed** ❌ : Vérifiez l'erreur
   - **Undelivered** ⚠️ : Problème de livraison

### Étape 5 : Codes d'Erreur Courants

| Code | Signification | Solution |
|------|---------------|----------|
| 63007 | Destinataire pas sur WhatsApp | Fallback SMS automatique ✅ |
| 63016 | Message non délivré | Vérifier le template |
| 21211 | Numéro invalide | Vérifier le format du numéro |
| 21408 | Permission refusée | Activer WhatsApp sur le numéro |
| 63003 | Template non approuvé | Utiliser un template approuvé |

### Étape 6 : Tester avec un Numéro Réel

1. Assurez-vous que le numéro de test est au format international : `+221XXXXXXXXX`
2. Le destinataire doit avoir WhatsApp installé
3. Le destinataire doit avoir accepté les messages commerciaux (si template)

### Étape 7 : Vérifier les Secrets Supabase

```bash
# Vérifier les secrets
supabase secrets list --project-ref drxtaxepofuoelplgrei

# Mettre à jour si nécessaire
supabase secrets set TWILIO_WHATSAPP_NUMBER=+16822819620 --project-ref drxtaxepofuoelplgrei
```

### Étape 8 : Vérifier les Logs de l'Edge Function

1. Allez dans **Supabase Dashboard** → **Edge Functions** → **send-otp-twilio**
2. Cliquez sur **Logs**
3. Cherchez les messages :
   - `📱 TENTATIVE 1/2 : Envoi via WhatsApp`
   - `✅ OTP envoyé avec succès via WhatsApp`
   - `❌ Erreur WhatsApp (Code XXX)`

### Étape 9 : Test Manuel avec cURL

Testez directement l'API Twilio :

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  --data-urlencode "From=whatsapp:+16822819620" \
  --data-urlencode "To=whatsapp:+221XXXXXXXXX" \
  --data-urlencode "Body=Test WhatsApp" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

### Étape 10 : Contacter le Support Twilio

Si rien ne fonctionne :
1. Allez sur [Twilio Support](https://support.twilio.com/)
2. Créez un ticket avec :
   - Votre Account SID
   - Le numéro +16822819620
   - Les logs d'erreur
   - La demande d'activation WhatsApp

## 🎯 Solution Rapide : Utiliser le Sandbox

Pour tester immédiatement :

1. **Rejoindre le Sandbox** :
   - Envoyez `join <sandbox-code>` au numéro Sandbox Twilio depuis WhatsApp
   - Le code est visible dans **Messaging** → **Try it out**

2. **Modifier temporairement l'Edge Function** :
   - Utilisez le numéro Sandbox au lieu de +16822819620
   - Testez l'envoi d'OTP

3. **Passer en Production** :
   - Une fois le test réussi, créez un template approuvé
   - Revenez à votre numéro +16822819620

## 📊 Comparaison des Coûts

| Méthode | Coût par message | Avantages |
|---------|------------------|-----------|
| WhatsApp | ~$0.005 | ✅ Très économique |
| SMS | ~$0.075 | ⚠️ Plus cher (15x) |

**Économie potentielle** : En utilisant WhatsApp en priorité, vous économisez **93%** sur les coûts de messagerie !

## ✅ Checklist Finale

- [ ] WhatsApp activé sur +16822819620 dans Twilio Console
- [ ] Template WhatsApp créé et approuvé (ou Sandbox activé)
- [ ] Secrets Supabase configurés correctement
- [ ] Edge Function déployée avec le bon code
- [ ] Test réussi avec un numéro réel
- [ ] Logs Twilio montrent "Delivered"
- [ ] Logs Supabase montrent "✅ OTP envoyé avec succès via WhatsApp"

## 🆘 Besoin d'Aide ?

Si vous êtes bloqué, vérifiez :
1. Les logs de l'Edge Function dans Supabase
2. Les logs de messagerie dans Twilio Console
3. Le statut du numéro +16822819620 dans Twilio

Le fallback SMS fonctionne déjà, donc vos utilisateurs peuvent toujours recevoir des codes OTP pendant que vous configurez WhatsApp ! 🎉

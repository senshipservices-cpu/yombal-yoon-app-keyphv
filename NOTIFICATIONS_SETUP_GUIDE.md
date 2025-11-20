
# 📧 GUIDE DE CONFIGURATION DES NOTIFICATIONS

## Vue d'ensemble

L'application Yombal Yoon envoie des notifications automatiques pour les livraisons inter-régions:
- **Email** vers `senshipservices@gmail.com` (via Resend)
- **WhatsApp** vers `+221765676486` (via Twilio)

---

## 1️⃣ Configuration Resend (Email)

### Étape 1: Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. Cliquer sur "Sign Up"
3. Créer un compte avec votre email

### Étape 2: Obtenir la clé API

1. Se connecter à Resend
2. Aller dans "API Keys"
3. Cliquer sur "Create API Key"
4. Nom: `Yombal Yoon Production`
5. Permission: `Sending access`
6. Copier la clé (format: `re_xxxxxxxxxxxxx`)

### Étape 3: Vérifier le domaine (optionnel mais recommandé)

1. Aller dans "Domains"
2. Cliquer sur "Add Domain"
3. Entrer votre domaine: `yombalyoon.com`
4. Suivre les instructions pour ajouter les enregistrements DNS
5. Attendre la vérification (quelques minutes à quelques heures)

**Note:** Sans domaine vérifié, les emails seront envoyés depuis `onboarding@resend.dev`

### Étape 4: Configurer le secret Supabase

```bash
# Dans votre terminal
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Test

Soumettre une demande de livraison inter-régions dans l'app.
Vérifier la réception de l'email à `senshipservices@gmail.com`.

---

## 2️⃣ Configuration Twilio (WhatsApp)

### Étape 1: Créer un compte Twilio

1. Aller sur [twilio.com](https://www.twilio.com)
2. Cliquer sur "Sign up"
3. Créer un compte (nécessite vérification téléphone)

### Étape 2: Activer WhatsApp Business API

1. Se connecter à Twilio Console
2. Aller dans "Messaging" > "Try it out" > "Send a WhatsApp message"
3. Suivre les instructions pour activer WhatsApp
4. **Important:** Twilio fournit un numéro sandbox pour les tests

### Étape 3: Obtenir les credentials

1. Dans Twilio Console, aller dans "Account" > "API keys & tokens"
2. Copier:
   - **Account SID** (format: `ACxxxxxxxxxxxxx`)
   - **Auth Token** (cliquer sur "Show" pour révéler)

### Étape 4: Configurer le numéro WhatsApp

**Pour les tests (Sandbox):**
- Numéro: `whatsapp:+14155238886` (fourni par Twilio)
- Le destinataire doit d'abord envoyer un message au sandbox

**Pour la production:**
1. Aller dans "Messaging" > "WhatsApp" > "Senders"
2. Cliquer sur "Request to enable my Twilio number for WhatsApp"
3. Suivre le processus d'approbation (peut prendre plusieurs jours)

### Étape 5: Configurer les secrets Supabase

```bash
# Dans votre terminal
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx

# Pour le sandbox (tests)
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Pour la production (après approbation)
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+221XXXXXXXXX
```

### Étape 6: Activer le destinataire (Sandbox uniquement)

Pour recevoir des messages WhatsApp en mode sandbox:

1. Ouvrir WhatsApp sur le téléphone `+221765676486`
2. Envoyer un message au numéro sandbox: `+1 415 523 8886`
3. Message à envoyer: `join <code>` (le code est fourni par Twilio)
4. Attendre la confirmation

### Test

Soumettre une demande de livraison inter-régions dans l'app.
Vérifier la réception du message WhatsApp sur `+221765676486`.

---

## 3️⃣ Vérification de la Configuration

### Vérifier les secrets Supabase

```bash
# Lister tous les secrets
supabase secrets list

# Devrait afficher:
# - RESEND_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - TWILIO_WHATSAPP_FROM
```

### Tester l'Edge Function

```bash
# Test manuel de l'Edge Function
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-intercity-notifications \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "Test Sender",
    "senderPhone": "+221771234567",
    "recipientName": "Test Recipient",
    "recipientPhone": "+221779876543",
    "departureRegion": "Dakar Métropolitaine",
    "destinationRegion": "Thiès",
    "destinationDepartment": "Thiès",
    "description": "Test de notification",
    "pricingTotal": 5000
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "email": {
    "success": true
  },
  "whatsapp": {
    "success": true
  },
  "message": "Notifications envoyées avec succès"
}
```

---

## 4️⃣ Logs et Débogage

### Consulter les logs Edge Function

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet `drxtaxepofuoelplgrei`
3. Aller dans "Edge Functions" > "send-intercity-notifications"
4. Cliquer sur "Logs"

### Erreurs courantes

#### Email ne s'envoie pas

**Erreur:** `Email service not configured`
- **Solution:** Vérifier que `RESEND_API_KEY` est configuré

**Erreur:** `Email failed: 403 Forbidden`
- **Solution:** Vérifier que la clé API Resend est valide

**Erreur:** `Email failed: Domain not verified`
- **Solution:** Vérifier le domaine dans Resend ou utiliser le domaine par défaut

#### WhatsApp ne s'envoie pas

**Erreur:** `WhatsApp service not configured`
- **Solution:** Vérifier que `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN` sont configurés

**Erreur:** `WhatsApp failed: 401 Unauthorized`
- **Solution:** Vérifier que les credentials Twilio sont corrects

**Erreur:** `WhatsApp failed: 21211 Invalid 'To' Phone Number`
- **Solution:** Le destinataire doit d'abord activer le sandbox (voir Étape 6)

---

## 5️⃣ Coûts

### Resend

**Plan gratuit:**
- 100 emails/jour
- 3,000 emails/mois
- Suffisant pour les tests

**Plan payant:**
- À partir de $20/mois
- 50,000 emails/mois
- Domaine personnalisé

### Twilio

**WhatsApp Sandbox (gratuit):**
- Gratuit pour les tests
- Limité à quelques destinataires
- Messages limités

**WhatsApp Business API (payant):**
- Coût par message: ~$0.005 - $0.01 USD
- Frais d'activation: Variable selon le pays
- Nécessite approbation Meta

**Recommandation:** Commencer avec le sandbox pour les tests, puis passer à la production.

---

## 6️⃣ Checklist de Production

Avant de déployer en production:

- [ ] Compte Resend créé et vérifié
- [ ] Domaine email vérifié (optionnel mais recommandé)
- [ ] Clé API Resend configurée dans Supabase
- [ ] Compte Twilio créé et vérifié
- [ ] WhatsApp Business API approuvé (ou sandbox activé)
- [ ] Credentials Twilio configurés dans Supabase
- [ ] Numéro WhatsApp configuré
- [ ] Tests effectués avec succès
- [ ] Logs vérifiés
- [ ] Budget défini pour les coûts

---

## 📞 Support

**Resend:**
- Documentation: [resend.com/docs](https://resend.com/docs)
- Support: support@resend.com

**Twilio:**
- Documentation: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Support: [twilio.com/help](https://www.twilio.com/help)

**Supabase:**
- Documentation: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- Discord: [discord.supabase.com](https://discord.supabase.com)

---

**Guide créé le:** 19 Janvier 2025  
**Version:** 1.0.0

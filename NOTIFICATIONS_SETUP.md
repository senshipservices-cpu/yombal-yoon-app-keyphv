
# Configuration des Notifications Yombal Yoon

Ce document explique comment configurer les notifications Email et WhatsApp pour le module "Livraison Inter-Régions".

## 📋 Vue d'ensemble

Lorsqu'un utilisateur clique sur le bouton **COMMANDER** dans le formulaire "Livraison Inter régions", l'application envoie automatiquement des notifications à l'équipe Yombal Yoon via :

- **Email** : senshipservices@gmail.com
- **WhatsApp** : +221 77 567 64 86

## 🔧 Configuration requise

### 1. Configuration Email (Resend)

Pour envoyer des emails, nous utilisons le service **Resend** (https://resend.com).

#### Étapes de configuration :

1. **Créer un compte Resend** :
   - Allez sur https://resend.com
   - Créez un compte gratuit (100 emails/jour gratuits)

2. **Obtenir votre clé API** :
   - Dans le dashboard Resend, allez dans "API Keys"
   - Créez une nouvelle clé API
   - Copiez la clé (format : `re_xxxxxxxxxxxxx`)

3. **Configurer la clé dans Supabase** :
   ```bash
   # Via Supabase Dashboard :
   # 1. Allez dans votre projet Supabase
   # 2. Settings > Edge Functions > Secrets
   # 3. Ajoutez un nouveau secret :
   #    Nom : RESEND_API_KEY
   #    Valeur : votre_clé_resend
   ```

4. **Vérifier votre domaine (optionnel mais recommandé)** :
   - Dans Resend, allez dans "Domains"
   - Ajoutez votre domaine (ex: yombalyoon.com)
   - Configurez les enregistrements DNS
   - Une fois vérifié, modifiez le champ `from` dans l'Edge Function :
     ```typescript
     from: 'Yombal Yoon <notifications@yombalyoon.com>'
     ```

### 2. Configuration WhatsApp (Twilio)

Pour envoyer des messages WhatsApp, nous utilisons **Twilio** (https://www.twilio.com).

#### Étapes de configuration :

1. **Créer un compte Twilio** :
   - Allez sur https://www.twilio.com/try-twilio
   - Créez un compte gratuit (crédit d'essai inclus)

2. **Obtenir vos identifiants** :
   - Dans le dashboard Twilio, notez :
     - **Account SID** (format : `ACxxxxxxxxxxxxx`)
     - **Auth Token** (cliquez sur "Show" pour le voir)

3. **Configurer WhatsApp** :
   
   **Option A : Sandbox WhatsApp (pour les tests)** :
   - Dans Twilio Console, allez dans "Messaging > Try it out > Send a WhatsApp message"
   - Suivez les instructions pour activer le sandbox
   - Envoyez le code d'activation au numéro Twilio depuis le WhatsApp de l'équipe (+221 77 567 64 86)
   - Le numéro sandbox est : `whatsapp:+14155238886`

   **Option B : Numéro WhatsApp Business (pour la production)** :
   - Demandez un numéro WhatsApp Business via Twilio
   - Suivez le processus de vérification Facebook Business
   - Une fois approuvé, utilisez votre numéro dédié

4. **Configurer les secrets dans Supabase** :
   ```bash
   # Via Supabase Dashboard :
   # Settings > Edge Functions > Secrets
   
   # Ajoutez ces 3 secrets :
   
   # 1. Account SID
   Nom : TWILIO_ACCOUNT_SID
   Valeur : ACxxxxxxxxxxxxx
   
   # 2. Auth Token
   Nom : TWILIO_AUTH_TOKEN
   Valeur : votre_auth_token
   
   # 3. Numéro WhatsApp (sandbox ou business)
   Nom : TWILIO_WHATSAPP_NUMBER
   Valeur : whatsapp:+14155238886  (ou votre numéro business)
   ```

## 🧪 Test des notifications

### Test Email :

1. Remplissez le formulaire "Livraison Inter régions"
2. Cliquez sur "COMMANDER"
3. Vérifiez la boîte mail : senshipservices@gmail.com
4. Vous devriez recevoir un email avec tous les détails de la demande

### Test WhatsApp :

1. Assurez-vous que le numéro +221 77 567 64 86 a activé le sandbox Twilio (si vous utilisez le sandbox)
2. Remplissez le formulaire et cliquez sur "COMMANDER"
3. Vérifiez WhatsApp sur le téléphone +221 77 567 64 86
4. Vous devriez recevoir un message avec tous les détails

## 📊 Vérification des logs

Pour vérifier si les notifications sont envoyées correctement :

1. Allez dans Supabase Dashboard
2. Edge Functions > send-intercity-notifications > Logs
3. Vous verrez :
   - ✅ Email sent successfully
   - ✅ WhatsApp message sent successfully
   - Ou les erreurs si quelque chose ne fonctionne pas

## 🔍 Dépannage

### Email ne fonctionne pas :

- Vérifiez que `RESEND_API_KEY` est bien configuré dans Supabase
- Vérifiez que votre compte Resend n'a pas atteint la limite quotidienne
- Vérifiez les logs de l'Edge Function pour voir l'erreur exacte

### WhatsApp ne fonctionne pas :

- Vérifiez que les 3 secrets Twilio sont bien configurés
- Si vous utilisez le sandbox, vérifiez que le numéro destinataire a bien activé le sandbox
- Vérifiez que votre compte Twilio a du crédit
- Vérifiez les logs de l'Edge Function pour voir l'erreur exacte

### Les deux échouent :

- Vérifiez votre connexion Internet
- Vérifiez que l'Edge Function `send-intercity-notifications` est bien déployée
- Vérifiez les logs Supabase pour voir les erreurs

## 💰 Coûts

### Resend :
- **Gratuit** : 100 emails/jour, 3 000 emails/mois
- **Pro** : $20/mois pour 50 000 emails/mois

### Twilio WhatsApp :
- **Sandbox** : Gratuit pour les tests (crédit d'essai)
- **Production** : ~$0.005 par message (varie selon le pays)
- Crédit d'essai Twilio : $15 (suffisant pour ~3000 messages)

## 📝 Notes importantes

1. **Pas de traitement automatique** : Les demandes de livraison inter-régions ne sont PAS assignées automatiquement aux livreurs. L'équipe Yombal Yoon doit contacter manuellement le client.

2. **Notifications asynchrones** : Les notifications sont envoyées en arrière-plan. Même si elles échouent, la demande est quand même enregistrée dans la base de données.

3. **Fallback** : Si les notifications échouent, vous pouvez toujours consulter les demandes dans la base de données Supabase (table `intercity_deliveries`).

4. **Sécurité** : Ne partagez jamais vos clés API publiquement. Elles sont stockées de manière sécurisée dans Supabase Edge Functions Secrets.

## 🚀 Mise en production

Avant de passer en production :

1. ✅ Vérifiez votre domaine email dans Resend
2. ✅ Passez du sandbox Twilio à un numéro WhatsApp Business
3. ✅ Configurez un budget d'alerte dans Twilio
4. ✅ Testez avec plusieurs demandes pour vérifier la fiabilité
5. ✅ Configurez une adresse email de secours si nécessaire

## 📞 Support

Pour toute question sur la configuration :
- Documentation Resend : https://resend.com/docs
- Documentation Twilio : https://www.twilio.com/docs/whatsapp
- Support Supabase : https://supabase.com/docs/guides/functions

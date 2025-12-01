
# Configuration des secrets Twilio pour Supabase

## Méthode 1: Via le Dashboard Supabase (Recommandé)

1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet: **drxtaxepofuoelplgrei**
3. Allez dans **Edge Functions** (menu de gauche)
4. Cliquez sur **Settings** ou **Secrets**
5. Ajoutez les secrets suivants:

### Secrets à ajouter:

| Nom du secret | Valeur | Description |
|---------------|--------|-------------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Account SID depuis le dashboard Twilio |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Auth Token depuis le dashboard Twilio |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` | Numéro WhatsApp Twilio (sandbox ou production) |
| `TWILIO_SMS_NUMBER` | `+1234567890` | Numéro SMS Twilio (optionnel, pour fallback) |

## Méthode 2: Via Supabase CLI

Si vous avez installé Supabase CLI:

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Ajouter les secrets
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
supabase secrets set TWILIO_SMS_NUMBER=+1234567890
```

## Obtenir les credentials Twilio

### 1. Account SID et Auth Token

1. Allez sur [console.twilio.com](https://console.twilio.com)
2. Connectez-vous à votre compte
3. Sur la page d'accueil, vous verrez:
   - **Account SID**: Commence par "AC..."
   - **Auth Token**: Cliquez sur "Show" pour le révéler

### 2. Numéro WhatsApp (Sandbox pour tests)

1. Dans le menu Twilio, allez dans **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Suivez les instructions pour activer le sandbox
3. Le numéro par défaut est: `whatsapp:+14155238886`
4. **Important**: Les utilisateurs doivent d'abord envoyer un message au sandbox pour recevoir des messages

#### Activer le sandbox WhatsApp:
- Envoyez un message WhatsApp à `+1 415 523 8886`
- Contenu du message: `join [votre-sandbox-keyword]`
- Vous recevrez une confirmation

### 3. Numéro SMS (Optionnel)

1. Dans le menu Twilio, allez dans **Phone Numbers** > **Manage** > **Buy a number**
2. Sélectionnez un numéro avec capacité SMS
3. Achetez le numéro (coût: ~$1/mois + frais SMS)
4. Utilisez ce numéro au format: `+1234567890`

## Vérification de la configuration

Après avoir ajouté les secrets, testez l'Edge Function:

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

## Coûts Twilio

### Compte d'essai (Trial)
- **Crédit gratuit**: $15.50
- **Limitations**: 
  - Numéros vérifiés uniquement
  - Messages préfixés par "Sent from your Twilio trial account"
  - Sandbox WhatsApp uniquement

### Compte payant
- **WhatsApp**: ~$0.0042 par message (Sénégal)
- **SMS**: ~$0.05-$0.08 par message (Sénégal)
- **Numéro de téléphone**: ~$1/mois

### Recommandation
Pour la production, passez à un compte payant et demandez l'approbation d'un numéro WhatsApp Business pour:
- Retirer les limitations du sandbox
- Envoyer des messages à tous les numéros
- Personnaliser les messages
- Meilleure délivrabilité

## Sécurité

⚠️ **IMPORTANT**: Ne jamais exposer vos credentials Twilio dans:
- Le code source
- Les commits Git
- Les fichiers de configuration
- Les logs

✅ **Toujours utiliser**:
- Les secrets Supabase
- Les variables d'environnement
- Les Edge Functions pour les appels Twilio

## Support

Si vous rencontrez des problèmes:

1. **Vérifier les logs Supabase**:
   ```bash
   supabase functions logs send-otp-twilio
   ```

2. **Vérifier les logs Twilio**:
   - Allez dans **Monitor** > **Logs** > **Messaging**

3. **Tester les credentials**:
   ```bash
   curl -X GET \
     "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
     -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
   ```

## Prochaines étapes

1. ✅ Configurer les secrets Twilio
2. ✅ Tester l'envoi d'OTP en mode sandbox
3. ✅ Vérifier la réception des messages
4. ✅ Tester la vérification des codes
5. 🔄 Passer en production (optionnel):
   - Upgrader le compte Twilio
   - Demander un numéro WhatsApp Business
   - Soumettre les templates de messages
   - Mettre à jour les secrets avec les nouveaux numéros

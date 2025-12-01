
# OTP Production System - Twilio WhatsApp & SMS

## Vue d'ensemble

Le système OTP de Yombal Yoon utilise Twilio pour envoyer des codes de vérification par **WhatsApp** (méthode principale) avec un **fallback automatique vers SMS** si WhatsApp échoue.

## Architecture

### 1. Base de données
- **Table**: `phone_verifications`
- **Colonnes principales**:
  - `phone_number`: Numéro de téléphone au format international (+221...)
  - `otp_code`: Code à 6 chiffres généré aléatoirement
  - `verification_method`: 'whatsapp' ou 'sms'
  - `is_verified`: Statut de vérification
  - `attempts`: Nombre de tentatives (max 5)
  - `expires_at`: Expiration du code (10 minutes)

### 2. Edge Function Supabase
- **Nom**: `send-otp-twilio`
- **Endpoints**:
  - `/send`: Envoie un code OTP
  - `/verify`: Vérifie un code OTP

### 3. Frontend
- **Context**: `OTPContext` - Gestion de l'état de vérification
- **Component**: `PhoneVerificationModal` - Interface utilisateur

## Configuration Twilio

### Étape 1: Créer un compte Twilio
1. Allez sur [twilio.com](https://www.twilio.com)
2. Créez un compte (essai gratuit disponible)
3. Vérifiez votre email et numéro de téléphone

### Étape 2: Obtenir les credentials
1. Dans le dashboard Twilio, notez:
   - **Account SID**: Identifiant de votre compte
   - **Auth Token**: Token d'authentification

### Étape 3: Configurer WhatsApp
1. Allez dans **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Suivez les instructions pour activer le sandbox WhatsApp
3. Le numéro WhatsApp de test est: `whatsapp:+14155238886`
4. Pour la production, demandez l'approbation d'un numéro WhatsApp Business

### Étape 4: Configurer SMS (optionnel mais recommandé)
1. Allez dans **Phone Numbers** > **Buy a number**
2. Achetez un numéro de téléphone Twilio
3. Notez ce numéro pour la configuration

### Étape 5: Configurer les secrets Supabase

Exécutez ces commandes dans votre terminal (remplacez les valeurs):

```bash
# Account SID Twilio
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Auth Token Twilio
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Numéro WhatsApp (sandbox ou production)
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Numéro SMS (optionnel, pour fallback)
supabase secrets set TWILIO_SMS_NUMBER=+1234567890
```

Ou via le dashboard Supabase:
1. Allez dans **Edge Functions** > **Settings**
2. Ajoutez les secrets dans la section **Secrets**

## Coûts Twilio

### WhatsApp
- **Sandbox (test)**: Gratuit
- **Production**: ~$0.005 par message (varie selon le pays)
- **Sénégal**: ~$0.0042 par message WhatsApp

### SMS
- **Sénégal**: ~$0.05 - $0.08 par SMS
- **Recommandation**: WhatsApp est ~10x moins cher que SMS

### Estimation mensuelle
Pour 1000 vérifications/mois:
- **WhatsApp uniquement**: ~$5/mois
- **SMS uniquement**: ~$50-80/mois
- **WhatsApp + SMS fallback (10% SMS)**: ~$10/mois

## Utilisation dans l'application

### 1. Envoyer un OTP

```typescript
import { useOTP } from '@/contexts/OTPContext';

const { sendOTP } = useOTP();

// Envoyer par WhatsApp (par défaut)
const result = await sendOTP('+221771234567', 'whatsapp', userId);

// Envoyer par SMS
const result = await sendOTP('+221771234567', 'sms', userId);

if (result.success) {
  console.log('Code envoyé via:', result.method);
}
```

### 2. Vérifier un OTP

```typescript
import { useOTP } from '@/contexts/OTPContext';

const { verifyPhone } = useOTP();

const result = await verifyPhone('+221771234567', '123456', userId);

if (result.success) {
  console.log('Numéro vérifié !');
}
```

### 3. Utiliser le modal de vérification

```typescript
import PhoneVerificationModal from '@/components/PhoneVerificationModal';

<PhoneVerificationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    console.log('Vérification réussie !');
    // Rediriger ou mettre à jour l'UI
  }}
/>
```

## Flux de vérification

1. **Utilisateur entre son numéro**: Format international (+221...)
2. **Sélection de la méthode**: WhatsApp ou SMS
3. **Envoi du code**:
   - Génération d'un code à 6 chiffres
   - Stockage dans la base de données (expire dans 10 min)
   - Envoi via Twilio WhatsApp
   - Si WhatsApp échoue → Fallback automatique vers SMS
4. **Utilisateur entre le code**: 6 chiffres
5. **Vérification**:
   - Validation du code
   - Vérification de l'expiration
   - Limite de 5 tentatives
   - Mise à jour du profil utilisateur

## Sécurité

### Mesures implémentées
- ✅ Codes à 6 chiffres aléatoires
- ✅ Expiration après 10 minutes
- ✅ Limite de 5 tentatives par code
- ✅ Stockage sécurisé dans Supabase
- ✅ RLS (Row Level Security) activé
- ✅ Nettoyage automatique des codes expirés

### Recommandations
- 🔒 Ne jamais exposer les credentials Twilio dans le code
- 🔒 Utiliser uniquement les Edge Functions pour Twilio
- 🔒 Implémenter un rate limiting (ex: max 3 codes/heure par numéro)
- 🔒 Logger les tentatives suspectes

## Tests

### Mode Sandbox WhatsApp
1. Envoyez "join [sandbox-keyword]" au numéro WhatsApp de Twilio
2. Vous recevrez une confirmation
3. Testez l'envoi de codes OTP

### Numéros de test Twilio
Twilio fournit des numéros de test qui ne consomment pas de crédits:
- Ajoutez-les dans **Phone Numbers** > **Verified Caller IDs**

## Monitoring

### Dashboard Twilio
- Consultez les logs d'envoi dans **Monitor** > **Logs**
- Vérifiez les erreurs et les taux de livraison

### Supabase Logs
```bash
# Voir les logs de l'Edge Function
supabase functions logs send-otp-twilio
```

### Base de données
```sql
-- Voir les vérifications récentes
SELECT * FROM phone_verifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Statistiques par méthode
SELECT 
  verification_method,
  COUNT(*) as total,
  SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified
FROM phone_verifications
GROUP BY verification_method;
```

## Dépannage

### Problème: Code non reçu
- Vérifier que le numéro est au format international (+221...)
- Vérifier les logs Twilio pour les erreurs
- Pour WhatsApp: vérifier que l'utilisateur a rejoint le sandbox
- Essayer le fallback SMS

### Problème: Code invalide
- Vérifier que le code n'a pas expiré (10 min)
- Vérifier le nombre de tentatives (max 5)
- Vérifier les logs de la base de données

### Problème: Erreur Twilio
- Vérifier les credentials dans les secrets Supabase
- Vérifier le solde du compte Twilio
- Consulter les logs Twilio pour plus de détails

## Migration depuis le mode démo

L'ancien système utilisait un code fixe "123456". Le nouveau système:
- ✅ Génère des codes aléatoires
- ✅ Envoie de vrais messages via Twilio
- ✅ Valide les numéros de téléphone
- ✅ Stocke les vérifications en base de données

Aucune migration de données n'est nécessaire car les anciennes vérifications étaient en local storage uniquement.

## Support

Pour toute question:
1. Consultez la [documentation Twilio](https://www.twilio.com/docs)
2. Vérifiez les logs Supabase
3. Consultez les logs Twilio
4. Contactez le support Twilio si nécessaire

## Prochaines étapes

### Améliorations possibles
- [ ] Rate limiting par IP/numéro
- [ ] Détection de fraude
- [ ] Support multi-langues pour les messages
- [ ] Analytics détaillés
- [ ] Webhooks Twilio pour le statut de livraison
- [ ] Support de plus de canaux (Telegram, etc.)

### Production WhatsApp
Pour passer en production WhatsApp:
1. Demander l'approbation d'un numéro WhatsApp Business
2. Soumettre les templates de messages à Twilio
3. Attendre l'approbation (quelques jours)
4. Mettre à jour `TWILIO_WHATSAPP_NUMBER` avec le nouveau numéro

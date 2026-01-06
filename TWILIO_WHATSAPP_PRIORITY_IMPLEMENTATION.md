
# Implémentation de la Priorité WhatsApp sur SMS avec Twilio

## 🎯 Objectif

Minimiser les coûts d'envoi de notifications en priorisant WhatsApp sur SMS, avec un système de fallback automatique intelligent.

## 💰 Économies de Coûts

- **WhatsApp** : ~0.005 USD par message (environ 3 FCFA)
- **SMS** : ~0.05 USD par message (environ 30 FCFA)
- **Économie** : ~90% de réduction des coûts en utilisant WhatsApp

## 🔧 Configuration Requise

### Variables d'Environnement Supabase

Assurez-vous que ces secrets sont configurés dans Supabase :

```bash
# Twilio Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Numéros Twilio (PRIORITÉ : WhatsApp d'abord)
TWILIO_WHATSAPP_NUMBER=+14155238886  # Numéro WhatsApp Twilio
TWILIO_SMS_NUMBER=+1234567890         # Numéro SMS Twilio (fallback)

# Mode de production
IS_PRODUCTION_MODE=true
```

### Configuration WhatsApp Twilio

1. **Sandbox WhatsApp (Développement)**
   - Utilisez le sandbox Twilio pour les tests
   - Numéro par défaut : `+14155238886`
   - Les utilisateurs doivent envoyer un code d'activation

2. **Numéro WhatsApp Approuvé (Production)**
   - Demandez l'approbation d'un numéro WhatsApp Business
   - Créez des templates de messages pré-approuvés
   - Coût : ~$15/mois + frais de messages

## 🚀 Fonctionnement du Système

### Flux de Priorité Automatique

```
┌─────────────────────────────────────────────────────────┐
│                   ENVOI DE NOTIFICATION                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  TENTATIVE 1/2 : WhatsApp (Prioritaire - Coût Réduit)  │
│  • Format : whatsapp:+221XXXXXXXXX                      │
│  • Coût : ~3 FCFA par message                           │
└─────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                ✅ Succès      ❌ Échec
                    │               │
                    │               ▼
                    │   ┌─────────────────────────────────┐
                    │   │  TENTATIVE 2/2 : SMS (Fallback) │
                    │   │  • Format : +221XXXXXXXXX        │
                    │   │  • Coût : ~30 FCFA par message   │
                    │   └─────────────────────────────────┘
                    │               │
                    │       ┌───────┴───────┐
                    │       │               │
                    │   ✅ Succès      ❌ Échec
                    │       │               │
                    ▼       ▼               ▼
            ┌─────────────────────────────────────┐
            │  NOTIFICATION ENVOYÉE AVEC SUCCÈS   │
            │  • Méthode utilisée : whatsapp/sms  │
            │  • Logs détaillés disponibles       │
            └─────────────────────────────────────┘
```

### Codes d'Erreur WhatsApp Courants

Le système gère automatiquement ces erreurs et bascule vers SMS :

- **63007** : Destinataire pas sur WhatsApp
- **63016** : Message WhatsApp non délivré
- **21211** : Numéro de téléphone 'To' invalide
- **21408** : Permission d'envoyer un message WhatsApp refusée

## 📝 Fonctions Edge Mises à Jour

### 1. `send-otp-twilio`

**Utilisation** : Envoi de codes OTP pour vérification téléphonique

**Priorité** :
1. ✅ WhatsApp (si disponible et non explicitement désactivé)
2. ✅ SMS (fallback automatique)

**Exemple d'appel** :

```typescript
const { data, error } = await supabase.functions.invoke('send-otp-twilio', {
  body: {
    action: 'send',
    phoneNumber: '+221771234567',
    userId: 'user-uuid',
    method: 'whatsapp' // Optionnel, par défaut tente WhatsApp
  }
});

// Réponse
{
  success: true,
  message: "Code envoyé par WhatsApp",
  method: "whatsapp", // ou "sms" si fallback
  mode: "production"
}
```

### 2. `send-notification-unified`

**Utilisation** : Notifications unifiées pour tous les événements

**Priorité** :
1. ✅ WhatsApp (si disponible et opt-in utilisateur)
2. ✅ SMS (fallback automatique)

**Exemple d'appel** :

```typescript
const { data, error } = await supabase.functions.invoke('send-notification-unified', {
  body: {
    type: 'reservation_created',
    userId: 'user-uuid',
    title: '🚗 Nouvelle réservation !',
    message: 'Jean souhaite réserver 2 places pour Dakar → Thiès',
    phoneNumber: '+221771234567',
    channels: ['in_app', 'push', 'whatsapp'], // WhatsApp avec fallback SMS automatique
    metadata: {
      rideId: 'ride-uuid',
      reservationId: 'reservation-uuid'
    }
  }
});

// Réponse
{
  success: true,
  channels: {
    in_app: { success: true, id: 'notif-uuid' },
    push: { success: true },
    whatsapp: { success: true } // ou sms si fallback
  },
  mode: "production"
}
```

## 📊 Logs et Monitoring

### Logs Console

Le système génère des logs détaillés pour chaque tentative :

```
📱 TENTATIVE 1/2 : Envoi via WhatsApp (prioritaire pour réduire les coûts)
📤 Sending notification via WhatsApp from whatsapp:+14155238886 to whatsapp:+221771234567
✅ Notification envoyée avec succès via WhatsApp (coût réduit)
📊 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

En cas d'échec WhatsApp :

```
❌ Erreur WhatsApp (Code 63007): Recipient not on WhatsApp
🔄 TENTATIVE 2/2 : Fallback automatique vers SMS...
📤 Sending notification via SMS to +221771234567
ℹ️ Raison du fallback: WhatsApp failed (Code 63007): Recipient not on WhatsApp
✅ Notification envoyée avec succès via SMS (fallback)
📊 Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Logs Base de Données

Les notifications sont enregistrées dans la table `notification_logs` :

```sql
SELECT 
  user_id,
  channel,
  status,
  error_message,
  created_at
FROM notification_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

## 🧪 Tests

### Mode Test

En mode test (`IS_PRODUCTION_MODE=false`), les notifications ne sont pas réellement envoyées :

```typescript
// Réponse en mode test
{
  success: false,
  channels: {
    whatsapp: { 
      success: false, 
      error: 'Test mode - WhatsApp skipped' 
    },
    sms: { 
      success: false, 
      error: 'Test mode - SMS skipped' 
    }
  },
  mode: "test"
}
```

### Mode Production

En mode production (`IS_PRODUCTION_MODE=true`), les notifications sont envoyées avec priorité WhatsApp :

```typescript
// Réponse en mode production (succès WhatsApp)
{
  success: true,
  channels: {
    whatsapp: { success: true }
  },
  mode: "production"
}

// Réponse en mode production (fallback SMS)
{
  success: true,
  channels: {
    sms: { 
      success: true,
      details: "Fallback SMS après échec WhatsApp: WhatsApp failed (Code 63007)"
    }
  },
  mode: "production"
}
```

## 🔍 Diagnostic des Problèmes

### WhatsApp ne fonctionne pas

1. **Vérifier la configuration Twilio**
   ```bash
   # Dans Supabase Dashboard > Project Settings > Edge Functions > Secrets
   TWILIO_WHATSAPP_NUMBER=+14155238886  # Doit être configuré
   ```

2. **Vérifier le format du numéro**
   - Format requis : `whatsapp:+221XXXXXXXXX`
   - Le système formate automatiquement

3. **Vérifier l'activation WhatsApp**
   - Sandbox : L'utilisateur doit envoyer le code d'activation
   - Production : Le numéro doit être approuvé par Twilio

4. **Consulter les logs Twilio**
   - Allez sur console.twilio.com
   - Vérifiez les logs de messages
   - Identifiez les codes d'erreur

### SMS ne fonctionne pas (fallback)

1. **Vérifier la configuration**
   ```bash
   TWILIO_SMS_NUMBER=+1234567890  # Doit être configuré
   ```

2. **Vérifier le crédit Twilio**
   - Assurez-vous d'avoir du crédit sur votre compte

3. **Vérifier les restrictions géographiques**
   - Certains pays peuvent avoir des restrictions

## 💡 Bonnes Pratiques

### 1. Toujours Configurer les Deux Numéros

```bash
TWILIO_WHATSAPP_NUMBER=+14155238886  # Prioritaire
TWILIO_SMS_NUMBER=+1234567890         # Fallback
```

### 2. Monitorer les Coûts

- Suivez le ratio WhatsApp/SMS dans les logs
- Objectif : >80% de messages via WhatsApp

### 3. Opt-in WhatsApp

Demandez aux utilisateurs de s'inscrire à WhatsApp :

```typescript
// Dans user_profiles
{
  whatsapp_optin: true  // L'utilisateur accepte les notifications WhatsApp
}
```

### 4. Templates WhatsApp (Production)

Pour la production, créez des templates pré-approuvés :

```
Votre code OTP Yombal Yoon est : {{1}}. Valide pendant 10 minutes.
```

## 📈 Métriques de Succès

### Objectifs

- ✅ **>80%** des notifications via WhatsApp
- ✅ **<20%** des notifications via SMS (fallback)
- ✅ **<1%** d'échecs totaux

### Requête de Monitoring

```sql
SELECT 
  channel,
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY channel, status
ORDER BY count DESC;
```

## 🚨 Alertes

Configurez des alertes si :

- Le taux de fallback SMS dépasse 30%
- Le taux d'échec total dépasse 5%
- Les coûts mensuels dépassent le budget

## 📞 Support

En cas de problème :

1. Consultez les logs Edge Functions dans Supabase
2. Vérifiez les logs Twilio sur console.twilio.com
3. Contactez le support Twilio si nécessaire

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées dans Supabase
- [ ] Numéro WhatsApp Twilio configuré
- [ ] Numéro SMS Twilio configuré (fallback)
- [ ] Mode production activé (`IS_PRODUCTION_MODE=true`)
- [ ] Tests effectués en sandbox
- [ ] Monitoring configuré
- [ ] Budget Twilio défini
- [ ] Alertes configurées

## 🎉 Résultat

Avec cette implémentation, vous bénéficiez de :

- ✅ **90% de réduction des coûts** grâce à WhatsApp
- ✅ **Fiabilité maximale** avec fallback SMS automatique
- ✅ **Logs détaillés** pour le monitoring
- ✅ **Gestion intelligente des erreurs**
- ✅ **Expérience utilisateur optimale**

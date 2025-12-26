
# 🚀 Configuration Twilio en Mode LIVE (Production)

## Vue d'ensemble

Ce document explique comment passer Twilio du mode TEST/SANDBOX au mode LIVE/PRODUCTION pour l'application Yombal Yoon.

---

## 📋 Différences entre Mode Test et Mode Production

### Mode Test (Sandbox)
- ✅ Gratuit (crédit d'essai de $15.50)
- ⚠️ Numéro WhatsApp sandbox : `whatsapp:+14155238886`
- ⚠️ Les utilisateurs doivent d'abord envoyer "join [keyword]" au sandbox
- ⚠️ Messages préfixés par "Sent from your Twilio trial account"
- ⚠️ Limité aux numéros vérifiés dans le compte Twilio
- ⚠️ Pas de personnalisation complète des messages

### Mode Production (LIVE)
- ✅ Numéro WhatsApp Business dédié
- ✅ Envoi à tous les numéros sans restriction
- ✅ Messages personnalisés sans préfixe
- ✅ Meilleure délivrabilité
- ✅ Support professionnel
- 💰 Coûts : ~$0.0042 par message WhatsApp (Sénégal)

---

## 🔧 Étapes pour Passer en Mode Production

### Étape 1 : Upgrader le Compte Twilio

1. **Connectez-vous à Twilio Console** : https://console.twilio.com
2. **Allez dans Billing** : https://console.twilio.com/billing
3. **Cliquez sur "Upgrade"**
4. **Ajoutez une méthode de paiement** (carte bancaire)
5. **Confirmez l'upgrade**

### Étape 2 : Obtenir un Numéro WhatsApp Business

#### Option A : Demander un Numéro WhatsApp Business (Recommandé)

1. **Allez dans Messaging** > **Try it out** > **WhatsApp**
2. **Cliquez sur "Request to enable your Twilio number for WhatsApp"**
3. **Remplissez le formulaire** :
   - Nom de l'entreprise : Yombal Yoon
   - Site web : https://yombalyoon.com (ou votre site)
   - Description : Service de covoiturage et livraison au Sénégal
   - Cas d'usage : Envoi de codes OTP pour vérification d'identité
4. **Soumettez la demande**
5. **Attendez l'approbation** (généralement 1-3 jours ouvrables)

#### Option B : Utiliser un Numéro SMS (Alternative)

Si WhatsApp Business n'est pas approuvé immédiatement, vous pouvez utiliser SMS :

1. **Allez dans Phone Numbers** > **Buy a number**
2. **Sélectionnez le pays** : Sénégal (SN) ou un pays proche
3. **Filtrez par capacités** : SMS
4. **Achetez un numéro** (~$1-2/mois)
5. **Configurez le numéro** pour l'envoi de SMS

### Étape 3 : Configurer les Secrets Supabase en Production

Une fois que vous avez vos credentials de production, configurez-les dans Supabase :

#### Via Supabase Dashboard (Recommandé)

1. **Allez sur** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. **Cliquez sur** : Settings > Edge Functions > Secrets
3. **Ajoutez/Mettez à jour les secrets suivants** :

| Secret | Valeur Production | Description |
|--------|-------------------|-------------|
| `IS_PRODUCTION_MODE` | `true` | ✅ Active le mode production |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Votre Account SID (commence par AC) |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Votre Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+221XXXXXXXXX` | Votre numéro WhatsApp Business approuvé |
| `TWILIO_PHONE_NUMBER` | `+221XXXXXXXXX` | Votre numéro SMS (fallback) |

#### Via Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Configurer les secrets de production
supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX
```

### Étape 4 : Redéployer l'Edge Function

Après avoir mis à jour les secrets, redéployez la fonction Edge :

```bash
# Redéployer la fonction send-otp-twilio
supabase functions deploy send-otp-twilio

# Vérifier le déploiement
supabase functions list
```

### Étape 5 : Tester en Production

#### Test 1 : Envoi d'OTP via WhatsApp

```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "action": "send",
    "phoneNumber": "+221771234567",
    "method": "whatsapp"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Code envoyé par WhatsApp",
  "method": "whatsapp",
  "mode": "production"
}
```

#### Test 2 : Envoi d'OTP via SMS (Fallback)

```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "action": "send",
    "phoneNumber": "+221771234567",
    "method": "sms"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Code envoyé par SMS",
  "method": "sms",
  "mode": "production"
}
```

#### Test 3 : Vérification d'OTP

```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "action": "verify",
    "phoneNumber": "+221771234567",
    "otpCode": "123456",
    "userId": "user-uuid-here"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Numéro vérifié avec succès",
  "mode": "production"
}
```

---

## 📊 Vérification du Mode Actuel

### Dans les Logs Supabase

1. **Allez dans** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. **Cliquez sur** : Edge Functions > send-otp-twilio > Logs
3. **Recherchez** : Les logs doivent afficher `Mode: Production`

Exemple de log en production :
```
📤 Sending OTP via whatsapp from whatsapp:+221XXXXXXXXX to whatsapp:+221771234567 [Mode: Production]
✅ OTP sent successfully via whatsapp
```

### Dans l'Application

Lorsque vous testez l'application, les messages de succès doivent afficher :
- ✅ "Code envoyé par WhatsApp" (sans "(Mode Test)")
- ✅ "Numéro vérifié avec succès" (sans "(Mode Test)")

---

## 💰 Coûts Twilio en Production

### Coûts Mensuels Estimés

| Service | Coût Unitaire | Volume Mensuel | Coût Total |
|---------|---------------|----------------|------------|
| WhatsApp (Sénégal) | $0.0042/msg | 1000 messages | $4.20 |
| SMS (Sénégal) | $0.05-0.08/msg | 200 messages | $10-16 |
| Numéro WhatsApp | Gratuit | - | $0 |
| Numéro SMS | $1-2/mois | - | $1-2 |
| **Total Estimé** | - | - | **$15-22/mois** |

### Optimisation des Coûts

1. **Privilégier WhatsApp** : 12x moins cher que SMS
2. **Implémenter un cache OTP** : Éviter les renvois multiples
3. **Limiter les tentatives** : Maximum 3 OTP par numéro/jour
4. **Monitorer l'usage** : Alertes si dépassement de seuil

---

## 🔐 Sécurité en Production

### Bonnes Pratiques

1. ✅ **Ne jamais exposer les credentials** dans le code source
2. ✅ **Utiliser uniquement les secrets Supabase** pour stocker les credentials
3. ✅ **Activer l'authentification** sur les Edge Functions
4. ✅ **Limiter les tentatives OTP** (max 5 par numéro/heure)
5. ✅ **Logger tous les envois** pour audit
6. ✅ **Monitorer les coûts** via Twilio Console

### Configuration de Sécurité Twilio

1. **Allez dans** : https://console.twilio.com/settings/security
2. **Activez** :
   - ✅ Two-factor authentication
   - ✅ IP Access Control Lists (si applicable)
   - ✅ API Key restrictions
3. **Configurez les alertes** :
   - ✅ Alerte si dépense > $50/jour
   - ✅ Alerte si taux d'échec > 10%

---

## 🚨 Dépannage

### Problème 1 : "Twilio non configuré"

**Cause** : Les secrets Supabase ne sont pas définis ou incorrects

**Solution** :
```bash
# Vérifier les secrets
supabase secrets list

# Redéfinir les secrets
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Problème 2 : "WhatsApp number not approved"

**Cause** : Le numéro WhatsApp Business n'est pas encore approuvé

**Solution** :
1. Vérifier le statut de la demande dans Twilio Console
2. Utiliser SMS en attendant l'approbation
3. Contacter le support Twilio si délai > 5 jours

### Problème 3 : "Message not delivered"

**Cause** : Numéro invalide ou non joignable

**Solution** :
1. Vérifier le format du numéro : `+221XXXXXXXXX`
2. Vérifier que le numéro est actif
3. Essayer le fallback SMS si WhatsApp échoue
4. Consulter les logs Twilio : https://console.twilio.com/monitor/logs/messages

### Problème 4 : Mode toujours en "Test"

**Cause** : La variable `IS_PRODUCTION_MODE` n'est pas définie ou est à `false`

**Solution** :
```bash
# Définir le mode production
supabase secrets set IS_PRODUCTION_MODE=true

# Redéployer la fonction
supabase functions deploy send-otp-twilio

# Vérifier les logs
supabase functions logs send-otp-twilio --follow
```

---

## 📋 Checklist de Passage en Production

### Avant le Passage

- [ ] Compte Twilio upgradé (payant)
- [ ] Méthode de paiement ajoutée
- [ ] Numéro WhatsApp Business demandé
- [ ] Numéro SMS acheté (fallback)
- [ ] Credentials de production récupérés

### Configuration Supabase

- [ ] `IS_PRODUCTION_MODE=true` défini
- [ ] `TWILIO_ACCOUNT_SID` mis à jour
- [ ] `TWILIO_AUTH_TOKEN` mis à jour
- [ ] `TWILIO_WHATSAPP_NUMBER` mis à jour (production)
- [ ] `TWILIO_PHONE_NUMBER` mis à jour (production)
- [ ] Edge Function redéployée

### Tests

- [ ] Test d'envoi WhatsApp réussi
- [ ] Test d'envoi SMS réussi
- [ ] Test de vérification OTP réussi
- [ ] Logs affichent "Mode: Production"
- [ ] Messages sans préfixe "trial account"
- [ ] Envoi à des numéros non vérifiés fonctionne

### Monitoring

- [ ] Alertes Twilio configurées
- [ ] Dashboard de monitoring configuré
- [ ] Logs Supabase surveillés
- [ ] Budget mensuel défini

---

## 📞 Support

### Twilio Support
- **Console** : https://console.twilio.com
- **Support** : https://support.twilio.com
- **Documentation** : https://www.twilio.com/docs

### Supabase Support
- **Dashboard** : https://supabase.com/dashboard
- **Documentation** : https://supabase.com/docs
- **Discord** : https://discord.supabase.com

### Yombal Yoon Support
- **Email** : senshipservices@gmail.com
- **WhatsApp** : +221 76 567 64 86

---

## ✅ Résumé

Pour passer Twilio en mode LIVE (Production) :

1. ✅ **Upgrader le compte Twilio** (ajouter méthode de paiement)
2. ✅ **Obtenir un numéro WhatsApp Business** (demande d'approbation)
3. ✅ **Configurer les secrets Supabase** avec les credentials de production
4. ✅ **Définir `IS_PRODUCTION_MODE=true`** dans Supabase
5. ✅ **Redéployer l'Edge Function** `send-otp-twilio`
6. ✅ **Tester** l'envoi et la vérification d'OTP
7. ✅ **Monitorer** les coûts et la délivrabilité

**Temps estimé** : 1-3 jours (en fonction de l'approbation WhatsApp Business)

**Coût mensuel estimé** : $15-22 pour 1000-1200 messages

---

*Document créé pour Yombal Yoon - Configuration Twilio Production*
*Date : Janvier 2025*
*Version : 1.0*
</write file>

<write file="QUICK_REFERENCE_TWILIO_PRODUCTION.md">
# 🚀 Guide Rapide : Twilio en Production

## Configuration Rapide (5 minutes)

### 1. Upgrader Twilio
```
1. Aller sur https://console.twilio.com/billing
2. Cliquer sur "Upgrade"
3. Ajouter une carte bancaire
4. Confirmer
```

### 2. Obtenir les Credentials
```
1. Aller sur https://console.twilio.com
2. Copier Account SID (commence par AC...)
3. Copier Auth Token (cliquer sur "Show")
4. Noter votre numéro WhatsApp Business (après approbation)
5. Noter votre numéro SMS
```

### 3. Configurer Supabase
```bash
# Via CLI
supabase login
supabase link --project-ref drxtaxepofuoelplgrei

# Définir les secrets
supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX

# Redéployer
supabase functions deploy send-otp-twilio
```

### 4. Tester
```bash
# Test WhatsApp
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -d '{"action":"send","phoneNumber":"+221771234567","method":"whatsapp"}'

# Vérifier les logs
supabase functions logs send-otp-twilio --follow
```

---

## Vérification Rapide

### ✅ Mode Production Actif Si :
- Logs affichent : `[Mode: Production]`
- Messages sans préfixe "trial account"
- Envoi à tous les numéros (pas seulement vérifiés)
- Réponse API contient : `"mode": "production"`

### ❌ Mode Test Actif Si :
- Logs affichent : `[Mode: Test]`
- Messages avec préfixe "Sent from your Twilio trial account"
- Envoi limité aux numéros vérifiés
- Réponse API contient : `"mode": "test"`

---

## Coûts Estimés

| Service | Coût |
|---------|------|
| WhatsApp (Sénégal) | $0.0042/message |
| SMS (Sénégal) | $0.05-0.08/message |
| Numéro SMS | $1-2/mois |
| **Total (1000 msg/mois)** | **~$15-22/mois** |

---

## Commandes Utiles

```bash
# Vérifier les secrets
supabase secrets list

# Voir les logs en temps réel
supabase functions logs send-otp-twilio --follow

# Redéployer la fonction
supabase functions deploy send-otp-twilio

# Tester l'envoi
curl -X POST https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -d '{"action":"send","phoneNumber":"+221771234567","method":"whatsapp"}'
```

---

## Dépannage Rapide

| Problème | Solution |
|----------|----------|
| "Twilio non configuré" | Vérifier les secrets Supabase |
| Mode toujours "Test" | Définir `IS_PRODUCTION_MODE=true` |
| WhatsApp échoue | Vérifier l'approbation du numéro |
| Message non livré | Vérifier le format du numéro |

---

## Support

- **Twilio** : https://support.twilio.com
- **Supabase** : https://discord.supabase.com
- **Yombal Yoon** : senshipservices@gmail.com

---

*Pour plus de détails, voir TWILIO_PRODUCTION_SETUP.md*

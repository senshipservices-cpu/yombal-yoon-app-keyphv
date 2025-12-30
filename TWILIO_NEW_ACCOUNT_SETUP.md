
# 🔄 Configuration du Nouveau Compte Twilio LIVE

## Vue d'ensemble

Ce guide vous aide à configurer votre nouveau compte Twilio LIVE avec vos nouvelles credentials (carte bancaire et données entreprise).

---

## 📝 Étape 1 : Récupérer les Nouvelles Credentials Twilio

### 1.1 Connectez-vous à votre nouveau compte Twilio

1. **Allez sur** : https://console.twilio.com
2. **Connectez-vous** avec votre nouveau compte

### 1.2 Récupérez vos credentials

1. **Sur le Dashboard Twilio**, vous verrez :
   - **Account SID** : Commence par `AC...` (32 caractères)
   - **Auth Token** : Cliquez sur "Show" pour le révéler (32 caractères)

2. **Copiez ces valeurs** dans un endroit sûr (ne les partagez jamais publiquement)

Exemple :
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.3 Obtenez votre numéro WhatsApp Business (si disponible)

1. **Allez dans** : Messaging > Try it out > WhatsApp
2. **Si vous avez déjà un numéro approuvé** :
   - Notez le numéro au format : `+221XXXXXXXXX`
3. **Si vous n'avez pas encore de numéro** :
   - Demandez l'approbation d'un numéro WhatsApp Business
   - En attendant, utilisez SMS

### 1.4 Obtenez votre numéro SMS (fallback)

1. **Allez dans** : Phone Numbers > Manage > Active numbers
2. **Si vous avez déjà un numéro** :
   - Notez le numéro au format : `+221XXXXXXXXX` ou `+1XXXXXXXXXX`
3. **Si vous n'avez pas de numéro** :
   - Allez dans "Buy a number"
   - Sélectionnez un pays (Sénégal ou USA)
   - Filtrez par "SMS" capability
   - Achetez un numéro (~$1-2/mois)

---

## 🔧 Étape 2 : Configurer les Secrets dans Supabase

### Option A : Via Supabase Dashboard (Recommandé)

1. **Allez sur** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions

2. **Cliquez sur** : "Edge Functions" > "Secrets"

3. **Mettez à jour les secrets suivants** :

| Secret | Nouvelle Valeur | Description |
|--------|-----------------|-------------|
| `IS_PRODUCTION_MODE` | `true` | ✅ Mode production activé |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Votre nouveau Account SID |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Votre nouveau Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+221XXXXXXXXX` | Votre numéro WhatsApp (si disponible) |
| `TWILIO_PHONE_NUMBER` | `+221XXXXXXXXX` | Votre numéro SMS (fallback) |

4. **Cliquez sur "Save"** pour chaque secret

### Option B : Via Supabase CLI

Si vous avez Supabase CLI installé :

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei

# Mettre à jour les secrets avec vos nouvelles credentials
supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX
```

**⚠️ Important** : Remplacez les `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` par vos vraies valeurs !

---

## 🚀 Étape 3 : Redéployer l'Edge Function

Après avoir mis à jour les secrets, vous devez redéployer la fonction pour que les changements prennent effet.

### Via Natively (Automatique)

La fonction sera automatiquement redéployée lors de la prochaine modification du code.

### Via Supabase CLI (Manuel)

```bash
# Redéployer la fonction send-otp-twilio
supabase functions deploy send-otp-twilio

# Vérifier le déploiement
supabase functions list
```

---

## ✅ Étape 4 : Tester la Configuration

### Test 1 : Vérifier les secrets

```bash
# Lister les secrets (ne montre pas les valeurs, juste les noms)
supabase secrets list
```

Vous devriez voir :
```
IS_PRODUCTION_MODE
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER
TWILIO_PHONE_NUMBER
```

### Test 2 : Tester l'envoi d'OTP

#### Via l'application

1. **Ouvrez l'application** Yombal Yoon
2. **Allez sur l'écran de connexion**
3. **Entrez un numéro de téléphone** : `+221771234567`
4. **Cliquez sur "Envoyer le code"**
5. **Vérifiez** :
   - Vous devriez recevoir un SMS ou WhatsApp avec le code
   - Le message ne devrait PAS contenir "Sent from your Twilio trial account"
   - Le message devrait être : "Votre code OTP Yombal Yoon est : 123456. Valide pendant 10 minutes."

#### Via cURL (Test direct)

```bash
# Remplacez YOUR_SUPABASE_ANON_KEY par votre clé anon
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

### Test 3 : Vérifier les logs

1. **Allez sur** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions/send-otp-twilio/logs

2. **Recherchez** les logs récents

3. **Vérifiez** que les logs affichent :
   ```
   📤 Sending OTP via whatsapp from whatsapp:+221XXXXXXXXX to whatsapp:+221771234567 [Mode: Production]
   ✅ OTP sent successfully via whatsapp
   ```

---

## 🔍 Vérification du Mode Production

### Indicateurs que le mode production est actif :

✅ **Dans les logs Supabase** :
- `[Mode: Production]` au lieu de `[Mode: Test]`

✅ **Dans les messages** :
- Pas de préfixe "Sent from your Twilio trial account"
- Messages personnalisés complets

✅ **Dans les réponses API** :
- `"mode": "production"` au lieu de `"mode": "test"`

✅ **Fonctionnalités** :
- Envoi à tous les numéros (pas seulement les numéros vérifiés)
- Pas de limite de numéros
- Meilleure délivrabilité

---

## 💰 Coûts Estimés avec le Nouveau Compte

### Coûts par Message

| Service | Destination | Coût Unitaire |
|---------|-------------|---------------|
| WhatsApp | Sénégal | $0.0042/message |
| SMS | Sénégal | $0.05-0.08/message |
| SMS | USA | $0.0075/message |

### Coûts Mensuels Estimés

Pour **1000 utilisateurs actifs/mois** :

| Scénario | WhatsApp | SMS | Total |
|----------|----------|-----|-------|
| 100% WhatsApp | $4.20 | $0 | **$4.20** |
| 80% WhatsApp, 20% SMS | $3.36 | $10-16 | **$13-19** |
| 50% WhatsApp, 50% SMS | $2.10 | $25-40 | **$27-42** |

**Recommandation** : Privilégier WhatsApp (12x moins cher que SMS)

---

## 🚨 Dépannage

### Problème 1 : "Twilio non configuré"

**Cause** : Les secrets ne sont pas définis ou sont incorrects

**Solution** :
1. Vérifiez que vous avez bien ajouté tous les secrets dans Supabase
2. Vérifiez que les valeurs sont correctes (pas d'espaces, pas de guillemets)
3. Redéployez la fonction

### Problème 2 : "Authentication Error" ou "Invalid credentials"

**Cause** : Account SID ou Auth Token incorrect

**Solution** :
1. Retournez sur https://console.twilio.com
2. Vérifiez que vous avez copié les bonnes valeurs
3. Assurez-vous de ne pas avoir d'espaces avant/après
4. Mettez à jour les secrets dans Supabase
5. Redéployez la fonction

### Problème 3 : "The 'From' number ... is not a valid phone number"

**Cause** : Le numéro Twilio n'est pas au bon format

**Solution** :
1. Pour WhatsApp : `whatsapp:+221XXXXXXXXX` (avec le préfixe `whatsapp:`)
2. Pour SMS : `+221XXXXXXXXX` (sans le préfixe `whatsapp:`)
3. Vérifiez que le numéro existe dans votre compte Twilio

### Problème 4 : Mode toujours en "Test"

**Cause** : `IS_PRODUCTION_MODE` n'est pas défini ou est à `false`

**Solution** :
```bash
# Définir le mode production
supabase secrets set IS_PRODUCTION_MODE=true

# Redéployer la fonction
supabase functions deploy send-otp-twilio
```

### Problème 5 : "Message not delivered"

**Cause** : Numéro invalide ou non joignable

**Solution** :
1. Vérifiez le format du numéro : `+221XXXXXXXXX`
2. Vérifiez que le numéro est actif
3. Consultez les logs Twilio : https://console.twilio.com/monitor/logs/messages
4. Essayez le fallback SMS si WhatsApp échoue

---

## 📋 Checklist de Configuration

### Avant de commencer

- [ ] Nouveau compte Twilio créé
- [ ] Carte bancaire ajoutée
- [ ] Données entreprise renseignées
- [ ] Compte upgradé (payant)

### Credentials récupérées

- [ ] Account SID copié (commence par `AC...`)
- [ ] Auth Token copié (32 caractères)
- [ ] Numéro WhatsApp Business noté (si disponible)
- [ ] Numéro SMS acheté et noté

### Configuration Supabase

- [ ] `IS_PRODUCTION_MODE=true` défini
- [ ] `TWILIO_ACCOUNT_SID` mis à jour
- [ ] `TWILIO_AUTH_TOKEN` mis à jour
- [ ] `TWILIO_WHATSAPP_NUMBER` mis à jour (si disponible)
- [ ] `TWILIO_PHONE_NUMBER` mis à jour
- [ ] Edge Function redéployée

### Tests

- [ ] Test d'envoi WhatsApp réussi
- [ ] Test d'envoi SMS réussi
- [ ] Test de vérification OTP réussi
- [ ] Logs affichent "Mode: Production"
- [ ] Messages sans préfixe "trial account"
- [ ] Envoi à des numéros non vérifiés fonctionne

### Monitoring

- [ ] Alertes Twilio configurées (budget, taux d'échec)
- [ ] Dashboard de monitoring vérifié
- [ ] Logs Supabase surveillés

---

## 📞 Support

### Twilio Support
- **Console** : https://console.twilio.com
- **Support** : https://support.twilio.com
- **Documentation** : https://www.twilio.com/docs
- **Logs** : https://console.twilio.com/monitor/logs/messages

### Supabase Support
- **Dashboard** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
- **Documentation** : https://supabase.com/docs
- **Discord** : https://discord.supabase.com

### Yombal Yoon Support
- **Email** : senshipservices@gmail.com
- **WhatsApp** : +221 76 567 64 86

---

## ✅ Résumé des Étapes

1. ✅ **Récupérer les credentials** du nouveau compte Twilio
   - Account SID
   - Auth Token
   - Numéro WhatsApp (si disponible)
   - Numéro SMS

2. ✅ **Configurer les secrets Supabase**
   - Via Dashboard ou CLI
   - Mettre à jour les 5 secrets

3. ✅ **Redéployer l'Edge Function**
   - Automatique via Natively
   - Ou manuel via CLI

4. ✅ **Tester la configuration**
   - Envoi d'OTP
   - Vérification d'OTP
   - Vérifier les logs

5. ✅ **Monitorer**
   - Configurer les alertes Twilio
   - Surveiller les coûts
   - Vérifier la délivrabilité

---

## 🎯 Prochaines Étapes

Une fois la configuration terminée :

1. **Tester avec plusieurs numéros** (Sénégal, France, USA)
2. **Configurer les alertes Twilio** (budget, taux d'échec)
3. **Monitorer les coûts** pendant les premiers jours
4. **Optimiser** :
   - Privilégier WhatsApp (moins cher)
   - Limiter les renvois d'OTP
   - Implémenter un cache

---

## 📊 Tableau de Bord Twilio

Pour suivre vos envois et coûts :

1. **Allez sur** : https://console.twilio.com/monitor/logs/messages
2. **Filtrez par** :
   - Date
   - Status (delivered, failed, etc.)
   - Direction (outbound)
3. **Consultez** :
   - Nombre de messages envoyés
   - Taux de délivrabilité
   - Coûts par message
   - Erreurs éventuelles

---

*Document créé pour Yombal Yoon - Configuration Nouveau Compte Twilio LIVE*
*Date : Janvier 2025*
*Version : 1.0*

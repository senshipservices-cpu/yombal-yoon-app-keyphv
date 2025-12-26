
# 📱 Résumé : Passage de Twilio en Mode LIVE (Production)

## 🎯 Objectif

Configurer Twilio pour utiliser les credentials de **production** au lieu des credentials de **test/sandbox** lors du build de production de l'application Yombal Yoon.

---

## 📊 Situation Actuelle

### Configuration de l'Application ✅
- ✅ `IS_PRODUCTION_MODE = true` dans `config/productionMode.ts`
- ✅ Mode production activé pour l'OTP et la vérification des numéros
- ✅ Commissions configurées (mode test à 0 FCFA pour période d'essai)

### Configuration Twilio 🔄
- ⚠️ **Actuellement en mode TEST/SANDBOX**
- ⚠️ Utilise probablement le numéro sandbox WhatsApp : `whatsapp:+14155238886`
- ⚠️ Messages préfixés par "Sent from your Twilio trial account"
- ⚠️ Limité aux numéros vérifiés dans le compte Twilio

---

## 🚀 Actions Requises

### 1. Upgrader le Compte Twilio (5 minutes)

**Étapes :**
1. Aller sur https://console.twilio.com/billing
2. Cliquer sur "Upgrade"
3. Ajouter une méthode de paiement (carte bancaire)
4. Confirmer l'upgrade

**Résultat :** Compte Twilio payant activé

---

### 2. Obtenir un Numéro WhatsApp Business (1-3 jours)

**Option A : WhatsApp Business (Recommandé)**

1. Aller dans **Messaging** > **Try it out** > **WhatsApp**
2. Cliquer sur **"Request to enable your Twilio number for WhatsApp"**
3. Remplir le formulaire :
   - Nom : Yombal Yoon
   - Site web : https://yombalyoon.com
   - Description : Service de covoiturage et livraison au Sénégal
   - Cas d'usage : Envoi de codes OTP pour vérification d'identité
4. Soumettre la demande
5. Attendre l'approbation (1-3 jours ouvrables)

**Option B : SMS (Alternative immédiate)**

1. Aller dans **Phone Numbers** > **Buy a number**
2. Sélectionner le pays : Sénégal (SN) ou proche
3. Filtrer par capacités : SMS
4. Acheter un numéro (~$1-2/mois)

---

### 3. Configurer les Secrets Supabase (5 minutes)

Une fois les credentials de production obtenus :

#### Via Supabase Dashboard (Recommandé)

1. Aller sur : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Cliquer sur : **Settings** > **Edge Functions** > **Secrets**
3. Ajouter/Mettre à jour :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `IS_PRODUCTION_MODE` | `true` | Active le mode production |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Account SID de production |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Auth Token de production |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+221XXXXXXXXX` | Numéro WhatsApp Business approuvé |
| `TWILIO_PHONE_NUMBER` | `+221XXXXXXXXX` | Numéro SMS (fallback) |

#### Via Supabase CLI (Alternative)

```bash
# Se connecter
supabase login
supabase link --project-ref drxtaxepofuoelplgrei

# Configurer les secrets
supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX
```

---

### 4. Redéployer l'Edge Function (2 minutes)

```bash
# Redéployer la fonction
supabase functions deploy send-otp-twilio

# Vérifier le déploiement
supabase functions list
```

---

### 5. Tester la Configuration (5 minutes)

#### Test 1 : Envoi d'OTP

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

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Code envoyé par WhatsApp",
  "method": "whatsapp",
  "mode": "production"
}
```

#### Test 2 : Vérifier les Logs

```bash
# Voir les logs en temps réel
supabase functions logs send-otp-twilio --follow
```

**Logs attendus :**
```
📤 Sending OTP via whatsapp from whatsapp:+221XXXXXXXXX to whatsapp:+221771234567 [Mode: Production]
✅ OTP sent successfully via whatsapp
```

---

## ✅ Vérification du Mode Production

### Indicateurs que Twilio est en LIVE :

1. ✅ **Logs affichent** : `[Mode: Production]`
2. ✅ **Messages sans préfixe** "Sent from your Twilio trial account"
3. ✅ **Envoi à tous les numéros** (pas seulement vérifiés)
4. ✅ **Réponse API contient** : `"mode": "production"`
5. ✅ **Numéro d'envoi** : Votre numéro WhatsApp Business (pas le sandbox)

### Indicateurs que Twilio est encore en TEST :

1. ❌ **Logs affichent** : `[Mode: Test]`
2. ❌ **Messages avec préfixe** "Sent from your Twilio trial account"
3. ❌ **Envoi limité** aux numéros vérifiés
4. ❌ **Réponse API contient** : `"mode": "test"`
5. ❌ **Numéro d'envoi** : `whatsapp:+14155238886` (sandbox)

---

## 💰 Coûts Estimés en Production

| Service | Coût Unitaire | Volume Mensuel | Coût Total |
|---------|---------------|----------------|------------|
| WhatsApp (Sénégal) | $0.0042/msg | 1000 messages | $4.20 |
| SMS (Sénégal) | $0.05-0.08/msg | 200 messages | $10-16 |
| Numéro SMS | $1-2/mois | - | $1-2 |
| **Total Estimé** | - | - | **$15-22/mois** |

**Note :** WhatsApp est 12x moins cher que SMS, donc privilégier WhatsApp.

---

## 📋 Checklist Complète

### Avant le Passage
- [ ] Compte Twilio créé
- [ ] Accès à la console Twilio
- [ ] Accès au dashboard Supabase
- [ ] Supabase CLI installé (optionnel)

### Upgrade Twilio
- [ ] Compte Twilio upgradé (payant)
- [ ] Méthode de paiement ajoutée
- [ ] Numéro WhatsApp Business demandé
- [ ] Numéro SMS acheté (fallback)

### Configuration Supabase
- [ ] `IS_PRODUCTION_MODE=true` défini
- [ ] `TWILIO_ACCOUNT_SID` mis à jour (production)
- [ ] `TWILIO_AUTH_TOKEN` mis à jour (production)
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
- [ ] Alertes Twilio configurées (budget)
- [ ] Logs Supabase surveillés
- [ ] Dashboard de monitoring configuré

---

## 🚨 Dépannage Rapide

### Problème : Mode toujours en "Test"

**Solution :**
```bash
# Vérifier les secrets
supabase secrets list

# Redéfinir IS_PRODUCTION_MODE
supabase secrets set IS_PRODUCTION_MODE=true

# Redéployer
supabase functions deploy send-otp-twilio

# Vérifier les logs
supabase functions logs send-otp-twilio --follow
```

### Problème : "Twilio non configuré"

**Solution :**
```bash
# Vérifier que tous les secrets sont définis
supabase secrets list

# Redéfinir les secrets manquants
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Problème : WhatsApp échoue

**Solution :**
1. Vérifier que le numéro WhatsApp Business est approuvé
2. Utiliser SMS en attendant l'approbation
3. Vérifier les logs Twilio : https://console.twilio.com/monitor/logs/messages

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **TWILIO_PRODUCTION_SETUP.md** - Guide complet de configuration
2. **QUICK_REFERENCE_TWILIO_PRODUCTION.md** - Guide rapide
3. **TWILIO_SECRETS_SETUP.md** - Configuration des secrets (mode test)
4. **PRODUCTION_MODE_GUIDE.md** - Guide du mode production

---

## 📞 Support

### Twilio
- **Console** : https://console.twilio.com
- **Support** : https://support.twilio.com
- **Documentation** : https://www.twilio.com/docs

### Supabase
- **Dashboard** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
- **Documentation** : https://supabase.com/docs
- **Discord** : https://discord.supabase.com

### Yombal Yoon
- **Email** : senshipservices@gmail.com
- **WhatsApp** : +221 76 567 64 86

---

## ⏱️ Timeline Estimé

| Étape | Durée |
|-------|-------|
| Upgrade compte Twilio | 5 minutes |
| Demande WhatsApp Business | 1-3 jours |
| Configuration Supabase | 5 minutes |
| Redéploiement Edge Function | 2 minutes |
| Tests | 5 minutes |
| **Total** | **1-3 jours** (en fonction de l'approbation WhatsApp) |

---

## ✅ Résumé des Actions

Pour passer Twilio en mode LIVE (Production) :

1. ✅ **Upgrader Twilio** → Ajouter méthode de paiement
2. ✅ **Obtenir numéro WhatsApp Business** → Demande d'approbation (1-3 jours)
3. ✅ **Configurer Supabase** → Mettre à jour les secrets avec credentials de production
4. ✅ **Redéployer** → `supabase functions deploy send-otp-twilio`
5. ✅ **Tester** → Vérifier que le mode "Production" est actif
6. ✅ **Monitorer** → Surveiller les coûts et la délivrabilité

**Coût mensuel estimé** : $15-22 pour 1000-1200 messages

**Temps total** : 1-3 jours (en fonction de l'approbation WhatsApp Business)

---

*Document créé pour Yombal Yoon - Passage Twilio en Production*
*Date : Janvier 2025*
*Version : 1.0*

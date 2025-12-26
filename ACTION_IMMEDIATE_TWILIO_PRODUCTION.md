
# ⚡ ACTION IMMÉDIATE : Passer Twilio en Mode LIVE (Production)

## 🎯 Objectif

Configurer Twilio pour utiliser les **credentials de production** au lieu des credentials de **test/sandbox** lors du build de production de Yombal Yoon.

---

## ✅ Ce qui est déjà fait

- ✅ Configuration de l'application en mode production (`IS_PRODUCTION_MODE = true`)
- ✅ Edge Function `send-otp-twilio` déployée et fonctionnelle
- ✅ Tests Android et iOS terminés avec succès
- ✅ Commissions configurées (mode test à 0 FCFA pour période d'essai)

---

## 🔄 Ce qui reste à faire

### 1. Upgrader le Compte Twilio (5 minutes)

**Action :**
1. Aller sur https://console.twilio.com/billing
2. Cliquer sur **"Upgrade"**
3. Ajouter une **carte bancaire**
4. Confirmer l'upgrade

**Résultat :** Compte Twilio payant activé

---

### 2. Obtenir un Numéro WhatsApp Business (1-3 jours)

**Action :**
1. Aller dans **Messaging** > **Try it out** > **WhatsApp**
2. Cliquer sur **"Request to enable your Twilio number for WhatsApp"**
3. Remplir le formulaire :
   - **Nom** : Yombal Yoon
   - **Site web** : https://yombalyoon.com (ou votre site)
   - **Description** : Service de covoiturage et livraison au Sénégal
   - **Cas d'usage** : Envoi de codes OTP pour vérification d'identité
4. Soumettre la demande
5. Attendre l'approbation (1-3 jours ouvrables)

**Alternative immédiate (SMS) :**
1. Aller dans **Phone Numbers** > **Buy a number**
2. Sélectionner le pays : Sénégal (SN) ou proche
3. Acheter un numéro avec capacité SMS (~$1-2/mois)

---

### 3. Configurer les Secrets Supabase (5 minutes)

**Action :**
1. Aller sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Cliquer sur **Settings** > **Edge Functions** > **Secrets**
3. Ajouter/Mettre à jour ces secrets :

| Secret | Valeur | Où le trouver |
|--------|--------|---------------|
| `IS_PRODUCTION_MODE` | `true` | À définir manuellement |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | https://console.twilio.com (commence par AC) |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | https://console.twilio.com (cliquer sur "Show") |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+221XXXXXXXXX` | Votre numéro WhatsApp Business approuvé |
| `TWILIO_PHONE_NUMBER` | `+221XXXXXXXXX` | Votre numéro SMS acheté |

**Alternative via CLI :**
```bash
supabase login
supabase link --project-ref drxtaxepofuoelplgrei
supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX
```

---

### 4. Redéployer l'Edge Function (2 minutes)

**Action :**
```bash
supabase functions deploy send-otp-twilio
```

---

### 5. Tester (5 minutes)

**Action :**
```bash
# Test d'envoi OTP
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -d '{"action":"send","phoneNumber":"+221771234567","method":"whatsapp"}'

# Vérifier les logs
supabase functions logs send-otp-twilio --follow
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Code envoyé par WhatsApp",
  "method": "whatsapp",
  "mode": "production"
}
```

**Logs attendus :**
```
📤 Sending OTP via whatsapp from whatsapp:+221XXXXXXXXX to whatsapp:+221771234567 [Mode: Production]
✅ OTP sent successfully via whatsapp
```

---

## ✅ Vérification du Mode Production

### Mode Production Actif Si :
- ✅ Logs affichent : `[Mode: Production]`
- ✅ Messages **sans** préfixe "Sent from your Twilio trial account"
- ✅ Envoi à **tous les numéros** (pas seulement vérifiés)
- ✅ Réponse API contient : `"mode": "production"`

### Mode Test Actif Si :
- ❌ Logs affichent : `[Mode: Test]`
- ❌ Messages **avec** préfixe "Sent from your Twilio trial account"
- ❌ Envoi **limité** aux numéros vérifiés
- ❌ Réponse API contient : `"mode": "test"`

---

## 💰 Coûts Estimés

| Service | Coût |
|---------|------|
| WhatsApp (Sénégal) | $0.0042/message |
| SMS (Sénégal) | $0.05-0.08/message |
| Numéro SMS | $1-2/mois |
| **Total (1000 msg/mois)** | **~$15-22/mois** |

**Note :** WhatsApp est 12x moins cher que SMS

---

## ⏱️ Timeline

| Étape | Durée |
|-------|-------|
| Upgrade Twilio | 5 minutes |
| Demande WhatsApp Business | 1-3 jours |
| Configuration Supabase | 5 minutes |
| Redéploiement | 2 minutes |
| Tests | 5 minutes |
| **Total** | **1-3 jours** |

---

## 📋 Checklist Rapide

- [ ] Compte Twilio upgradé (payant)
- [ ] Numéro WhatsApp Business demandé (ou numéro SMS acheté)
- [ ] Credentials de production récupérés (Account SID + Auth Token)
- [ ] Secrets Supabase mis à jour
- [ ] `IS_PRODUCTION_MODE=true` défini dans Supabase
- [ ] Edge Function redéployée
- [ ] Tests d'envoi OTP réussis
- [ ] Logs affichent "Mode: Production"
- [ ] Messages sans préfixe "trial account"

---

## 🚨 Dépannage Rapide

### Problème : Mode toujours en "Test"
```bash
supabase secrets set IS_PRODUCTION_MODE=true
supabase functions deploy send-otp-twilio
```

### Problème : "Twilio non configuré"
```bash
supabase secrets list  # Vérifier les secrets
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Problème : WhatsApp échoue
- Vérifier que le numéro WhatsApp Business est approuvé
- Utiliser SMS en attendant l'approbation
- Vérifier les logs Twilio : https://console.twilio.com/monitor/logs/messages

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **RESUME_TWILIO_PRODUCTION.md** - Résumé complet des actions
2. **QUICK_REFERENCE_TWILIO_PRODUCTION.md** - Guide rapide
3. **TWILIO_PRODUCTION_SETUP.md** - Guide détaillé complet

---

## 📞 Support

- **Twilio** : https://support.twilio.com
- **Supabase** : https://discord.supabase.com
- **Yombal Yoon** : senshipservices@gmail.com

---

## 🎯 Prochaine Action

**Commencez par l'étape 1 : Upgrader le compte Twilio**

👉 https://console.twilio.com/billing

---

*Document créé pour Yombal Yoon - Configuration Twilio Production*
*Date : Janvier 2025*

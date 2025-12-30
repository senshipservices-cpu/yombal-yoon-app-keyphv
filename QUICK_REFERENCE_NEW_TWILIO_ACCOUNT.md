
# 🚀 Guide Rapide : Nouveau Compte Twilio LIVE

## Configuration en 5 Minutes

### 1️⃣ Récupérer les Credentials Twilio

```
1. Aller sur https://console.twilio.com
2. Copier Account SID (commence par AC...)
3. Copier Auth Token (cliquer sur "Show")
4. Noter votre numéro WhatsApp : +221XXXXXXXXX
5. Noter votre numéro SMS : +221XXXXXXXXX
```

### 2️⃣ Configurer Supabase

**Via Dashboard** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/settings/functions

Mettre à jour ces 5 secrets :

| Secret | Valeur |
|--------|--------|
| `IS_PRODUCTION_MODE` | `true` |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+221XXXXXXXXX` |
| `TWILIO_PHONE_NUMBER` | `+221XXXXXXXXX` |

**Via CLI** :

```bash
supabase login
supabase link --project-ref drxtaxepofuoelplgrei

supabase secrets set IS_PRODUCTION_MODE=true
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_NUMBER=whatsapp:+221XXXXXXXXX
supabase secrets set TWILIO_PHONE_NUMBER=+221XXXXXXXXX

supabase functions deploy send-otp-twilio
```

### 3️⃣ Tester

**Dans l'app** :
1. Ouvrir Yombal Yoon
2. Entrer un numéro : `+221771234567`
3. Cliquer sur "Envoyer le code"
4. Vérifier la réception du code

**Via cURL** :
```bash
curl -X POST \
  https://drxtaxepofuoelplgrei.supabase.co/functions/v1/send-otp-twilio \
  -H "Content-Type: application/json" \
  -d '{"action":"send","phoneNumber":"+221771234567","method":"whatsapp"}'
```

### 4️⃣ Vérifier les Logs

**Supabase** : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei/functions/send-otp-twilio/logs

Chercher : `[Mode: Production]`

**Twilio** : https://console.twilio.com/monitor/logs/messages

---

## ✅ Checklist Rapide

- [ ] Account SID copié
- [ ] Auth Token copié
- [ ] Numéros notés (WhatsApp + SMS)
- [ ] Secrets Supabase mis à jour
- [ ] Fonction redéployée
- [ ] Test d'envoi réussi
- [ ] Logs vérifiés

---

## 🚨 Dépannage Express

| Problème | Solution |
|----------|----------|
| "Twilio non configuré" | Vérifier les secrets Supabase |
| "Invalid credentials" | Vérifier Account SID et Auth Token |
| "Invalid From number" | Vérifier le format du numéro |
| Mode toujours "Test" | Définir `IS_PRODUCTION_MODE=true` |

---

## 💰 Coûts

| Service | Coût |
|---------|------|
| WhatsApp (Sénégal) | $0.0042/msg |
| SMS (Sénégal) | $0.05-0.08/msg |
| **1000 msg/mois** | **~$4-80** |

**Astuce** : Privilégier WhatsApp (12x moins cher)

---

## 📞 Support

- **Twilio** : https://support.twilio.com
- **Supabase** : https://discord.supabase.com
- **Yombal Yoon** : senshipservices@gmail.com

---

*Pour plus de détails, voir TWILIO_NEW_ACCOUNT_SETUP.md*

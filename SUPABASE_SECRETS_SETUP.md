
# Configuration des Secrets Supabase - Guide Rapide

## 📍 Accès aux Secrets

1. Allez sur : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Cliquez sur **Settings** (⚙️) dans la barre latérale gauche
3. Cliquez sur **Edge Functions**
4. Cliquez sur l'onglet **Secrets**

## 🔑 Secrets à configurer

### Pour Email (Resend)

```
Nom du secret : RESEND_API_KEY
Valeur : re_xxxxxxxxxxxxx
```

**Comment obtenir la clé :**
1. Créez un compte sur https://resend.com
2. Allez dans "API Keys"
3. Créez une nouvelle clé
4. Copiez la clé (commence par `re_`)

---

### Pour WhatsApp (Twilio)

#### Secret 1 : Account SID
```
Nom du secret : TWILIO_ACCOUNT_SID
Valeur : ACxxxxxxxxxxxxx
```

#### Secret 2 : Auth Token
```
Nom du secret : TWILIO_AUTH_TOKEN
Valeur : xxxxxxxxxxxxx
```

#### Secret 3 : Numéro WhatsApp
```
Nom du secret : TWILIO_WHATSAPP_NUMBER
Valeur : whatsapp:+14155238886
```

**Comment obtenir les identifiants :**
1. Créez un compte sur https://www.twilio.com/try-twilio
2. Dans le dashboard, notez votre **Account SID** et **Auth Token**
3. Pour le sandbox WhatsApp :
   - Allez dans "Messaging > Try it out > Send a WhatsApp message"
   - Suivez les instructions pour activer le sandbox
   - Le numéro sandbox est : `whatsapp:+14155238886`

---

## ✅ Vérification

Après avoir ajouté les secrets :

1. Les secrets apparaissent dans la liste (les valeurs sont masquées)
2. Vous pouvez les modifier ou les supprimer si nécessaire
3. Les Edge Functions peuvent maintenant accéder à ces secrets

## 🧪 Test rapide

Pour tester si les secrets fonctionnent :

1. Allez dans l'app Yombal Yoon
2. Remplissez le formulaire "Livraison Inter régions"
3. Cliquez sur "COMMANDER"
4. Vérifiez les logs de l'Edge Function :
   - Supabase Dashboard > Edge Functions > send-intercity-notifications > Logs
   - Vous devriez voir : "✅ Email sent successfully" et "✅ WhatsApp message sent successfully"

## ⚠️ Erreurs courantes

### "RESEND_API_KEY not configured"
- Le secret RESEND_API_KEY n'est pas défini
- Vérifiez l'orthographe exacte du nom du secret

### "Twilio credentials not configured"
- Un ou plusieurs secrets Twilio manquent
- Vérifiez que les 3 secrets sont bien définis :
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_WHATSAPP_NUMBER

### "REQUEST_DENIED" ou "Invalid credentials"
- Les identifiants sont incorrects
- Vérifiez que vous avez copié les bonnes valeurs depuis Resend/Twilio

### "Insufficient funds" (Twilio)
- Votre compte Twilio n'a plus de crédit
- Ajoutez du crédit ou passez à un compte payant

## 🔒 Sécurité

- ✅ Les secrets sont stockés de manière sécurisée par Supabase
- ✅ Ils ne sont jamais exposés dans le code client
- ✅ Seules les Edge Functions peuvent y accéder
- ❌ Ne partagez jamais vos secrets publiquement
- ❌ Ne les commitez jamais dans Git

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les logs de l'Edge Function
2. Consultez `NOTIFICATIONS_SETUP.md` pour plus de détails
3. Contactez le support Resend/Twilio si nécessaire

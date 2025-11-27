
# 🚀 Guide de démarrage rapide - Notifications Inter-Régions

## 📋 Checklist de déploiement

### 1. Déployer l'Edge Function

```bash
cd supabase
supabase functions deploy send-intercity-notifications
```

### 2. Configurer les secrets Supabase

```bash
# Resend API (pour les emails)
supabase secrets set RESEND_API_KEY=re_xxxxx

# Twilio (pour WhatsApp)
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Vérifier que l'app est à jour

Les fichiers suivants doivent être présents :

- ✅ `utils/eventSystem.ts`
- ✅ `utils/notificationSetup.ts`
- ✅ `contexts/LivraisonContext.tsx` (mis à jour)
- ✅ `app/_layout.tsx` (mis à jour)
- ✅ `supabase/functions/send-intercity-notifications/index.ts` (mis à jour)

### 4. Tester

1. Lancer l'app : `npm run dev`
2. Aller dans "Livraison"
3. Remplir le formulaire
4. Cliquer "COMMANDER"
5. Vérifier :
   - Message de succès dans l'app ✅
   - Email reçu sur woyofaldem@gmail.com ✅
   - WhatsApp reçu sur +221765676486 ✅

## 🔍 Vérification rapide

### Console logs attendus

```
🔔 Initializing notification handlers...
✅ Notification handlers initialized
📦 Adding inter-regional request...
✅ Inter-regional request added to Supabase
🔔 Event triggered: INTER_REGION_DELIVERY_CREATED
📧 Sending email notification...
✅ Email sent successfully
📱 Sending WhatsApp notification...
✅ WhatsApp sent successfully
```

### En cas d'erreur

**Email ne fonctionne pas :**

- Vérifier `RESEND_API_KEY` dans Supabase Secrets
- Vérifier que le compte Resend est actif
- Vérifier les logs de l'Edge Function

**WhatsApp ne fonctionne pas :**

- Vérifier `TWILIO_ACCOUNT_SID` et `TWILIO_AUTH_TOKEN`
- Vérifier que le numéro WhatsApp est vérifié dans Twilio
- Vérifier les logs de l'Edge Function

## 📱 Destinataires des notifications

- **Email :** woyofaldem@gmail.com
- **WhatsApp :** +221765676486

## 🔧 Commandes utiles

```bash
# Voir les logs de l'Edge Function
supabase functions logs send-intercity-notifications

# Tester l'Edge Function localement
supabase functions serve send-intercity-notifications

# Lister les secrets configurés
supabase secrets list
```

## 📚 Documentation complète

Pour plus de détails, consulter :

- `INTERCITY_NOTIFICATIONS.md` - Documentation technique complète
- `docs/IMPLEMENTATION_SUMMARY_NOTIFICATIONS.md` - Résumé de l'implémentation

## ✅ C'est tout !

Le système est maintenant opérationnel. Chaque nouvelle livraison inter-régions déclenchera automatiquement :

1. Un email à woyofaldem@gmail.com
2. Un message WhatsApp à +221765676486

Les notifications sont envoyées en parallèle et ne bloquent pas l'utilisateur.

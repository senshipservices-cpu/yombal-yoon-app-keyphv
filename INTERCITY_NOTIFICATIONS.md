
# 📧📱 Notifications Inter-Régions - Documentation

## Vue d'ensemble

Ce système implémente des notifications automatiques par **Email** et **WhatsApp** lors de la création d'une livraison inter-régions dans l'application Yombal Yoon.

## Architecture

### 1. Système d'événements (`utils/eventSystem.ts`)

Un système d'événements léger et flexible qui permet de déclencher des actions de manière découplée.

**Fonctions principales :**

- `onEvent(eventName, handler)` - Enregistre un gestionnaire d'événements
- `triggerEvent(eventName, data)` - Déclenche un événement avec des données
- `sendEmail(options)` - Envoie un email via Supabase Edge Function
- `callWhatsApp(options)` - Envoie un message WhatsApp via Supabase Edge Function

**Exemple d'utilisation :**

```typescript
import { onEvent, triggerEvent, sendEmail, callWhatsApp } from '@/utils/eventSystem';

// Enregistrer un gestionnaire
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  await sendEmail({
    to: 'woyofaldem@gmail.com',
    subject: 'Nouvelle commande',
    html: '<h1>Nouvelle livraison</h1>',
  });
});

// Déclencher l'événement
await triggerEvent('INTER_REGION_DELIVERY_CREATED', deliveryData);
```

### 2. Configuration des notifications (`utils/notificationSetup.ts`)

Ce fichier configure les gestionnaires d'événements pour les notifications Email et WhatsApp.

**Initialisation :**

```typescript
import { initializeNotificationHandlers } from '@/utils/notificationSetup';

// Appeler au démarrage de l'app
initializeNotificationHandlers();
```

**Gestionnaires configurés :**

1. **Email** → `woyofaldem@gmail.com`
2. **WhatsApp** → `+221765676486`

### 3. Supabase Edge Function (`supabase/functions/send-intercity-notifications`)

Cette fonction gère l'envoi réel des notifications via :

- **Resend API** pour les emails
- **Twilio API** pour WhatsApp

**Variables d'environnement requises :**

```bash
RESEND_API_KEY=re_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Modes d'utilisation :**

1. **Mode standard** - Envoie email + WhatsApp pour une livraison inter-régions
2. **Mode email uniquement** - `emailOnly: true`
3. **Mode WhatsApp uniquement** - `whatsappOnly: true`

### 4. Intégration dans LivraisonContext

Le contexte `LivraisonContext` déclenche automatiquement l'événement `INTER_REGION_DELIVERY_CREATED` après la création réussie d'une livraison.

```typescript
// Dans addInterRegionalRequest()
triggerEvent('INTER_REGION_DELIVERY_CREATED', {
  senderName: newRequest.senderName,
  senderPhone: newRequest.senderPhone,
  departureCity: newRequest.departureRegion,
  arrivalCity: newRequest.destinationRegion,
  price: newRequest.pricing.total,
  // ...
});
```

## Format des notifications

### Email

**Destinataire :** woyofaldem@gmail.com  
**Sujet :** Nouvelle commande - Livraison Inter Régions

**Contenu :**

```html
<h2>Nouvelle livraison inter régions</h2>
<p><strong>Client :</strong> [Nom du client]</p>
<p><strong>Téléphone :</strong> [Téléphone]</p>
<p><strong>Départ :</strong> [Ville de départ]</p>
<p><strong>Arrivée :</strong> [Ville d'arrivée]</p>
<p><strong>Poids :</strong> [Poids] kg</p>
<p><strong>Prix estimé :</strong> [Prix] FCFA</p>
<p><strong>Date :</strong> [Date et heure]</p>
```

### WhatsApp

**Destinataire :** +221765676486

**Contenu :**

```
🚚 Nouvelle commande - Livraison Inter Régions

👤 Client : [Nom]
📞 Tel : [Téléphone]

📍 Départ : [Ville de départ]
📍 Arrivée : [Ville d'arrivée]

📦 Poids : [Poids] kg
💰 Prix estimé : [Prix] FCFA

🕒 [Date et heure]

Merci de traiter cette commande rapidement.
```

## Flux de données

```
1. Utilisateur remplit le formulaire de livraison inter-régions
   ↓
2. Clic sur "COMMANDER"
   ↓
3. LivraisonContext.addInterRegionalRequest()
   ↓
4. Enregistrement dans Supabase (table: intercity_deliveries)
   ↓
5. triggerEvent('INTER_REGION_DELIVERY_CREATED', deliveryData)
   ↓
6. Gestionnaires d'événements exécutés en parallèle:
   - sendEmail() → Supabase Edge Function → Resend API
   - callWhatsApp() → Supabase Edge Function → Twilio API
   ↓
7. Notifications envoyées ✅
```

## Configuration Supabase

### Déployer l'Edge Function

```bash
supabase functions deploy send-intercity-notifications
```

### Configurer les secrets

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Tests

### Test manuel

1. Ouvrir l'app Yombal Yoon
2. Aller dans l'onglet "Livraison"
3. Remplir le formulaire de livraison inter-régions
4. Cliquer sur "COMMANDER"
5. Vérifier :
   - Message de succès dans l'app
   - Email reçu sur woyofaldem@gmail.com
   - Message WhatsApp reçu sur +221765676486

### Logs de débogage

Les logs suivants sont disponibles dans la console :

```
🔔 Initializing notification handlers...
✅ Notification handlers initialized
🔔 Event triggered: INTER_REGION_DELIVERY_CREATED
📧 Sending email notification for inter-region delivery...
✅ Email notification sent successfully
📱 Sending WhatsApp notification for inter-region delivery...
✅ WhatsApp notification sent successfully
```

## Gestion des erreurs

Le système est conçu pour être résilient :

- Si l'email échoue, WhatsApp est quand même envoyé
- Si WhatsApp échoue, l'email est quand même envoyé
- Les erreurs sont loggées mais ne bloquent pas l'utilisateur
- La livraison est enregistrée même si les notifications échouent

## Extensibilité

Pour ajouter de nouveaux types de notifications :

1. **Créer un nouveau gestionnaire d'événements :**

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  // Votre logique de notification
  await sendSMS(delivery);
});
```

2. **Créer un nouvel événement :**

```typescript
// Dans votre contexte
await triggerEvent('NEW_EVENT_TYPE', eventData);

// Dans notificationSetup.ts
onEvent('NEW_EVENT_TYPE', async (data) => {
  // Gérer le nouvel événement
});
```

## Compatibilité

✅ **Web** - Fonctionne  
✅ **iOS** - Fonctionne  
✅ **Android** - Fonctionne

Le système utilise Supabase Edge Functions qui sont indépendantes de la plateforme.

## Sécurité

- Les clés API sont stockées dans Supabase Secrets (jamais dans le code)
- Les Edge Functions sont protégées par CORS
- Les emails sont envoyés via Resend (service sécurisé)
- WhatsApp utilise Twilio (service officiel)

## Support

Pour toute question ou problème :

1. Vérifier les logs dans la console
2. Vérifier les logs Supabase Edge Functions
3. Vérifier que les secrets sont bien configurés
4. Vérifier que les APIs Resend et Twilio sont actives

## Changelog

### Version 1.0.0 (2024)

- ✅ Système d'événements implémenté
- ✅ Notifications Email via Resend
- ✅ Notifications WhatsApp via Twilio
- ✅ Intégration avec LivraisonContext
- ✅ Documentation complète

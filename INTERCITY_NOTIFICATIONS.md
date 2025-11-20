
# Notifications Livraison Inter-Régions - Yombal Yoon

## 🎯 Objectif

Chaque fois qu'un utilisateur clique sur le bouton **COMMANDER** dans le formulaire "Livraison Inter régions", l'équipe Yombal Yoon est immédiatement notifiée via :

- **Email** : senshipservices@gmail.com
- **WhatsApp** : +221 76 567 64 86

## ✅ Fonctionnalités implémentées

### 1. Edge Function Supabase

Une nouvelle Edge Function `send-intercity-notifications` a été créée pour gérer l'envoi des notifications.

**Fichier** : `supabase/functions/send-intercity-notifications/index.ts`

**Fonctionnalités** :
- Envoi d'email via Resend API
- Envoi de message WhatsApp via Twilio API
- Formatage professionnel des messages (texte + HTML pour email)
- Gestion des erreurs et logs détaillés
- Support CORS pour les appels depuis l'application

### 2. Intégration dans LivraisonContext

Le contexte `LivraisonContext.tsx` a été mis à jour pour appeler automatiquement l'Edge Function après l'enregistrement d'une demande.

**Modifications** :
- Nouvelle fonction `sendNotifications()` qui appelle l'Edge Function
- Appel asynchrone des notifications (n'affecte pas l'expérience utilisateur)
- Les notifications sont envoyées même si l'enregistrement en base réussit

### 3. Contenu des notifications

Les notifications incluent toutes les informations du formulaire :

```
🚚 NOUVELLE DEMANDE DE LIVRAISON INTER-RÉGIONS

👤 EXPÉDITEUR:
Nom: [Nom du client]
Téléphone: [Téléphone]

👤 DESTINATAIRE:
Nom: [Nom destinataire]
Téléphone: [Téléphone]

📍 ITINÉRAIRE:
Départ: Dakar Métropolitaine
Destination: [Région / Département]

📦 DESCRIPTION:
[Description du colis ou "Non spécifiée"]

💰 TARIF TOTAL: [Prix] FCFA

⏰ Date: [Date et heure]
```

## 🔧 Configuration requise

Pour que les notifications fonctionnent, vous devez configurer les services externes :

### 1. Email (Resend)

Ajoutez ce secret dans Supabase :
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. WhatsApp (Twilio)

Ajoutez ces secrets dans Supabase :
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**📖 Voir le fichier `NOTIFICATIONS_SETUP.md` pour les instructions détaillées de configuration.**

## 🚀 Flux de fonctionnement

1. **Utilisateur remplit le formulaire** "Livraison Inter régions"
2. **Utilisateur clique sur "COMMANDER"**
3. **Demande enregistrée** dans la base de données Supabase (`intercity_deliveries`)
4. **Notifications envoyées** en arrière-plan :
   - Email à senshipservices@gmail.com
   - WhatsApp à +221 76 567 64 86
5. **Confirmation affichée** à l'utilisateur
6. **Équipe Yombal Yoon contacte** le client manuellement

## ⚠️ Important

### Pas de traitement automatique

Les demandes de livraison inter-régions **ne sont PAS** traitées automatiquement par le système :

- ❌ Pas d'assignation automatique aux livreurs
- ❌ Pas de tracking automatique
- ❌ Pas de mise à jour de statut automatique

L'équipe Yombal Yoon doit :
- ✅ Recevoir la notification
- ✅ Contacter le client manuellement
- ✅ Organiser la livraison en dehors de l'app
- ✅ (Optionnel) Mettre à jour le statut manuellement dans la base de données

### Notifications asynchrones

Les notifications sont envoyées en arrière-plan et n'affectent pas l'expérience utilisateur :

- Si les notifications échouent, la demande est quand même enregistrée
- L'utilisateur voit toujours le message de confirmation
- Les erreurs sont loggées dans Supabase Edge Functions

## 📊 Monitoring

### Vérifier les notifications envoyées

1. **Supabase Dashboard** :
   - Edge Functions > send-intercity-notifications > Logs
   - Recherchez les messages de succès/erreur

2. **Base de données** :
   - Table `intercity_deliveries`
   - Toutes les demandes sont enregistrées avec leur statut

3. **Email** :
   - Vérifiez la boîte mail senshipservices@gmail.com

4. **WhatsApp** :
   - Vérifiez le téléphone +221 76 567 64 86

## 🧪 Tests

### Test en développement

1. Remplissez le formulaire avec des données de test
2. Cliquez sur "COMMANDER"
3. Vérifiez les logs dans Supabase
4. Vérifiez la réception des notifications

### Test en production

1. Assurez-vous que tous les secrets sont configurés
2. Testez avec une vraie demande
3. Vérifiez que l'équipe reçoit bien les notifications
4. Vérifiez que la demande est bien enregistrée en base

## 📝 Fichiers modifiés/créés

### Nouveaux fichiers :
- `supabase/functions/send-intercity-notifications/index.ts` - Edge Function pour les notifications
- `NOTIFICATIONS_SETUP.md` - Guide de configuration détaillé
- `INTERCITY_NOTIFICATIONS.md` - Ce fichier (documentation)

### Fichiers modifiés :
- `contexts/LivraisonContext.tsx` - Ajout de l'appel aux notifications

### Fichiers inchangés :
- `app/(tabs)/livraison.tsx` - Aucune modification nécessaire
- `app/(tabs)/livraison.ios.tsx` - Aucune modification nécessaire

## 🔄 Prochaines étapes

1. **Configurer les services** (voir `NOTIFICATIONS_SETUP.md`)
2. **Tester les notifications** en développement
3. **Vérifier la réception** des emails et WhatsApp
4. **Passer en production** avec les vrais identifiants
5. **Former l'équipe** sur le processus de traitement manuel

## 💡 Améliorations futures possibles

- Ajouter un dashboard admin pour voir toutes les demandes
- Ajouter la possibilité de répondre directement depuis l'email
- Ajouter des notifications SMS en plus de WhatsApp
- Créer un système de suivi manuel des demandes
- Ajouter des statistiques sur les demandes inter-régions

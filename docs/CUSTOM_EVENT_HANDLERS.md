
# 🎯 Guide - Ajouter des gestionnaires d'événements personnalisés

## Vue d'ensemble

Le système d'événements de Yombal Yoon permet d'ajouter facilement de nouveaux gestionnaires pour réagir aux événements de l'application.

## Événements disponibles

### INTER_REGION_DELIVERY_CREATED

Déclenché lorsqu'une nouvelle livraison inter-régions est créée.

**Données fournies :**

```typescript
{
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  departureCity: string;
  departureRegion: string;
  arrivalCity: string;
  destinationRegion: string;
  weight: number;
  price: number;
  pricingTotal: number;
  description: string;
}
```

## Ajouter un gestionnaire d'événements

### Méthode 1 : Dans notificationSetup.ts

**Recommandé pour les gestionnaires globaux**

```typescript
// utils/notificationSetup.ts

import { onEvent, sendEmail, callWhatsApp } from './eventSystem';

export function initializeNotificationHandlers(): void {
  // Gestionnaire Email existant
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    await sendEmail({
      to: 'woyofaldem@gmail.com',
      subject: 'Nouvelle commande',
      html: `<h1>Nouvelle livraison</h1>`,
    });
  });

  // 🆕 VOTRE NOUVEAU GESTIONNAIRE
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    // Votre logique personnalisée
    console.log('Nouvelle livraison créée:', delivery);
    
    // Exemple : Envoyer un SMS
    await sendSMS({
      to: '+221XXXXXXXXX',
      message: `Nouvelle livraison: ${delivery.departureCity} → ${delivery.arrivalCity}`,
    });
  });
}
```

### Méthode 2 : Dans un composant React

**Recommandé pour les gestionnaires spécifiques à un composant**

```typescript
import { useEffect } from 'react';
import { onEvent, offEvent } from '@/utils/eventSystem';

export default function MyComponent() {
  useEffect(() => {
    // Définir le gestionnaire
    const handler = async (delivery) => {
      console.log('Livraison créée:', delivery);
      // Votre logique
    };

    // Enregistrer le gestionnaire
    onEvent('INTER_REGION_DELIVERY_CREATED', handler);

    // Nettoyer à la destruction du composant
    return () => {
      offEvent('INTER_REGION_DELIVERY_CREATED', handler);
    };
  }, []);

  return <View>...</View>;
}
```

## Créer un nouvel événement

### 1. Déclencher l'événement

```typescript
import { triggerEvent } from '@/utils/eventSystem';

// Dans votre contexte ou composant
async function handleAction() {
  const data = {
    userId: '123',
    action: 'completed',
    timestamp: new Date().toISOString(),
  };

  // Déclencher l'événement
  await triggerEvent('MY_CUSTOM_EVENT', data);
}
```

### 2. Écouter l'événement

```typescript
import { onEvent } from '@/utils/eventSystem';

// Dans notificationSetup.ts ou un composant
onEvent('MY_CUSTOM_EVENT', async (data) => {
  console.log('Événement personnalisé reçu:', data);
  // Votre logique
});
```

## Exemples de cas d'usage

### Exemple 1 : Notification Slack

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚚 Nouvelle livraison: ${delivery.departureCity} → ${delivery.arrivalCity}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Client:* ${delivery.senderName}\n*Prix:* ${delivery.price} FCFA`,
          },
        },
      ],
    }),
  });
});
```

### Exemple 2 : Enregistrement dans une base de données externe

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  await fetch('https://api.example.com/deliveries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY',
    },
    body: JSON.stringify({
      sender: delivery.senderName,
      recipient: delivery.recipientName,
      from: delivery.departureCity,
      to: delivery.arrivalCity,
      price: delivery.price,
      createdAt: new Date().toISOString(),
    }),
  });
});
```

### Exemple 3 : Notification push aux chauffeurs disponibles

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  // Récupérer les chauffeurs disponibles dans la région
  const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .eq('region', delivery.departureRegion)
    .eq('available', true);

  // Envoyer une notification à chaque chauffeur
  for (const driver of drivers) {
    await sendPushNotification({
      to: driver.pushToken,
      title: 'Nouvelle livraison disponible',
      body: `${delivery.departureCity} → ${delivery.arrivalCity} - ${delivery.price} FCFA`,
      data: { deliveryId: delivery.id },
    });
  }
});
```

### Exemple 4 : Mise à jour d'un tableau de bord en temps réel

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  // Émettre un événement WebSocket
  websocket.emit('new-delivery', {
    id: delivery.id,
    from: delivery.departureCity,
    to: delivery.arrivalCity,
    price: delivery.price,
    timestamp: Date.now(),
  });
});
```

## Bonnes pratiques

### 1. Gestion des erreurs

```typescript
onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
  try {
    await myAsyncOperation(delivery);
  } catch (error) {
    console.error('Erreur dans le gestionnaire:', error);
    // Ne pas laisser l'erreur se propager
  }
});
```

### 2. Opérations asynchrones

```typescript
// ✅ BON - Utiliser async/await
onEvent('MY_EVENT', async (data) => {
  await sendEmail(data);
  await updateDatabase(data);
});

// ❌ MAUVAIS - Oublier async
onEvent('MY_EVENT', (data) => {
  sendEmail(data); // Ne sera pas attendu
});
```

### 3. Nettoyage des gestionnaires

```typescript
// Dans un composant React
useEffect(() => {
  const handler = async (data) => {
    // Logique
  };

  onEvent('MY_EVENT', handler);

  // ✅ IMPORTANT - Nettoyer à la destruction
  return () => {
    offEvent('MY_EVENT', handler);
  };
}, []);
```

### 4. Éviter les boucles infinies

```typescript
// ❌ MAUVAIS - Peut créer une boucle infinie
onEvent('MY_EVENT', async (data) => {
  await triggerEvent('MY_EVENT', data); // Boucle !
});

// ✅ BON - Utiliser des événements différents
onEvent('EVENT_A', async (data) => {
  await triggerEvent('EVENT_B', data); // OK
});
```

## Débogage

### Activer les logs détaillés

```typescript
// Dans eventSystem.ts, les logs sont déjà activés
console.log(`🔔 Event triggered: ${eventName}`, data);
console.log(`✅ Event listener registered for: ${eventName}`);
```

### Vérifier les gestionnaires enregistrés

```typescript
import { eventSystem } from '@/utils/eventSystem';

// Afficher tous les gestionnaires
console.log('Gestionnaires enregistrés:', eventSystem);
```

## Événements futurs possibles

Voici quelques idées d'événements à implémenter :

- `PARCEL_DELIVERED` - Colis livré
- `RIDE_CREATED` - Trajet de covoiturage créé
- `RESERVATION_CONFIRMED` - Réservation confirmée
- `PAYMENT_COMPLETED` - Paiement effectué
- `USER_REGISTERED` - Nouvel utilisateur
- `DRIVER_VERIFIED` - Chauffeur vérifié

## Support

Pour toute question sur le système d'événements :

1. Consulter `utils/eventSystem.ts` pour le code source
2. Consulter `INTERCITY_NOTIFICATIONS.md` pour la documentation complète
3. Vérifier les logs de la console pour le débogage

---

**Le système d'événements est flexible et extensible. N'hésitez pas à l'adapter à vos besoins !**

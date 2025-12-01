
/**
 * Enhanced Notification Setup for Covoiturage Module
 * Provides robust push notifications that appear in the phone's notification bar
 * Similar to Uber, Yango, and other ride-sharing apps
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { onEvent, sendEmail, callWhatsApp } from './eventSystem';

/**
 * Configure notification handler to show notifications in system tray
 * This ensures notifications appear even when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show notification banner
    shouldPlaySound: true,       // Play notification sound
    shouldSetBadge: true,        // Update app badge count
    shouldShowBanner: true,      // Show in notification center
    shouldShowList: true,        // Add to notification list
  }),
});

/**
 * Setup Android notification channels
 * Required for Android 8.0+ to show notifications properly
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      // High priority channel for driver notifications
      await Notifications.setNotificationChannelAsync('covoiturage-driver', {
        name: 'Notifications Conducteur',
        description: 'Notifications importantes pour les conducteurs (nouvelles réservations, annulations)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8C00',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // High priority channel for passenger notifications
      await Notifications.setNotificationChannelAsync('covoiturage-passenger', {
        name: 'Notifications Passager',
        description: 'Notifications importantes pour les passagers (acceptation, refus, annulation)',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // General covoiturage channel
      await Notifications.setNotificationChannelAsync('covoiturage-general', {
        name: 'Covoiturage',
        description: 'Notifications générales de covoiturage',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Parcel/Colis notifications
      await Notifications.setNotificationChannelAsync('colis', {
        name: 'Livraison de Colis',
        description: 'Notifications pour les livraisons de colis',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      console.log('✅ Android notification channels configured successfully');
    } catch (error) {
      console.error('❌ Error setting up notification channels:', error);
    }
  }
}

/**
 * Request notification permissions
 * Must be called before sending any notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions not granted');
      return false;
    }

    console.log('✅ Notification permissions granted');
    
    // Setup channels after permissions are granted
    await setupNotificationChannels();
    
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Send a local push notification that appears in the system notification bar
 * Works even when app is in background or foreground
 */
export async function sendPushNotification(
  title: string,
  body: string,
  data?: any,
  channelId: string = 'covoiturage-general'
): Promise<string | null> {
  try {
    console.log('📤 Sending push notification:', { title, body, channelId });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        badge: 1,
        // Android specific
        ...(Platform.OS === 'android' && {
          channelId,
          color: channelId.includes('driver') ? '#FF8C00' : '#008000',
        }),
        // iOS specific
        ...(Platform.OS === 'ios' && {
          sound: 'default',
          badge: 1,
        }),
      },
      trigger: null, // Send immediately
    });

    console.log('✅ Push notification sent successfully:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return null;
  }
}

/**
 * Send notification for new reservation (to driver)
 */
export async function notifyDriverNewReservation(
  driverName: string,
  passengerName: string,
  numberOfPassengers: number,
  route: { from: string; to: string; date: string; time: string },
  reservationId: string,
  rideId: string
): Promise<void> {
  await sendPushNotification(
    '🚗 Nouvelle réservation !',
    `${passengerName} souhaite réserver ${numberOfPassengers} place(s) pour ${route.from} → ${route.to} le ${route.date}`,
    {
      type: 'reservation_created',
      reservationId,
      rideId,
      passengerName,
      numberOfPassengers,
      route,
    },
    'covoiturage-driver'
  );
}

/**
 * Send notification for reservation accepted (to passenger)
 */
export async function notifyPassengerReservationAccepted(
  passengerName: string,
  driverName: string,
  route: { from: string; to: string; date: string; time: string },
  reservationId: string,
  rideId: string
): Promise<void> {
  await sendPushNotification(
    '✅ Réservation acceptée !',
    `${driverName} a accepté votre réservation pour ${route.from} → ${route.to} le ${route.date} à ${route.time}`,
    {
      type: 'reservation_accepted',
      reservationId,
      rideId,
      driverName,
      route,
    },
    'covoiturage-passenger'
  );
}

/**
 * Send notification for reservation refused (to passenger)
 */
export async function notifyPassengerReservationRefused(
  passengerName: string,
  driverName: string,
  route: { from: string; to: string; date: string; time: string },
  reservationId: string,
  rideId: string
): Promise<void> {
  await sendPushNotification(
    '❌ Réservation refusée',
    `${driverName} a refusé votre réservation pour ${route.from} → ${route.to} le ${route.date}`,
    {
      type: 'reservation_refused',
      reservationId,
      rideId,
      driverName,
      route,
    },
    'covoiturage-passenger'
  );
}

/**
 * Send notification for ride cancelled (to all passengers)
 */
export async function notifyPassengersRideCancelled(
  passengerName: string,
  driverName: string,
  route: { from: string; to: string; date: string; time: string },
  rideId: string
): Promise<void> {
  await sendPushNotification(
    '⚠️ Trajet annulé',
    `Le trajet ${route.from} → ${route.to} du ${route.date} a été annulé par ${driverName}`,
    {
      type: 'ride_cancelled',
      rideId,
      driverName,
      route,
    },
    'covoiturage-passenger'
  );
}

/**
 * Send notification for parcel assignment (to driver)
 */
export async function notifyDriverParcelAssignment(
  driverName: string,
  parcelDetails: {
    from: string;
    to: string;
    weight?: string;
    price: number;
  },
  parcelId: string,
  assignmentId: string
): Promise<void> {
  await sendPushNotification(
    '📦 Nouveau colis assigné !',
    `Colis de ${parcelDetails.from} → ${parcelDetails.to}${parcelDetails.weight ? ` (${parcelDetails.weight})` : ''} - ${parcelDetails.price} FCFA`,
    {
      type: 'parcel_assignment',
      parcelId,
      assignmentId,
      parcelDetails,
    },
    'colis'
  );
}

/**
 * Initialize notification handlers for inter-region deliveries
 * Call this once when the app starts
 */
export function initializeNotificationHandlers(): void {
  console.log('🔔 Initializing notification handlers...');

  // Request permissions on app start
  requestNotificationPermissions().then(granted => {
    if (granted) {
      console.log('✅ Notification system ready');
    } else {
      console.log('⚠️ Notification permissions not granted - notifications will not work');
    }
  });

  // 📧 Email notification handler for inter-region deliveries
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    try {
      console.log('📧 Sending email notification for inter-region delivery...');
      
      await sendEmail({
        to: 'woyofaldem@gmail.com',
        subject: 'Nouvelle commande - Livraison Inter Régions',
        html: `
          <h2>Nouvelle livraison inter régions</h2>
          <p><strong>Client :</strong> ${delivery.senderName}</p>
          <p><strong>Téléphone :</strong> ${delivery.senderPhone}</p>
          <p><strong>Départ :</strong> ${delivery.departureCity || delivery.departureRegion}</p>
          <p><strong>Arrivée :</strong> ${delivery.arrivalCity || delivery.destinationRegion}</p>
          ${delivery.weight ? `<p><strong>Poids :</strong> ${delivery.weight} kg</p>` : ''}
          <p><strong>Prix estimé :</strong> ${delivery.price || delivery.pricingTotal} FCFA</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}</p>
        `,
      });

      console.log('✅ Email notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
    }
  });

  // 📱 WhatsApp notification handler for inter-region deliveries
  onEvent('INTER_REGION_DELIVERY_CREATED', async (delivery) => {
    try {
      console.log('📱 Sending WhatsApp notification for inter-region delivery...');
      
      await callWhatsApp({
        phone: '+221765676486',
        message: `
🚚 Nouvelle commande - Livraison Inter Régions

👤 Client : ${delivery.senderName}
📞 Tel : ${delivery.senderPhone}

📍 Départ : ${delivery.departureCity || delivery.departureRegion}
📍 Arrivée : ${delivery.arrivalCity || delivery.destinationRegion}

${delivery.weight ? `📦 Poids : ${delivery.weight} kg\n` : ''}💰 Prix estimé : ${delivery.price || delivery.pricingTotal} FCFA

🕒 ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}

Merci de traiter cette commande rapidement.
        `.trim(),
      });

      console.log('✅ WhatsApp notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending WhatsApp notification:', error);
    }
  });

  console.log('✅ Notification handlers initialized');
}

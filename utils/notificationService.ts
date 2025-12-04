
/**
 * Notification Service
 * Unified service for sending notifications through the backend Edge Function
 */

import { supabase } from '@/app/integrations/supabase/client';

export interface NotificationPayload {
  type: string;
  userId: string;
  title: string;
  message: string;
  metadata?: any;
  channels?: ('in_app' | 'push' | 'whatsapp')[];
  phoneNumber?: string;
}

export interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  channels: {
    in_app?: { success: boolean; id?: string; error?: string };
    push?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  };
}

/**
 * Send a notification through the unified Edge Function
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResponse> {
  try {
    console.log('📤 Sending notification:', payload);

    const { data, error } = await supabase.functions.invoke('send-notification-unified', {
      body: payload,
    });

    if (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }

    console.log('✅ Notification sent successfully:', data);
    return data as NotificationResponse;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    throw error;
  }
}

// ================================================
// COVOITURAGE NOTIFICATIONS - PART 1
// ================================================

/**
 * 1.1. Notify driver that a new reservation has been requested
 */
export async function notifyDriverNewReservation(params: {
  driverId: string;
  driverPhone: string;
  passengerName: string;
  numberOfPassengers: number;
  route: { from: string; to: string; date: string; time: string };
  reservationId: string;
  rideId: string;
  isUrgent?: boolean; // If departure < 2h
}): Promise<NotificationResponse> {
  const channels: ('in_app' | 'push' | 'whatsapp')[] = ['in_app', 'push'];
  
  // Add WhatsApp if urgent (departure < 2h)
  if (params.isUrgent) {
    channels.push('whatsapp');
  }

  return sendNotification({
    type: 'reservation_requested',
    userId: params.driverId,
    title: '🚗 Nouvelle demande de réservation !',
    message: `${params.passengerName} souhaite réserver ${params.numberOfPassengers} place(s) pour ${params.route.from} → ${params.route.to} le ${params.route.date}`,
    metadata: {
      reservationId: params.reservationId,
      rideId: params.rideId,
      passengerName: params.passengerName,
      numberOfPassengers: params.numberOfPassengers,
      route: params.route,
    },
    channels,
    phoneNumber: params.driverPhone,
  });
}

/**
 * 1.2. Notify passenger that their reservation was accepted
 */
export async function notifyPassengerReservationAccepted(params: {
  passengerId: string;
  passengerPhone: string;
  driverName: string;
  route: { from: string; to: string; date: string; time: string };
  reservationId: string;
  rideId: string;
  isCloseToDepart?: boolean;
}): Promise<NotificationResponse> {
  const channels: ('in_app' | 'push' | 'whatsapp')[] = ['in_app', 'push'];
  
  // Add WhatsApp if close to departure or push disabled
  if (params.isCloseToDepart) {
    channels.push('whatsapp');
  }

  return sendNotification({
    type: 'reservation_accepted',
    userId: params.passengerId,
    title: '✅ Réservation acceptée !',
    message: `${params.driverName} a accepté votre demande pour ${params.route.from} → ${params.route.to} le ${params.route.date} à ${params.route.time}`,
    metadata: {
      reservationId: params.reservationId,
      rideId: params.rideId,
      driverName: params.driverName,
      route: params.route,
    },
    channels,
    phoneNumber: params.passengerPhone,
  });
}

/**
 * 1.3. Notify passenger that their reservation was refused
 */
export async function notifyPassengerReservationRefused(params: {
  passengerId: string;
  passengerPhone: string;
  driverName: string;
  route: { from: string; to: string; date: string; time: string };
  reservationId: string;
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'reservation_refused',
    userId: params.passengerId,
    title: '❌ Réservation refusée',
    message: `${params.driverName} n'a pas accepté votre demande pour ${params.route.from} → ${params.route.to} le ${params.route.date}`,
    metadata: {
      reservationId: params.reservationId,
      rideId: params.rideId,
      driverName: params.driverName,
      route: params.route,
    },
    channels: ['in_app', 'push'],
  });
}

/**
 * 2.1. Send J-1 reminder (24h before departure)
 */
export async function sendReminderJMinus1(params: {
  userId: string;
  userPhone: string;
  isDriver: boolean;
  route: { from: string; to: string; date: string; time: string };
  rideId: string;
}): Promise<NotificationResponse> {
  const message = params.isDriver
    ? `Tu conduis demain ${params.route.from} → ${params.route.to} à ${params.route.time}`
    : `Rappel : Trajet demain ${params.route.from} → ${params.route.to} à ${params.route.time}`;

  return sendNotification({
    type: 'reminder_j_minus_1',
    userId: params.userId,
    title: '📅 Rappel : Trajet demain',
    message,
    metadata: {
      rideId: params.rideId,
      route: params.route,
      isDriver: params.isDriver,
    },
    channels: ['in_app', 'push'],
  });
}

/**
 * 2.2. Send H-1 reminder (1h before departure)
 */
export async function sendReminderHMinus1(params: {
  userId: string;
  userPhone: string;
  isDriver: boolean;
  route: { from: string; to: string; date: string; time: string };
  rideId: string;
}): Promise<NotificationResponse> {
  const message = params.isDriver
    ? 'Ton trajet démarre dans 1h'
    : 'Ton trajet démarre dans 1h. Sois à l\'heure 📍';

  return sendNotification({
    type: 'reminder_h_minus_1',
    userId: params.userId,
    title: '⏰ Trajet dans 1 heure',
    message,
    metadata: {
      rideId: params.rideId,
      route: params.route,
      isDriver: params.isDriver,
    },
    channels: ['in_app', 'push', 'whatsapp'],
    phoneNumber: params.userPhone,
  });
}

/**
 * 2.3. Notify passengers that driver has arrived
 */
export async function notifyPassengersDriverArrived(params: {
  passengerId: string;
  passengerPhone: string;
  driverName: string;
  meetingPoint: string;
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'driver_arrived',
    userId: params.passengerId,
    title: '📍 Le conducteur est arrivé !',
    message: `${params.driverName} est arrivé au point de rencontre. Rejoignez-le dans les 5 minutes.`,
    metadata: {
      rideId: params.rideId,
      driverName: params.driverName,
      meetingPoint: params.meetingPoint,
    },
    channels: ['in_app', 'push', 'whatsapp'],
    phoneNumber: params.passengerPhone,
  });
}

// ================================================
// COVOITURAGE NOTIFICATIONS - PART 2
// ================================================

/**
 * 3.1. Notify passengers that the ride has started
 */
export async function notifyPassengersRideStarted(params: {
  passengerId: string;
  route: { from: string; to: string };
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'ride_started',
    userId: params.passengerId,
    title: '🚗 Trajet démarré',
    message: `Le trajet ${params.route.from} → ${params.route.to} a démarré`,
    metadata: {
      rideId: params.rideId,
      route: params.route,
    },
    channels: ['in_app'],
  });
}

/**
 * 3.2. Notify passengers of last-minute cancellation by driver
 */
export async function notifyPassengerLastMinuteCancellation(params: {
  passengerId: string;
  passengerPhone: string;
  driverName: string;
  route: { from: string; to: string; date: string; time: string };
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'ride_cancelled',
    userId: params.passengerId,
    title: '❌ Trajet annulé',
    message: `${params.driverName} a annulé ${params.route.from} → ${params.route.to}`,
    metadata: {
      rideId: params.rideId,
      driverName: params.driverName,
      route: params.route,
    },
    channels: ['in_app', 'push', 'whatsapp'],
    phoneNumber: params.passengerPhone,
  });
}

/**
 * 3.3. Notify driver that a passenger cancelled
 */
export async function notifyDriverPassengerCancelled(params: {
  driverId: string;
  passengerName: string;
  numberOfPassengers: number;
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'reservation_cancelled_by_passenger',
    userId: params.driverId,
    title: '❌ Annulation de réservation',
    message: `${params.passengerName} a annulé sa réservation (${params.numberOfPassengers} place(s))`,
    metadata: {
      rideId: params.rideId,
      passengerName: params.passengerName,
      numberOfPassengers: params.numberOfPassengers,
    },
    channels: ['in_app', 'push'],
  });
}

/**
 * 4.1. Notify that the ride has ended
 */
export async function notifyRideEnded(params: {
  userId: string;
  route: { from: string; to: string };
  tripSummary: { duration: string; price: number };
  rideId: string;
  isDriver: boolean;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'ride_ended',
    userId: params.userId,
    title: '✅ Trajet terminé',
    message: `Le trajet ${params.route.from} → ${params.route.to} est terminé`,
    metadata: {
      rideId: params.rideId,
      route: params.route,
      tripSummary: params.tripSummary,
      isDriver: params.isDriver,
    },
    channels: ['in_app'],
  });
}

/**
 * 4.2. Request rating from user
 */
export async function requestRating(params: {
  userId: string;
  isDriver: boolean;
  route: { from: string; to: string };
  rideId: string;
}): Promise<NotificationResponse> {
  const title = params.isDriver
    ? '⭐ Note tes passagers'
    : '⭐ Note ton conducteur';
  
  const message = params.isDriver
    ? 'Comment s\'est passé ton trajet ? Note tes passagers'
    : `Note ton conducteur pour le trajet ${params.route.from} → ${params.route.to} 🚗`;

  return sendNotification({
    type: 'rating_request',
    userId: params.userId,
    title,
    message,
    metadata: {
      rideId: params.rideId,
      route: params.route,
      isDriver: params.isDriver,
    },
    channels: ['in_app', 'push'],
  });
}

// ================================================
// RIDE ALERTS
// ================================================

/**
 * Notify passenger that a matching ride has been published
 */
export async function notifyPassengerAlertMatch(params: {
  passengerId: string;
  passengerPhone: string;
  route: { from: string; to: string; date: string; time: string };
  price: number;
  seatsAvailable: number;
  rideId: string;
  alertId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'alert_match',
    userId: params.passengerId,
    title: '🔔 Nouveau trajet disponible !',
    message: `Nouveau trajet : ${params.route.from} → ${params.route.to} le ${params.route.date} à ${params.route.time}. Réserve ta place.`,
    metadata: {
      rideId: params.rideId,
      alertId: params.alertId,
      route: params.route,
      price: params.price,
      seatsAvailable: params.seatsAvailable,
    },
    channels: ['in_app', 'push'],
  });
}

/**
 * Notify driver that their ride has been published
 */
export async function notifyDriverRidePublished(params: {
  driverId: string;
  route: { from: string; to: string; date: string; time: string };
  rideId: string;
}): Promise<NotificationResponse> {
  return sendNotification({
    type: 'ride_published',
    userId: params.driverId,
    title: '✅ Trajet publié',
    message: `Ton trajet ${params.route.from} → ${params.route.to} du ${params.route.date} à ${params.route.time} est en ligne`,
    metadata: {
      rideId: params.rideId,
      route: params.route,
    },
    channels: ['in_app', 'push'],
  });
}

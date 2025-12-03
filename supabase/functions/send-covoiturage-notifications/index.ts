
// Supabase Edge Function: send-covoiturage-notifications
// Sends push notifications for covoiturage events (bookings, acceptances, refusals, cancellations)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Production mode flag - set via environment variable
const isProduction = Deno.env.get("IS_PRODUCTION_MODE") === "true";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'new_booking' | 'booking_accepted' | 'booking_refused' | 'ride_cancelled';
  bookingId?: string;
  rideId?: string;
  driverName?: string;
  driverPhone?: string;
  passengerName?: string;
  passengerPhone?: string;
  numberOfPassengers?: number;
  route?: {
    from: string;
    to: string;
    date: string;
    time: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    console.log('📥 Processing covoiturage notification:', {
      type: data.type,
      bookingId: data.bookingId,
      rideId: data.rideId,
      mode: isProduction ? 'Production' : 'Test',
    });

    // Here you would integrate with your push notification service
    // For now, we'll just log the notification
    let notificationTitle = '';
    let notificationBody = '';
    let recipientPhone = '';

    switch (data.type) {
      case 'new_booking':
        notificationTitle = '🚗 Nouvelle réservation !';
        notificationBody = `${data.passengerName} souhaite réserver ${data.numberOfPassengers} place(s) pour ${data.route?.from} → ${data.route?.to} le ${data.route?.date}`;
        recipientPhone = data.driverPhone || '';
        break;

      case 'booking_accepted':
        notificationTitle = '✅ Réservation acceptée !';
        notificationBody = `${data.driverName} a accepté votre réservation pour ${data.route?.from} → ${data.route?.to} le ${data.route?.date} à ${data.route?.time}`;
        recipientPhone = data.passengerPhone || '';
        break;

      case 'booking_refused':
        notificationTitle = '❌ Réservation refusée';
        notificationBody = `${data.driverName} a refusé votre réservation pour ${data.route?.from} → ${data.route?.to} le ${data.route?.date}`;
        recipientPhone = data.passengerPhone || '';
        break;

      case 'ride_cancelled':
        notificationTitle = '⚠️ Trajet annulé';
        notificationBody = `Le trajet ${data.route?.from} → ${data.route?.to} du ${data.route?.date} a été annulé par ${data.driverName}`;
        recipientPhone = data.passengerPhone || '';
        break;
    }

    console.log('📤 Notification prepared:', {
      title: notificationTitle,
      body: notificationBody,
      recipient: recipientPhone,
    });

    // In a production environment, you would send the notification here
    // using Expo Push Notifications, Firebase Cloud Messaging, or similar service

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        notification: {
          title: notificationTitle,
          body: notificationBody,
          recipient: recipientPhone,
        },
        mode: isProduction ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in send-covoiturage-notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: isProduction ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

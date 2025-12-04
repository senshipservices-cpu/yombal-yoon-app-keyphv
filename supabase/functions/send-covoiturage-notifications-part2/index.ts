
// Supabase Edge Function: send-covoiturage-notifications-part2
// Handles notifications for DURING and AFTER the ride (Part 2)
// - Ride start
// - Last-minute cancellations (driver)
// - Passenger cancellations
// - Ride end
// - Rating requests

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Production mode flag - set via environment variable
const isProduction = Deno.env.get("IS_PRODUCTION_MODE") === "true";

// Twilio credentials for WhatsApp
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 
    | 'ride_started'
    | 'ride_cancelled_last_minute'
    | 'passenger_cancelled'
    | 'ride_ended'
    | 'rating_request';
  rideId: string;
  driverName?: string;
  driverPhone?: string;
  passengerName?: string;
  passengerPhone?: string;
  passengerId?: string;
  numberOfPassengers?: number;
  route?: {
    from: string;
    to: string;
    date: string;
    time: string;
  };
  tripSummary?: {
    duration: string;
    price: number;
  };
}

/**
 * Send WhatsApp notification via Twilio
 */
async function sendWhatsAppNotification(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio credentials not configured, skipping WhatsApp');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Ensure phone number is in E.164 format
    let formattedPhone = to;
    if (!to.startsWith('+')) {
      formattedPhone = '+' + to;
    }
    if (!to.startsWith('+221') && !to.startsWith('221')) {
      formattedPhone = '+221' + to.replace(/^0+/, '');
    }

    const whatsappTo = `whatsapp:${formattedPhone}`;

    console.log('📱 Sending WhatsApp to:', whatsappTo);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_FROM,
          To: whatsappTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Twilio error:', data);
      return { success: false, error: data.message || 'Twilio API error' };
    }

    console.log('✅ WhatsApp sent successfully:', data.sid);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log notification to database
 */
async function logNotification(
  supabase: any,
  type: string,
  recipient: string,
  channel: 'push' | 'whatsapp' | 'in-app',
  status: 'sent' | 'failed',
  message: string,
  metadata?: any
): Promise<void> {
  try {
    // Create notifications table if it doesn't exist
    const { error: tableError } = await supabase
      .from('notification_logs')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating notification_logs table...');
      await supabase.rpc('create_notification_logs_table');
    }

    const { error } = await supabase
      .from('notification_logs')
      .insert({
        type,
        recipient,
        channel,
        status,
        message,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error logging notification:', error);
    } else {
      console.log('✅ Notification logged');
    }
  } catch (error) {
    console.error('❌ Exception logging notification:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();

    console.log('📥 Processing covoiturage notification (Part 2):', {
      type: data.type,
      rideId: data.rideId,
      mode: isProduction ? 'Production' : 'Test',
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let notificationTitle = '';
    let notificationBody = '';
    let whatsappMessage = '';
    let recipientPhone = '';
    let shouldSendWhatsApp = false;

    switch (data.type) {
      case 'ride_started':
        // 3.1. Démarrage du trajet
        // Passengers: In-app status update (handled by client)
        notificationTitle = '🚗 Trajet démarré';
        notificationBody = `Le trajet ${data.route?.from} → ${data.route?.to} a démarré`;
        recipientPhone = data.passengerPhone || '';
        shouldSendWhatsApp = false; // Only in-app
        break;

      case 'ride_cancelled_last_minute':
        // 3.2. Annulation de dernière minute (conducteur)
        notificationTitle = 'Trajet annulé ❌';
        notificationBody = `${data.driverName} a annulé ${data.route?.from} → ${data.route?.to}`;
        whatsappMessage = `Le conducteur a annulé votre trajet ${data.route?.from} → ${data.route?.to} du ${data.route?.date}. Vous pouvez en réserver un autre sur Yombal Yoon.`;
        recipientPhone = data.passengerPhone || '';
        shouldSendWhatsApp = true; // Push + WhatsApp + In-app
        break;

      case 'passenger_cancelled':
        // 3.3. Annulation par le passager
        notificationTitle = '❌ Annulation de réservation';
        notificationBody = `${data.passengerName} a annulé sa réservation`;
        recipientPhone = data.driverPhone || '';
        shouldSendWhatsApp = false; // Push + In-app only
        break;

      case 'ride_ended':
        // 4.1. Arrivée / Fin du trajet
        notificationTitle = '✅ Trajet terminé';
        notificationBody = `Le trajet ${data.route?.from} → ${data.route?.to} est terminé`;
        recipientPhone = data.passengerPhone || data.driverPhone || '';
        shouldSendWhatsApp = false; // In-app summary only
        break;

      case 'rating_request':
        // 4.2. Demande de notation (10-30 minutes après la fin)
        if (data.driverPhone) {
          // Request to driver
          notificationTitle = '⭐ Note tes passagers';
          notificationBody = `Comment s'est passé ton trajet ? Note tes passagers`;
          recipientPhone = data.driverPhone;
        } else if (data.passengerPhone) {
          // Request to passenger
          notificationTitle = '⭐ Note ton conducteur';
          notificationBody = `Note ton conducteur pour le trajet ${data.route?.from} → ${data.route?.to} 🚗`;
          recipientPhone = data.passengerPhone;
        }
        shouldSendWhatsApp = false; // Push + In-app only
        break;
    }

    console.log('📤 Notification prepared:', {
      title: notificationTitle,
      body: notificationBody,
      recipient: recipientPhone,
      shouldSendWhatsApp,
    });

    // Send WhatsApp if needed
    let whatsappResult = null;
    if (shouldSendWhatsApp && whatsappMessage && recipientPhone) {
      whatsappResult = await sendWhatsAppNotification(recipientPhone, whatsappMessage);
      
      // Log WhatsApp notification
      await logNotification(
        supabase,
        data.type,
        recipientPhone,
        'whatsapp',
        whatsappResult.success ? 'sent' : 'failed',
        whatsappMessage,
        { rideId: data.rideId, error: whatsappResult.error }
      );
    }

    // Log push notification (actual push is handled by client)
    await logNotification(
      supabase,
      data.type,
      recipientPhone,
      'push',
      'sent',
      notificationBody,
      { rideId: data.rideId }
    );

    // Log in-app notification
    await logNotification(
      supabase,
      data.type,
      recipientPhone,
      'in-app',
      'sent',
      notificationBody,
      { rideId: data.rideId }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications sent successfully',
        notification: {
          title: notificationTitle,
          body: notificationBody,
          recipient: recipientPhone,
        },
        whatsapp: whatsappResult,
        mode: isProduction ? 'production' : 'test',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in send-covoiturage-notifications-part2:', error);
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


// Edge Function: on-reservation-requested
// Triggered when a passenger requests a reservation
// Tasks:
// - Create in-app notification for driver
// - Send push to driver
// - Send WhatsApp if departure < 2h and whatsapp_optin

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReservationRequestedPayload {
  reservationId: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  numberOfPassengers: number;
  driverId: string;
  driverPhone: string;
  origin: string;
  destination: string;
  dateDeparture: string;
  timeDeparture: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: ReservationRequestedPayload = await req.json();
    
    console.log('📥 on-reservation-requested:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if departure is within 2 hours
    const departureDateTime = new Date(`${payload.dateDeparture}T${payload.timeDeparture}`);
    const now = new Date();
    const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isUrgent = hoursUntilDeparture < 2;

    console.log(`⏰ Hours until departure: ${hoursUntilDeparture.toFixed(2)}, urgent: ${isUrgent}`);

    // Determine channels
    const channels: ('in_app' | 'push' | 'whatsapp')[] = ['in_app', 'push'];
    if (isUrgent) {
      channels.push('whatsapp');
    }

    // Notify driver
    await supabase.functions.invoke('send-notification-unified', {
      body: {
        type: 'reservation_requested',
        userId: payload.driverId,
        title: '🚗 Nouvelle demande de réservation !',
        message: `${payload.passengerName} souhaite réserver ${payload.numberOfPassengers} place(s) pour ${payload.origin} → ${payload.destination} le ${payload.dateDeparture}`,
        metadata: {
          reservationId: payload.reservationId,
          rideId: payload.rideId,
          passengerId: payload.passengerId,
          passengerName: payload.passengerName,
          numberOfPassengers: payload.numberOfPassengers,
          origin: payload.origin,
          destination: payload.destination,
          dateDeparture: payload.dateDeparture,
          timeDeparture: payload.timeDeparture,
          isUrgent,
        },
        channels,
        phoneNumber: payload.driverPhone,
      },
    });

    // Create in-app notification for passenger (confirmation)
    await supabase.functions.invoke('send-notification-unified', {
      body: {
        type: 'reservation_sent',
        userId: payload.passengerId,
        title: '✅ Demande envoyée',
        message: 'Demande envoyée ! En attente de validation.',
        metadata: {
          reservationId: payload.reservationId,
          rideId: payload.rideId,
        },
        channels: ['in_app'],
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        isUrgent,
        channelsUsed: channels,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-reservation-requested:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

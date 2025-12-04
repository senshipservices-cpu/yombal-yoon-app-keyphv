
// Edge Function: on-reservation-status-changed
// Triggered when driver accepts or refuses a reservation
// Tasks:
// - accepted: Push + in-app + WhatsApp (if needed) to passenger
// - refused: Push + in-app to passenger

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReservationStatusChangedPayload {
  reservationId: string;
  rideId: string;
  status: 'accepted' | 'refused';
  passengerId: string;
  passengerPhone: string;
  driverId: string;
  driverName: string;
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
    const payload: ReservationStatusChangedPayload = await req.json();
    
    console.log('📥 on-reservation-status-changed:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (payload.status === 'accepted') {
      // Check if ride is close to departure
      const departureDateTime = new Date(`${payload.dateDeparture}T${payload.timeDeparture}`);
      const now = new Date();
      const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isCloseToDepart = hoursUntilDeparture < 4;

      const channels: ('in_app' | 'push' | 'whatsapp')[] = ['in_app', 'push'];
      if (isCloseToDepart) {
        channels.push('whatsapp');
      }

      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'reservation_accepted',
          userId: payload.passengerId,
          title: '✅ Réservation acceptée !',
          message: `${payload.driverName} a accepté votre demande pour ${payload.origin} → ${payload.destination} le ${payload.dateDeparture} à ${payload.timeDeparture}`,
          metadata: {
            reservationId: payload.reservationId,
            rideId: payload.rideId,
            driverName: payload.driverName,
            origin: payload.origin,
            destination: payload.destination,
            dateDeparture: payload.dateDeparture,
            timeDeparture: payload.timeDeparture,
          },
          channels,
          phoneNumber: payload.passengerPhone,
        },
      });
    } else if (payload.status === 'refused') {
      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'reservation_refused',
          userId: payload.passengerId,
          title: '❌ Réservation refusée',
          message: `${payload.driverName} n'a pas accepté votre demande pour ${payload.origin} → ${payload.destination} le ${payload.dateDeparture}`,
          metadata: {
            reservationId: payload.reservationId,
            rideId: payload.rideId,
            driverName: payload.driverName,
            origin: payload.origin,
            destination: payload.destination,
            dateDeparture: payload.dateDeparture,
          },
          channels: ['in_app', 'push'],
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-reservation-status-changed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

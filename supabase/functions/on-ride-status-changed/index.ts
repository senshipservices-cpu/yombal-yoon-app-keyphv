
// Edge Function: on-ride-status-changed
// Triggered when ride status changes
// Tasks:
// - in_progress: in-app for passengers
// - cancelled_by_driver: push + WhatsApp to passengers
// - cancelled_by_passenger: push to driver
// - completed: status updated

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RideStatusChangedPayload {
  rideId: string;
  status: 'pending' | 'started' | 'ended' | 'cancelled';
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  dateDeparture: string;
  timeDeparture: string;
  cancelledBy?: 'driver' | 'passenger';
  cancelledPassengerId?: string;
  cancelledPassengerName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: RideStatusChangedPayload = await req.json();
    
    console.log('📥 on-ride-status-changed:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (payload.status === 'started') {
      // Notify passengers that ride has started
      const { data: bookings } = await supabase
        .from('carpool_bookings')
        .select('passenger_id')
        .eq('ride_id', payload.rideId)
        .eq('status', 'accepted');

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          await supabase.functions.invoke('send-notification-unified', {
            body: {
              type: 'ride_started',
              userId: booking.passenger_id,
              title: '🚗 Trajet démarré',
              message: `Le trajet ${payload.origin} → ${payload.destination} a démarré`,
              metadata: {
                rideId: payload.rideId,
                origin: payload.origin,
                destination: payload.destination,
              },
              channels: ['in_app'],
            },
          });
        }
      }
    } else if (payload.status === 'cancelled' && payload.cancelledBy === 'driver') {
      // Notify passengers of cancellation
      const { data: bookings } = await supabase
        .from('carpool_bookings')
        .select('*, user_profiles!carpool_bookings_passenger_id_fkey(phone_number)')
        .eq('ride_id', payload.rideId)
        .eq('status', 'accepted');

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          const passenger = booking.user_profiles;
          
          await supabase.functions.invoke('send-notification-unified', {
            body: {
              type: 'ride_cancelled',
              userId: booking.passenger_id,
              title: '❌ Trajet annulé',
              message: `${payload.driverName} a annulé ${payload.origin} → ${payload.destination}`,
              metadata: {
                rideId: payload.rideId,
                driverName: payload.driverName,
                origin: payload.origin,
                destination: payload.destination,
                dateDeparture: payload.dateDeparture,
              },
              channels: ['in_app', 'push', 'whatsapp'],
              phoneNumber: passenger?.phone_number,
            },
          });
        }
      }
    } else if (payload.status === 'cancelled' && payload.cancelledBy === 'passenger') {
      // Notify driver of passenger cancellation
      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'reservation_cancelled_by_passenger',
          userId: payload.driverId,
          title: '❌ Annulation de réservation',
          message: `${payload.cancelledPassengerName} a annulé sa réservation`,
          metadata: {
            rideId: payload.rideId,
            passengerId: payload.cancelledPassengerId,
            passengerName: payload.cancelledPassengerName,
          },
          channels: ['in_app', 'push'],
        },
      });
    } else if (payload.status === 'ended') {
      // Ride completed - notifications handled by on-rating-request
      console.log('✅ Ride ended, rating requests will be sent by scheduled job');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-ride-status-changed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

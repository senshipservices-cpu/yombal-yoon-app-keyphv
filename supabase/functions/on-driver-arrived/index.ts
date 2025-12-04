
// Edge Function: on-driver-arrived
// Triggered when driver clicks "Je suis arrivé"
// Tasks:
// - Send push + WhatsApp to passengers
// - Create in-app popup

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriverArrivedPayload {
  rideId: string;
  driverId: string;
  driverName: string;
  meetingPoint: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: DriverArrivedPayload = await req.json();
    
    console.log('📥 on-driver-arrived:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get confirmed passengers
    const { data: bookings } = await supabase
      .from('carpool_bookings')
      .select('*, user_profiles!carpool_bookings_passenger_id_fkey(full_name, phone_number)')
      .eq('ride_id', payload.rideId)
      .eq('status', 'accepted');

    if (!bookings || bookings.length === 0) {
      console.log('⚠️ No confirmed passengers found');
      return new Response(
        JSON.stringify({ success: true, passengersNotified: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Notify each passenger
    for (const booking of bookings) {
      const passenger = booking.user_profiles;
      
      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'driver_arrived',
          userId: booking.passenger_id,
          title: '📍 Le conducteur est arrivé !',
          message: `${payload.driverName} est arrivé au point de rencontre. Rejoignez-le dans les 5 minutes.`,
          metadata: {
            rideId: payload.rideId,
            reservationId: booking.id,
            driverName: payload.driverName,
            meetingPoint: payload.meetingPoint,
          },
          channels: ['in_app', 'push', 'whatsapp'],
          phoneNumber: passenger?.phone_number,
        },
      });
    }

    console.log(`✅ Notified ${bookings.length} passengers`);

    return new Response(
      JSON.stringify({
        success: true,
        passengersNotified: bookings.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-driver-arrived:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

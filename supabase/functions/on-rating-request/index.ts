
// Edge Function: on-rating-request
// Scheduled cron job to request ratings
// Tasks:
// - Find rides ended 10-30 minutes ago
// - Send push notifications to request ratings
// - Create in-app notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('📥 on-rating-request: Starting scheduled job');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Find rides that ended 10-30 minutes ago and haven't had rating requests sent
    const { data: rides } = await supabase
      .from('carpool_rides')
      .select('*, user_profiles!carpool_rides_driver_id_fkey(full_name, phone_number)')
      .eq('ride_status', 'ended')
      .gte('ended_at', thirtyMinutesAgo.toISOString())
      .lte('ended_at', tenMinutesAgo.toISOString())
      .is('rating_requested_at', null);

    if (!rides || rides.length === 0) {
      console.log('⚠️ No rides found for rating requests');
      return new Response(
        JSON.stringify({ success: true, ridesProcessed: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`⭐ Found ${rides.length} rides for rating requests`);

    for (const ride of rides) {
      // Request rating from driver
      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'rating_request',
          userId: ride.driver_id,
          title: '⭐ Note tes passagers',
          message: 'Comment s\'est passé ton trajet ? Note tes passagers',
          metadata: {
            rideId: ride.id,
            origin: ride.departure_city || ride.origin,
            destination: ride.arrival_city || ride.destination,
            isDriver: true,
          },
          channels: ['in_app', 'push'],
        },
      });

      // Get confirmed passengers
      const { data: bookings } = await supabase
        .from('carpool_bookings')
        .select('passenger_id')
        .eq('ride_id', ride.id)
        .eq('status', 'accepted');

      if (bookings && bookings.length > 0) {
        for (const booking of bookings) {
          await supabase.functions.invoke('send-notification-unified', {
            body: {
              type: 'rating_request',
              userId: booking.passenger_id,
              title: '⭐ Note ton conducteur',
              message: `Note ton conducteur pour le trajet ${ride.departure_city || ride.origin} → ${ride.arrival_city || ride.destination} 🚗`,
              metadata: {
                rideId: ride.id,
                reservationId: booking.id,
                origin: ride.departure_city || ride.origin,
                destination: ride.arrival_city || ride.destination,
                isDriver: false,
              },
              channels: ['in_app', 'push'],
            },
          });
        }
      }

      // Mark rating request as sent
      await supabase
        .from('carpool_rides')
        .update({ rating_requested_at: now.toISOString() })
        .eq('id', ride.id);
    }

    console.log(`✅ Rating requests sent for ${rides.length} rides`);

    return new Response(
      JSON.stringify({
        success: true,
        ridesProcessed: rides.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-rating-request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

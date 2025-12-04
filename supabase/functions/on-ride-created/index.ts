
// Edge Function: on-ride-created
// Triggered when a driver publishes a new ride
// Tasks:
// - Create in-app notification for driver
// - Match ride with ride_alerts
// - Notify matching passengers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RideCreatedPayload {
  rideId: string;
  driverId: string;
  origin: string;
  destination: string;
  dateDeparture: string;
  timeDeparture: string;
  price: number;
  seatsAvailable: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: RideCreatedPayload = await req.json();
    
    console.log('📥 on-ride-created:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Notify driver that ride is published
    const { data: driver } = await supabase
      .from('user_profiles')
      .select('full_name, phone_number')
      .eq('id', payload.driverId)
      .single();

    if (driver) {
      await supabase.functions.invoke('send-notification-unified', {
        body: {
          type: 'ride_published',
          userId: payload.driverId,
          title: '✅ Trajet publié',
          message: `Ton trajet ${payload.origin} → ${payload.destination} du ${payload.dateDeparture} à ${payload.timeDeparture} est en ligne`,
          metadata: {
            rideId: payload.rideId,
            origin: payload.origin,
            destination: payload.destination,
            dateDeparture: payload.dateDeparture,
            timeDeparture: payload.timeDeparture,
          },
          channels: ['in_app', 'push'],
        },
      });
    }

    // 2. Match with ride alerts
    const { data: alerts } = await supabase
      .from('ride_alerts')
      .select('*')
      .eq('active', true)
      .or(`origin.eq.${payload.origin},origin_city.eq.${payload.origin}`)
      .or(`destination.eq.${payload.destination},destination_city.eq.${payload.destination}`);

    console.log(`🔍 Found ${alerts?.length || 0} matching alerts`);

    // 3. Notify matching passengers
    if (alerts && alerts.length > 0) {
      for (const alert of alerts) {
        // Check date filter
        if (alert.date_filter) {
          const alertDate = new Date(alert.date_filter);
          const rideDate = new Date(payload.dateDeparture);
          if (alertDate.toDateString() !== rideDate.toDateString()) {
            continue;
          }
        }

        // Check date range
        if (alert.date_from && alert.date_to) {
          const rideDate = new Date(payload.dateDeparture);
          const dateFrom = new Date(alert.date_from);
          const dateTo = new Date(alert.date_to);
          if (rideDate < dateFrom || rideDate > dateTo) {
            continue;
          }
        }

        // Check price
        if (alert.max_price && payload.price > alert.max_price) {
          continue;
        }

        // Check seats
        if (alert.min_seats && payload.seatsAvailable < alert.min_seats) {
          continue;
        }

        // Send notification to passenger
        await supabase.functions.invoke('send-notification-unified', {
          body: {
            type: 'alert_match',
            userId: alert.user_id,
            title: '🔔 Nouveau trajet disponible !',
            message: `Nouveau trajet : ${payload.origin} → ${payload.destination} le ${payload.dateDeparture} à ${payload.timeDeparture}. Réserve ta place.`,
            metadata: {
              rideId: payload.rideId,
              alertId: alert.id,
              origin: payload.origin,
              destination: payload.destination,
              dateDeparture: payload.dateDeparture,
              timeDeparture: payload.timeDeparture,
              price: payload.price,
              seatsAvailable: payload.seatsAvailable,
            },
            channels: ['in_app', 'push'],
            phoneNumber: alert.user_phone,
          },
        });

        console.log(`✅ Notified passenger ${alert.user_id} for alert ${alert.id}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsMatched: alerts?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in on-ride-created:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

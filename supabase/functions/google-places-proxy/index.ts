
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const GOOGLE_MAPS_API_KEY = "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Action:', action, 'Params:', params);

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        // Build autocomplete URL with all parameters
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: GOOGLE_MAPS_API_KEY,
        });

        // For comprehensive landmark coverage in Dakar metropolitan area:
        // We use 'establishment' type to include ALL types of places:
        // - Hospitals and health centers (hospital, health, doctor, pharmacy)
        // - Places of worship (mosque, church, hindu_temple, synagogue)
        // - Streets, neighborhoods, and administrative areas (route, sublocality, locality)
        // - Roundabouts and intersections (intersection, point_of_interest)
        // - Markets and public places (shopping_mall, market, store)
        // - Universities, schools, and training centers (university, school, secondary_school, primary_school)
        // - Administrative buildings and public services (local_government_office, city_hall, post_office)
        // - Factories, industrial zones, and major landmarks (factory, establishment, point_of_interest)
        //
        // By using 'establishment' we get businesses and landmarks
        // By NOT specifying types, we also get addresses, streets, and neighborhoods
        // The location bias ensures we only get results from Dakar metropolitan area
        
        if (params.types) {
          // If types is explicitly provided (e.g., for city autocomplete), use it
          urlParams.append('types', params.types);
        }
        // If no types specified, we get ALL results (addresses + establishments + POIs)
        // This is what we want for comprehensive Dakar landmark coverage

        // Add location bias for Dakar - this is CRITICAL for limiting to Dakar metro area
        if (params.location) {
          urlParams.append('location', params.location);
        }

        // Add radius for location bias - 45km covers entire Dakar metropolitan area
        // Including: Dakar, Parcelles, Pikine, Guédiawaye, Keur Massar, Mbao, 
        // Bargny, Rufisque, Sébikotane, Bambilor, Diamaguène, Diamniadio
        if (params.radius) {
          urlParams.append('radius', params.radius);
        }

        // Restrict to Senegal only
        if (params.components) {
          urlParams.append('components', params.components);
        }

        // Set language to French
        if (params.language) {
          urlParams.append('language', params.language);
        }

        // Add strictbounds to ensure results are ONLY within the specified radius
        // This prevents results from outside Dakar metropolitan area
        urlParams.append('strictbounds', 'true');

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log('Autocomplete URL:', url);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        // Get place details (coordinates, name, types, etc.)
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=geometry,formatted_address,name,types,address_components&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Place Details URL:', url);
        response = await fetch(url);
        break;
      }

      case 'distance_matrix': {
        // Calculate distance and duration
        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${params.originLat},${params.originLng}&destinations=${params.destLat},${params.destLng}&mode=driving&language=fr&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Distance Matrix URL:', url);
        response = await fetch(url);
        break;
      }

      case 'city_autocomplete': {
        // City autocomplete (for covoiturage)
        url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(params.input)}&types=(cities)&language=fr&components=country:sn&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('City Autocomplete URL:', url);
        response = await fetch(url);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    const data = await response.json();
    console.log('API Response status:', data.status);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('API Error:', data.error_message || data.status);
    } else if (data.predictions) {
      console.log(`Found ${data.predictions.length} predictions`);
      // Log sample of place types for debugging
      if (data.predictions.length > 0) {
        const sampleTypes = data.predictions.slice(0, 3).map((p: any) => ({
          name: p.description,
          types: p.types
        }));
        console.log('Sample place types:', JSON.stringify(sampleTypes, null, 2));
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in google-places-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

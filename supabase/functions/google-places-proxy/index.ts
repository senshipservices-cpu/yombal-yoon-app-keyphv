
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle supporte plusieurs clés API selon la plateforme (Web, Android, iOS)

const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB');
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID');
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform'
};

function getApiKeyForPlatform(platform: string): { key: string; error?: string } {
  console.log(`🔑 Platform: ${platform}`);
  
  switch (platform.toLowerCase()) {
    case 'ios':
      if (!GOOGLE_MAPS_API_KEY_IOS) {
        console.error('❌ GOOGLE_MAPS_API_KEY_IOS not configured');
        return {
          key: '',
          error: 'iOS API key not configured. Please add GOOGLE_MAPS_API_KEY_IOS to Supabase Edge Function secrets.'
        };
      }
      return { key: GOOGLE_MAPS_API_KEY_IOS };
      
    case 'android':
      if (!GOOGLE_MAPS_API_KEY_ANDROID) {
        console.error('❌ GOOGLE_MAPS_API_KEY_ANDROID not configured');
        return {
          key: '',
          error: 'Android API key not configured. Please add GOOGLE_MAPS_API_KEY_ANDROID to Supabase Edge Function secrets.'
        };
      }
      return { key: GOOGLE_MAPS_API_KEY_ANDROID };
      
    case 'web':
    default:
      if (!GOOGLE_MAPS_API_KEY_WEB) {
        console.error('❌ GOOGLE_MAPS_API_KEY_WEB not configured');
        return {
          key: '',
          error: 'Web API key not configured. Please add GOOGLE_MAPS_API_KEY_WEB to Supabase Edge Function secrets.'
        };
      }
      return { key: GOOGLE_MAPS_API_KEY_WEB };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const platform = req.headers.get('x-platform') || 'web';
    
    const apiKeyResult = getApiKeyForPlatform(platform);
    
    if (apiKeyResult.error) {
      console.error('❌ API Key error:', apiKeyResult.error);
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: apiKeyResult.error,
          platform,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = apiKeyResult.key;
    console.log(`📱 ${platform} - ${action}`);

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: apiKey,
        });

        if (params.location) {
          urlParams.append('location', params.location);
        } else {
          urlParams.append('location', '14.6928,-17.4467');
        }

        if (params.radius) {
          urlParams.append('radius', params.radius.toString());
        } else {
          urlParams.append('radius', '45000');
        }

        if (params.components) {
          urlParams.append('components', params.components);
        } else {
          urlParams.append('components', 'country:sn');
        }

        if (params.language) {
          urlParams.append('language', params.language);
        } else {
          urlParams.append('language', 'fr');
        }

        if (params.strictbounds !== undefined) {
          urlParams.append('strictbounds', params.strictbounds.toString());
        } else {
          urlParams.append('strictbounds', 'true');
        }

        url = `${baseUrl}?${urlParams.toString()}`;
        response = await fetch(url);
        break;
      }

      case 'city_autocomplete': {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          types: '(cities)',
          components: 'country:sn',
          language: 'fr',
          key: apiKey,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${apiKey}`;
        response = await fetch(url);
        break;
      }

      case 'distance_matrix': {
        let origins: string;
        let destinations: string;

        if (params.origins && params.destinations) {
          origins = params.origins;
          destinations = params.destinations;
        } else if (params.originLat && params.originLng && params.destLat && params.destLng) {
          origins = `${params.originLat},${params.originLng}`;
          destinations = `${params.destLat},${params.destLng}`;
        } else {
          throw new Error('Missing required parameters: origins/destinations or originLat/originLng/destLat/destLng');
        }

        const mode = params.mode || 'driving';
        const language = params.language || 'fr';

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${apiKey}`;
        response = await fetch(url);
        break;
      }

      default:
        console.error('❌ Invalid action:', action);
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ ${data.status}: ${data.error_message || 'No error message'}`);
    } else if (data.predictions) {
      console.log(`✅ ${data.predictions.length} results`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('💥 Exception:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

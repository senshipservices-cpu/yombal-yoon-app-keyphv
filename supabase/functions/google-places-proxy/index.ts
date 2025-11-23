
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle supporte plusieurs clés API selon la plateforme (Web, Android, iOS)
//
// CONFIGURATION REQUISE:
// - GOOGLE_MAPS_API_KEY_WEB: Pour les requêtes depuis le navigateur web
// - GOOGLE_MAPS_API_KEY_ANDROID: Pour les requêtes depuis l'app Android
// - GOOGLE_MAPS_API_KEY_IOS: Pour les requêtes depuis l'app iOS
//
// Chaque clé doit être configurée dans Google Cloud Console avec les restrictions appropriées:
// - Web: Restrictions HTTP referrers (*.natively.dev/*, localhost/*)
// - Android: Restrictions d'application (package name + SHA-1)
// - iOS: Restrictions d'application (Bundle ID)

const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB');
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID');
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform'
};

interface ApiKeyResult {
  key: string;
  error?: string;
  platform: string;
}

function getApiKeyForPlatform(platform: string): ApiKeyResult {
  console.log(`🔑 Demande de clé API pour la plateforme: ${platform}`);
  
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'ios':
      if (!GOOGLE_MAPS_API_KEY_IOS) {
        console.error('❌ GOOGLE_MAPS_API_KEY_IOS non configurée');
        return {
          key: '',
          platform: 'iOS',
          error: 'La clé API Google Maps pour iOS n\'est pas configurée. Veuillez ajouter GOOGLE_MAPS_API_KEY_IOS aux secrets Supabase Edge Function. Consultez GOOGLE_MAPS_PLATFORM_SETUP.md pour les instructions détaillées.'
        };
      }
      console.log('✅ Utilisation de la clé API iOS');
      return { key: GOOGLE_MAPS_API_KEY_IOS, platform: 'iOS' };
      
    case 'android':
      if (!GOOGLE_MAPS_API_KEY_ANDROID) {
        console.error('❌ GOOGLE_MAPS_API_KEY_ANDROID non configurée');
        return {
          key: '',
          platform: 'Android',
          error: 'La clé API Google Maps pour Android n\'est pas configurée. Veuillez ajouter GOOGLE_MAPS_API_KEY_ANDROID aux secrets Supabase Edge Function. Consultez GOOGLE_MAPS_PLATFORM_SETUP.md pour les instructions détaillées.'
        };
      }
      console.log('✅ Utilisation de la clé API Android');
      return { key: GOOGLE_MAPS_API_KEY_ANDROID, platform: 'Android' };
      
    case 'web':
    default:
      if (!GOOGLE_MAPS_API_KEY_WEB) {
        console.error('❌ GOOGLE_MAPS_API_KEY_WEB non configurée');
        return {
          key: '',
          platform: 'Web',
          error: 'La clé API Google Maps pour Web n\'est pas configurée. Veuillez ajouter GOOGLE_MAPS_API_KEY_WEB aux secrets Supabase Edge Function. Consultez GOOGLE_MAPS_PLATFORM_SETUP.md pour les instructions détaillées.'
        };
      }
      console.log('✅ Utilisation de la clé API Web');
      return { key: GOOGLE_MAPS_API_KEY_WEB, platform: 'Web' };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const platform = req.headers.get('x-platform') || 'web';
    
    console.log(`📱 Requête: ${platform} - ${action}`);
    console.log(`📊 Paramètres:`, JSON.stringify(params, null, 2));
    
    const apiKeyResult = getApiKeyForPlatform(platform);
    
    if (apiKeyResult.error) {
      console.error(`❌ Erreur de clé API pour ${apiKeyResult.platform}:`, apiKeyResult.error);
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: apiKeyResult.error,
          platform: apiKeyResult.platform,
          timestamp: new Date().toISOString(),
          help: {
            message: 'Configuration requise dans Supabase',
            steps: [
              '1. Créez une clé API dans Google Cloud Console',
              `2. Configurez les restrictions pour ${apiKeyResult.platform}`,
              '3. Ajoutez la clé aux secrets Supabase Edge Function',
              '4. Redéployez cette Edge Function'
            ],
            documentation: 'GOOGLE_MAPS_PLATFORM_SETUP.md'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = apiKeyResult.key;
    console.log(`🔐 Clé API ${apiKeyResult.platform} chargée avec succès`);

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: apiKey,
        });

        // Location (default: Dakar, Senegal)
        if (params.location) {
          urlParams.append('location', params.location);
        } else {
          urlParams.append('location', '14.6928,-17.4467');
        }

        // Radius (default: 45km)
        if (params.radius) {
          urlParams.append('radius', params.radius.toString());
        } else {
          urlParams.append('radius', '45000');
        }

        // Components (default: Senegal)
        if (params.components) {
          urlParams.append('components', params.components);
        } else {
          urlParams.append('components', 'country:sn');
        }

        // Language (default: French)
        if (params.language) {
          urlParams.append('language', params.language);
        } else {
          urlParams.append('language', 'fr');
        }

        // Strict bounds
        if (params.strictbounds !== undefined) {
          urlParams.append('strictbounds', params.strictbounds.toString());
        } else {
          urlParams.append('strictbounds', 'true');
        }

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log(`🔍 Autocomplete pour: "${params.input}" (${apiKeyResult.platform})`);
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
        console.log(`🏙️ City autocomplete pour: "${params.input}" (${apiKeyResult.platform})`);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${apiKey}`;
        console.log(`📍 Place details pour: ${params.placeId} (${apiKeyResult.platform})`);
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
          throw new Error('Paramètres manquants: origins/destinations ou originLat/originLng/destLat/destLng');
        }

        const mode = params.mode || 'driving';
        const language = params.language || 'fr';

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${apiKey}`;
        console.log(`🚗 Distance matrix (${apiKeyResult.platform})`);
        response = await fetch(url);
        break;
      }

      default:
        console.error('❌ Action invalide:', action);
        return new Response(
          JSON.stringify({ 
            error: 'Action invalide',
            validActions: ['autocomplete', 'city_autocomplete', 'place_details', 'distance_matrix']
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    const data = await response.json();
    
    // Log response status
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Erreur Google Maps API: ${data.status} - ${data.error_message || 'Pas de message d\'erreur'}`);
      console.error(`🔍 Détails:`, JSON.stringify(data, null, 2));
      
      // Add platform info to error response
      data.platform_used = apiKeyResult.platform;
      data.timestamp = new Date().toISOString();
    } else if (data.predictions) {
      console.log(`✅ ${data.predictions.length} résultats trouvés (${apiKeyResult.platform})`);
    } else if (data.result) {
      console.log(`✅ Détails du lieu récupérés (${apiKeyResult.platform})`);
    } else if (data.rows) {
      console.log(`✅ Matrice de distance calculée (${apiKeyResult.platform})`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('💥 Exception:', error.message);
    console.error('📚 Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        help: 'Consultez les logs de la fonction Edge pour plus de détails'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

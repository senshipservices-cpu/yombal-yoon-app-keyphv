
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle supporte plusieurs clés API selon la plateforme (Web, Android, iOS)

// Configuration des clés API
// ---------------------------
// Option 1: Clé unique (développement)
const GOOGLE_MAPS_API_KEY_DEFAULT = "AIzaSyCyIEHUEYap3t8z_lqy2tCNhHFBhYHTSHQ";

// Option 2: Clés séparées par plateforme (production - recommandé)
const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB') || GOOGLE_MAPS_API_KEY_DEFAULT;
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID') || GOOGLE_MAPS_API_KEY_DEFAULT;
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS') || GOOGLE_MAPS_API_KEY_DEFAULT;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform'
};

// Fonction pour sélectionner la bonne clé API selon la plateforme
function getApiKeyForPlatform(platform: string): string {
  console.log(`🔑 Selecting API key for platform: ${platform}`);
  
  switch (platform.toLowerCase()) {
    case 'ios':
      console.log('   → Using iOS API key');
      return GOOGLE_MAPS_API_KEY_IOS;
    case 'android':
      console.log('   → Using Android API key');
      return GOOGLE_MAPS_API_KEY_ANDROID;
    case 'web':
    default:
      console.log('   → Using Web API key');
      return GOOGLE_MAPS_API_KEY_WEB;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    
    // Detect platform from headers or user agent
    const platform = req.headers.get('x-platform') || 'web';
    const userAgent = req.headers.get('user-agent') || '';
    
    // Select the appropriate API key for the platform
    const apiKey = getApiKeyForPlatform(platform);
    
    console.log('='.repeat(80));
    console.log('📱 REQUEST INFO:');
    console.log('  Platform:', platform);
    console.log('  User-Agent:', userAgent);
    console.log('  Action:', action);
    console.log('  API Key:', apiKey.substring(0, 20) + '...');
    console.log('  Params:', JSON.stringify(params, null, 2));
    console.log('='.repeat(80));

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        // AUTOCOMPLÉTION D'ADRESSES (Module "Envoi de Colis")
        // ===================================================
        // Configuration pour Dakar métropolitaine :
        // 
        // ✅ AUCUN filtre types= : permet d'obtenir TOUS les types de lieux
        //    - Adresses précises (rues, quartiers, communes, unités des Parcelles)
        //    - Établissements (hôpitaux, mosquées, églises, écoles, universités)
        //    - Points de repère (marchés, ronds-points, carrefours, monuments)
        //    - Bâtiments administratifs et services publics
        //    - Zones industrielles, usines
        //    - Commerces, restaurants, hôtels
        //    - Stations de transport
        // 
        // ✅ components=country:sn : restriction au Sénégal uniquement
        // ✅ language=fr : langue française
        // ✅ location centré sur Dakar (14.6928,-17.4467)
        // ✅ radius=45000 : 45 km pour couvrir toute la zone métropolitaine
        //    (Dakar, Parcelles, Pikine, Guédiawaye, Keur Massar, Mbao, 
        //     Bargny, Rufisque, Sébikotane, Bambilor, Diamaguène, Diamniadio)
        // ✅ strictbounds=true : limite strictement à la zone spécifiée
        
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: apiKey,
        });

        // ⚠️ IMPORTANT : NE JAMAIS INCLURE le paramètre 'types'
        // L'absence de ce paramètre permet d'obtenir TOUS les types de lieux :
        // - establishment : tous les établissements (hôpitaux, écoles, mosquées, églises, marchés, etc.)
        // - geocode : toutes les adresses géographiques (rues, quartiers, communes)
        // - (regions) : régions administratives
        // - point_of_interest : points d'intérêt (monuments, ronds-points, carrefours, etc.)
        // 
        // Si on ajoutait types=address, on exclurait les établissements et POI
        // Si on ajoutait types=(regions), on exclurait les adresses précises
        console.log('⚠️ No types parameter - including ALL place types (establishments, geocodes, POIs, regions, etc.)');

        // Location bias centré sur Dakar (14.6928°N, 17.4467°W)
        if (params.location) {
          urlParams.append('location', params.location);
        } else {
          // Coordonnées par défaut de Dakar
          urlParams.append('location', '14.6928,-17.4467');
        }

        // Radius de 45 km pour couvrir toute la zone métropolitaine de Dakar
        if (params.radius) {
          urlParams.append('radius', params.radius.toString());
        } else {
          urlParams.append('radius', '45000');
        }

        // Restriction au Sénégal uniquement (components=country:sn)
        if (params.components) {
          urlParams.append('components', params.components);
        } else {
          urlParams.append('components', 'country:sn');
        }

        // Langue française (language=fr)
        if (params.language) {
          urlParams.append('language', params.language);
        } else {
          urlParams.append('language', 'fr');
        }

        // Strictbounds pour limiter strictement aux résultats dans le rayon spécifié
        if (params.strictbounds !== undefined) {
          urlParams.append('strictbounds', params.strictbounds.toString());
        } else {
          urlParams.append('strictbounds', 'true');
        }

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log('🔗 Autocomplete URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
        
        const startTime = Date.now();
        response = await fetch(url);
        const fetchTime = Date.now() - startTime;
        
        console.log(`⏱️ Google API response time: ${fetchTime}ms`);
        console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
        break;
      }

      case 'city_autocomplete': {
        // AUTOCOMPLÉTION DE VILLES (Module "Covoiturage")
        // ================================================
        // Suggère les villes au Sénégal uniquement
        // Paramètres :
        // - types=(cities) : pour ne suggérer que des villes
        // - components=country:sn : restriction au Sénégal
        // - language=fr : langue française
        
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          types: '(cities)',
          components: 'country:sn',
          language: 'fr',
          key: apiKey,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log('🔗 City Autocomplete URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
        response = await fetch(url);
        console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
        break;
      }

      case 'place_details': {
        // RÉCUPÉRATION LAT/LNG (Google Places Details API)
        // =================================================
        // Récupère la géométrie (latitude et longitude) d'un lieu sélectionné
        // Utilisé après qu'une suggestion d'autocomplétion soit sélectionnée
        
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${apiKey}`;
        console.log('🔗 Place Details URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
        response = await fetch(url);
        console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
        break;
      }

      case 'distance_matrix': {
        // CALCUL DE DISTANCE ET DURÉE (Google Distance Matrix API)
        // =========================================================
        // Calcule la distance et la durée entre deux points
        // Paramètres :
        // - origins : lat,lng du point de départ
        // - destinations : lat,lng du point d'arrivée
        // - mode : driving (par défaut)
        // - language : fr
        
        let origins: string;
        let destinations: string;

        // Support for both formats: direct lat/lng or separate parameters
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
        console.log('🔗 Distance Matrix URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
        response = await fetch(url);
        console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);
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
    
    console.log('📦 Google API Response:');
    console.log('  Status:', data.status);
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ API ERROR DETECTED:');
      console.error('  Status:', data.status);
      console.error('  Error Message:', data.error_message || 'No error message provided');
      console.error('  Platform:', platform);
      console.error('  API Key used:', apiKey.substring(0, 20) + '...');
      
      // Log detailed error information for debugging
      if (data.status === 'REQUEST_DENIED') {
        console.error('🚫 REQUEST_DENIED - Possible causes:');
        console.error('  1. API key is invalid or expired');
        console.error('  2. API key has HTTP referrer restrictions (Web only)');
        console.error('  3. API key does not have the required API enabled');
        console.error('  4. API key has IP address restrictions');
        console.error('  5. Billing is not enabled for this project');
        console.error('');
        console.error('🔧 SOLUTION FOR MOBILE:');
        console.error('  - Remove HTTP referrer restrictions from the API key');
        console.error('  - OR create a separate API key for mobile apps');
        console.error('  - Add Android app restrictions (package name + SHA-1)');
        console.error('  - Add iOS app restrictions (bundle ID)');
        console.error('  - Enable: Places API, Geocoding API, Distance Matrix API');
        console.error('');
        console.error('📚 Documentation: See GOOGLE_MAPS_FIX_GUIDE.md');
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('⚠️ OVER_QUERY_LIMIT - API quota exceeded');
        console.error('  - Check your Google Cloud Console billing');
        console.error('  - Verify daily quotas are not exceeded');
      } else if (data.status === 'INVALID_REQUEST') {
        console.error('⚠️ INVALID_REQUEST - Check request parameters');
        console.error('  - Input:', params.input);
        console.error('  - Location:', params.location);
        console.error('  - Components:', params.components);
      }
      
      // Add platform info to error response for better debugging
      data.platform_info = {
        platform,
        userAgent,
        timestamp: new Date().toISOString(),
        requestParams: params,
        apiKeyPrefix: apiKey.substring(0, 20) + '...',
      };
    } else if (data.predictions) {
      const predictionCount = data.predictions.length;
      console.log(`✅ Found ${predictionCount} predictions`);
      
      // Log sample of place types for debugging
      if (predictionCount > 0) {
        const sampleTypes = data.predictions.slice(0, 3).map((p: any) => ({
          name: p.description,
          types: p.types
        }));
        console.log('📍 Sample place types:', JSON.stringify(sampleTypes, null, 2));
      } else {
        console.log('⚠️ Predictions array is empty (status=OK but 0 results)');
        console.log('   This usually means:');
        console.log('   - The search term is too generic or too short');
        console.log('   - No places match the search criteria in the specified area');
        console.log('   - The strictbounds parameter is too restrictive');
        console.log('   Suggestion: Try a more specific search term or a known landmark');
      }
    } else if (data.rows) {
      // Distance Matrix response
      console.log('📏 Distance Matrix result:', JSON.stringify(data.rows[0]?.elements[0], null, 2));
    } else if (data.result) {
      // Place Details response
      console.log('📍 Place Details result:', {
        name: data.result.name,
        types: data.result.types,
        location: data.result.geometry?.location,
      });
    }
    
    console.log('='.repeat(80));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('💥 EXCEPTION in google-places-proxy:');
    console.error('  Error:', error.message);
    console.error('  Stack:', error.stack);
    console.error('='.repeat(80));
    
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

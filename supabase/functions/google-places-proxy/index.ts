
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle supporte plusieurs clés API selon la plateforme (Web, Android, iOS)

// Configuration des clés API
// ---------------------------
// IMPORTANT: Les clés doivent être configurées dans Supabase Edge Function Secrets
// avec les noms suivants:
// - GOOGLE_MAPS_API_KEY_WEB (avec restrictions HTTP referrer)
// - GOOGLE_MAPS_API_KEY_ANDROID (avec restrictions Android app)
// - GOOGLE_MAPS_API_KEY_IOS (avec restrictions iOS app)

const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB');
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID');
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform'
};

// Fonction pour sélectionner la bonne clé API selon la plateforme
function getApiKeyForPlatform(platform: string): { key: string; error?: string } {
  console.log(`🔑 Selecting API key for platform: ${platform}`);
  
  switch (platform.toLowerCase()) {
    case 'ios':
      if (!GOOGLE_MAPS_API_KEY_IOS) {
        console.error('❌ GOOGLE_MAPS_API_KEY_IOS is not configured in Supabase secrets');
        return {
          key: '',
          error: 'iOS API key not configured. Please add GOOGLE_MAPS_API_KEY_IOS to Supabase Edge Function secrets.'
        };
      }
      console.log('   → Using iOS API key:', GOOGLE_MAPS_API_KEY_IOS.substring(0, 20) + '...');
      return { key: GOOGLE_MAPS_API_KEY_IOS };
      
    case 'android':
      if (!GOOGLE_MAPS_API_KEY_ANDROID) {
        console.error('❌ GOOGLE_MAPS_API_KEY_ANDROID is not configured in Supabase secrets');
        return {
          key: '',
          error: 'Android API key not configured. Please add GOOGLE_MAPS_API_KEY_ANDROID to Supabase Edge Function secrets.'
        };
      }
      console.log('   → Using Android API key:', GOOGLE_MAPS_API_KEY_ANDROID.substring(0, 20) + '...');
      return { key: GOOGLE_MAPS_API_KEY_ANDROID };
      
    case 'web':
    default:
      if (!GOOGLE_MAPS_API_KEY_WEB) {
        console.error('❌ GOOGLE_MAPS_API_KEY_WEB is not configured in Supabase secrets');
        return {
          key: '',
          error: 'Web API key not configured. Please add GOOGLE_MAPS_API_KEY_WEB to Supabase Edge Function secrets.'
        };
      }
      console.log('   → Using Web API key:', GOOGLE_MAPS_API_KEY_WEB.substring(0, 20) + '...');
      return { key: GOOGLE_MAPS_API_KEY_WEB };
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
    const apiKeyResult = getApiKeyForPlatform(platform);
    
    if (apiKeyResult.error) {
      console.error('❌ API Key configuration error:', apiKeyResult.error);
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: apiKeyResult.error,
          platform,
          timestamp: new Date().toISOString(),
          configuration_help: {
            message: 'API key not configured for this platform',
            platform,
            required_secret_name: `GOOGLE_MAPS_API_KEY_${platform.toUpperCase()}`,
            setup_instructions: [
              '1. Go to Supabase Dashboard > Edge Functions > google-places-proxy',
              '2. Add a new secret with the name above',
              '3. Use a Google Maps API key with appropriate restrictions:',
              '   - iOS: Bundle ID restriction (com.yombalyoon.yombalyoonapp)',
              '   - Android: Package name + SHA-1 restriction',
              '   - Web: HTTP referrer restriction',
              '4. Enable these APIs: Places API, Geocoding API, Distance Matrix API'
            ]
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const apiKey = apiKeyResult.key;
    
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
        console.error('  2. API key restrictions do not match the platform');
        console.error('  3. API key does not have the required API enabled');
        console.error('  4. Billing is not enabled for this project');
        console.error('');
        console.error('🔧 SOLUTION FOR iOS:');
        console.error('  1. Go to Google Cloud Console > Credentials');
        console.error('  2. Create a NEW API key specifically for iOS');
        console.error('  3. Set Application restrictions to "iOS apps"');
        console.error('  4. Add Bundle ID: com.yombalyoon.yombalyoonapp');
        console.error('  5. Enable APIs: Places API, Geocoding API, Distance Matrix API');
        console.error('  6. Add this key to Supabase as GOOGLE_MAPS_API_KEY_IOS');
        console.error('');
        console.error('🔧 SOLUTION FOR ANDROID:');
        console.error('  1. Go to Google Cloud Console > Credentials');
        console.error('  2. Create a NEW API key specifically for Android');
        console.error('  3. Set Application restrictions to "Android apps"');
        console.error('  4. Add Package name: com.yombalyoon.app');
        console.error('  5. Add SHA-1 certificate fingerprint');
        console.error('  6. Enable APIs: Places API, Geocoding API, Distance Matrix API');
        console.error('  7. Add this key to Supabase as GOOGLE_MAPS_API_KEY_ANDROID');
        console.error('');
        console.error('📚 Documentation: See GOOGLE_MAPS_API_KEY_SETUP_IOS.md');
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
        configuration_help: {
          ios: {
            required_secret: 'GOOGLE_MAPS_API_KEY_IOS',
            bundle_id: 'com.yombalyoon.yombalyoonapp',
            restriction_type: 'iOS apps',
            required_apis: ['Places API', 'Geocoding API', 'Distance Matrix API']
          },
          android: {
            required_secret: 'GOOGLE_MAPS_API_KEY_ANDROID',
            package_name: 'com.yombalyoon.app',
            restriction_type: 'Android apps (with SHA-1)',
            required_apis: ['Places API', 'Geocoding API', 'Distance Matrix API']
          },
          web: {
            required_secret: 'GOOGLE_MAPS_API_KEY_WEB',
            restriction_type: 'HTTP referrers',
            required_apis: ['Places API', 'Geocoding API', 'Distance Matrix API']
          }
        }
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

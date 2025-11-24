
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle utilise une clé API serveur dédiée pour les Edge Functions
//
// CONFIGURATION REQUISE:
// - GOOGLE_MAPS_API_KEY_SERVER: Clé API serveur (SANS restrictions HTTP referrers/Bundle ID/Package name)
//   Cette clé doit être configurée dans Google Cloud Console avec:
//   • Type de restriction: Aucune (ou restriction par IP si possible)
//   • APIs activées: Places API, Geocoding API, Distance Matrix API
//
// IMPORTANT: 
// - Les clés avec restrictions "Sites Web" / "Android" / "iOS" NE FONCTIONNENT PAS avec les Edge Functions
// - Les Edge Functions sont des appels serveur → Google, elles nécessitent une clé serveur
// - Ajoutez GOOGLE_MAPS_API_KEY_SERVER aux secrets Supabase via le dashboard

const GOOGLE_MAPS_API_KEY_SERVER = Deno.env.get('GOOGLE_MAPS_API_KEY_SERVER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform, referer, origin'
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const platform = req.headers.get('x-platform') || 'web';
    const referer = req.headers.get('referer') || req.headers.get('origin') || 'unknown';
    
    console.log(`📱 Requête: ${platform} - ${action}`);
    console.log(`🌐 Referer: ${referer}`);
    console.log(`📊 Paramètres:`, JSON.stringify(params, null, 2));
    
    // Log environment variable status (without exposing the actual key)
    console.log(`🔐 Environment Variables Status:`);
    console.log(`   - GOOGLE_MAPS_API_KEY_SERVER: ${GOOGLE_MAPS_API_KEY_SERVER ? '✅ SET' : '❌ NOT SET'}`);
    
    // Vérifier que la clé API serveur est configurée
    if (!GOOGLE_MAPS_API_KEY_SERVER) {
      console.error(`❌ GOOGLE_MAPS_API_KEY_SERVER non configurée`);
      console.error(`🌐 Referer de la requête: ${referer}`);
      console.error(`📱 Plateforme: ${platform}`);
      
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: `La clé API Google Maps serveur n'est pas configurée dans les secrets Supabase Edge Function.`,
          platform: platform,
          referer: referer,
          timestamp: new Date().toISOString(),
          debug: {
            env_status: {
              server: 'NOT_SET',
            },
            requested_platform: platform,
            missing_secret: 'GOOGLE_MAPS_API_KEY_SERVER',
          },
          help: {
            message: `Configuration requise: Créer une clé API serveur dans Google Cloud Console`,
            steps: [
              '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
              '2. Cliquez sur "Create Credentials" > "API Key"',
              '3. Nommez la clé: GOOGLE_MAPS_API_KEY_SERVER',
              '4. Dans "Application restrictions", choisissez "None" (ou restriction par IP si possible)',
              '5. Dans "API restrictions", activez: Places API, Geocoding API, Distance Matrix API',
              '6. NE PAS mettre de restriction "HTTP referrers" / "Android apps" / "iOS apps"',
              '7. Copiez la clé API',
              '8. Allez dans Supabase Dashboard > Project Settings > Edge Functions',
              '9. Ajoutez le secret: GOOGLE_MAPS_API_KEY_SERVER = <votre_clé>',
              '10. Redéployez cette Edge Function'
            ],
            supabase_cli_alternative: [
              'Ou utilisez Supabase CLI:',
              'supabase secrets set GOOGLE_MAPS_API_KEY_SERVER=YOUR_API_KEY_HERE',
              'Puis redéployez: supabase functions deploy google-places-proxy'
            ],
            documentation: 'https://supabase.com/docs/guides/functions/secrets'
          }
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`🔐 Clé API serveur chargée avec succès (longueur: ${GOOGLE_MAPS_API_KEY_SERVER.length} caractères)`);

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: GOOGLE_MAPS_API_KEY_SERVER,
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
        console.log(`🔍 Autocomplete pour: "${params.input}" (${platform})`);
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
          key: GOOGLE_MAPS_API_KEY_SERVER,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log(`🏙️ City autocomplete pour: "${params.input}" (${platform})`);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${GOOGLE_MAPS_API_KEY_SERVER}`;
        console.log(`📍 Place details pour: ${params.placeId} (${platform})`);
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

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${GOOGLE_MAPS_API_KEY_SERVER}`;
        console.log(`🚗 Distance matrix (${platform})`);
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

    // Log complete HTTP response details
    console.log(`📡 Google Maps API Response:`);
    console.log(`   - HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`   - Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   - Platform: ${platform}`);
    console.log(`   - Referer: ${referer}`);

    const data = await response.json();
    
    // Log response status with detailed error information
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ ========================================`);
      console.error(`❌ ERREUR GOOGLE MAPS API`);
      console.error(`❌ ========================================`);
      console.error(`   📊 Status Google: ${data.status}`);
      console.error(`   🌐 HTTP Status: ${response.status} ${response.statusText}`);
      console.error(`   💬 Message: ${data.error_message || 'Pas de message d\'erreur'}`);
      console.error(`   📱 Platform: ${platform}`);
      console.error(`   🔗 Referer: ${referer}`);
      console.error(`   🔑 API Key Length: ${GOOGLE_MAPS_API_KEY_SERVER.length} caractères`);
      console.error(`   🔑 API Key Prefix: ${GOOGLE_MAPS_API_KEY_SERVER.substring(0, 10)}...`);
      console.error(`   🔍 Request URL Pattern: ${url.replace(GOOGLE_MAPS_API_KEY_SERVER, 'REDACTED')}`);
      console.error(`   📋 Full Response Body:`, JSON.stringify(data, null, 2));
      console.error(`❌ ========================================`);
      
      // Add platform info and debug data to error response
      data.platform_used = platform;
      data.referer = referer;
      data.timestamp = new Date().toISOString();
      data.http_status = response.status;
      data.http_status_text = response.statusText;
      data.debug = {
        api_key_length: GOOGLE_MAPS_API_KEY_SERVER.length,
        api_key_prefix: GOOGLE_MAPS_API_KEY_SERVER.substring(0, 10),
        request_url_pattern: url.replace(GOOGLE_MAPS_API_KEY_SERVER, 'REDACTED'),
        env_status: {
          server: 'SET',
        },
      };
      
      // Add helpful error message based on error type
      if (data.status === 'REQUEST_DENIED') {
        console.error(`🔧 DIAGNOSTIC: REQUEST_DENIED`);
        console.error(`   Causes possibles:`);
        console.error(`   1. La clé API n'a pas les APIs activées (Places API, Geocoding API, Distance Matrix API)`);
        console.error(`   2. La clé API a des restrictions incompatibles (HTTP referrers, Bundle ID, Package name)`);
        console.error(`   3. La facturation n'est pas activée sur le projet Google Cloud`);
        console.error(`   4. La clé API est invalide ou révoquée`);
        
        data.help = {
          message: 'Vérifiez la configuration de GOOGLE_MAPS_API_KEY_SERVER dans Google Cloud Console',
          causes: [
            'La clé API n\'a pas les APIs activées (Places API, Geocoding API, Distance Matrix API)',
            'La clé API a des restrictions incompatibles (HTTP referrers, Bundle ID, Package name)',
            'La facturation n\'est pas activée sur le projet Google Cloud',
            'La clé API est invalide ou révoquée'
          ],
          steps: [
            '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
            '2. Sélectionnez votre clé GOOGLE_MAPS_API_KEY_SERVER',
            '3. Vérifiez "Application restrictions": doit être "None" (ou IP restrictions)',
            '4. Vérifiez "API restrictions": Places API, Geocoding API, Distance Matrix API doivent être activées',
            '5. Allez dans APIs & Services > Dashboard',
            '6. Vérifiez que Places API, Geocoding API, Distance Matrix API sont activées',
            '7. Vérifiez que la facturation est activée (Billing)',
            '8. Si nécessaire, créez une nouvelle clé API serveur sans restrictions',
            '9. Mettez à jour le secret Supabase: GOOGLE_MAPS_API_KEY_SERVER',
            '10. Redéployez l\'Edge Function'
          ]
        };
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error(`🔧 DIAGNOSTIC: OVER_QUERY_LIMIT`);
        console.error(`   Le quota de requêtes a été dépassé`);
        
        data.help = {
          message: 'Quota de requêtes dépassé',
          steps: [
            '1. Allez dans Google Cloud Console > APIs & Services > Dashboard',
            '2. Vérifiez les quotas pour Places API, Geocoding API, Distance Matrix API',
            '3. Si nécessaire, augmentez les quotas ou activez la facturation',
            '4. Attendez la réinitialisation du quota (généralement quotidien)'
          ]
        };
      } else if (data.status === 'INVALID_REQUEST') {
        console.error(`🔧 DIAGNOSTIC: INVALID_REQUEST`);
        console.error(`   Paramètres de requête invalides`);
        console.error(`   Paramètres reçus:`, JSON.stringify(params, null, 2));
        
        data.help = {
          message: 'Requête invalide - vérifiez les paramètres',
          request_params: params,
          steps: [
            '1. Vérifiez que tous les paramètres requis sont fournis',
            '2. Vérifiez le format des paramètres (coordonnées, place_id, etc.)',
            '3. Consultez la documentation Google Maps API pour le format correct'
          ]
        };
      } else if (data.status === 'UNKNOWN_ERROR') {
        console.error(`🔧 DIAGNOSTIC: UNKNOWN_ERROR`);
        console.error(`   Erreur inconnue côté Google Maps API`);
        
        data.help = {
          message: 'Erreur inconnue - réessayez dans quelques instants',
          steps: [
            '1. Réessayez la requête',
            '2. Si le problème persiste, vérifiez le statut de Google Maps API',
            '3. Consultez https://status.cloud.google.com/'
          ]
        };
      }
      
      // Return 502 Bad Gateway for Google API errors
      // This indicates that the Edge Function received an invalid response from Google
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    } else if (data.predictions) {
      console.log(`✅ ${data.predictions.length} résultats trouvés (${platform})`);
    } else if (data.result) {
      console.log(`✅ Détails du lieu récupérés (${platform})`);
    } else if (data.rows) {
      console.log(`✅ Matrice de distance calculée (${platform})`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('💥 ========================================');
    console.error('💥 EXCEPTION DANS EDGE FUNCTION');
    console.error('💥 ========================================');
    console.error('   💬 Message:', error.message);
    console.error('   📚 Stack trace:', error.stack);
    console.error('   🕐 Timestamp:', new Date().toISOString());
    console.error('💥 ========================================');
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        error_message: error.message,
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

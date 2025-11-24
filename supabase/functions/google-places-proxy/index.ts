
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle utilise trois clés API distinctes selon la plateforme (Web, Android, iOS)
//
// CONFIGURATION REQUISE:
// - GOOGLE_MAPS_API_KEY_WEB: Clé API pour le Web (restrictions HTTP referrers)
// - GOOGLE_MAPS_API_KEY_ANDROID: Clé API pour Android (restrictions package name + SHA-1)
// - GOOGLE_MAPS_API_KEY_IOS: Clé API pour iOS (restrictions Bundle ID)
//
// IMPORTANT: Chaque clé doit être configurée dans Google Cloud Console avec les restrictions appropriées
// ET ajoutée aux secrets Supabase Edge Function via le dashboard Supabase

const GOOGLE_MAPS_API_KEY_WEB = Deno.env.get('GOOGLE_MAPS_API_KEY_WEB');
const GOOGLE_MAPS_API_KEY_ANDROID = Deno.env.get('GOOGLE_MAPS_API_KEY_ANDROID');
const GOOGLE_MAPS_API_KEY_IOS = Deno.env.get('GOOGLE_MAPS_API_KEY_IOS');
// Fallback key for development/testing
const GOOGLE_MAPS_API_KEY_FALLBACK = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform, referer, origin'
};

// Fonction pour obtenir la clé API selon la plateforme
function getApiKeyForPlatform(platform: string): string | null {
  const platformLower = platform.toLowerCase();
  
  if (platformLower === 'web') {
    return GOOGLE_MAPS_API_KEY_WEB || GOOGLE_MAPS_API_KEY_FALLBACK || null;
  } else if (platformLower === 'android') {
    return GOOGLE_MAPS_API_KEY_ANDROID || GOOGLE_MAPS_API_KEY_FALLBACK || null;
  } else if (platformLower === 'ios') {
    return GOOGLE_MAPS_API_KEY_IOS || GOOGLE_MAPS_API_KEY_FALLBACK || null;
  }
  
  // Fallback: essayer Web si la plateforme n'est pas reconnue
  console.warn(`⚠️ Platform "${platform}" not recognized, falling back to Web key`);
  return GOOGLE_MAPS_API_KEY_WEB || GOOGLE_MAPS_API_KEY_FALLBACK || null;
}

// Fonction pour obtenir le nom du secret manquant
function getMissingSecretName(platform: string): string {
  const platformLower = platform.toLowerCase();
  
  if (platformLower === 'web') {
    return 'GOOGLE_MAPS_API_KEY_WEB';
  } else if (platformLower === 'android') {
    return 'GOOGLE_MAPS_API_KEY_ANDROID';
  } else if (platformLower === 'ios') {
    return 'GOOGLE_MAPS_API_KEY_IOS';
  }
  
  return 'GOOGLE_MAPS_API_KEY_[PLATFORM]';
}

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
    
    // Log environment variable status (without exposing the actual keys)
    console.log(`🔐 Environment Variables Status:`);
    console.log(`   - GOOGLE_MAPS_API_KEY_WEB: ${GOOGLE_MAPS_API_KEY_WEB ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - GOOGLE_MAPS_API_KEY_ANDROID: ${GOOGLE_MAPS_API_KEY_ANDROID ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - GOOGLE_MAPS_API_KEY_IOS: ${GOOGLE_MAPS_API_KEY_IOS ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   - GOOGLE_MAPS_API_KEY (fallback): ${GOOGLE_MAPS_API_KEY_FALLBACK ? '✅ SET' : '❌ NOT SET'}`);
    
    // Obtenir la clé API pour la plateforme
    const apiKey = getApiKeyForPlatform(platform);
    
    // Vérifier que la clé API est configurée
    if (!apiKey) {
      const secretName = getMissingSecretName(platform);
      console.error(`❌ ${secretName} non configurée pour la plateforme: ${platform}`);
      console.error(`🌐 Referer de la requête: ${referer}`);
      
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: `La clé API Google Maps pour ${platform} n'est pas configurée dans les secrets Supabase Edge Function.`,
          platform: platform,
          referer: referer,
          timestamp: new Date().toISOString(),
          debug: {
            env_status: {
              web: GOOGLE_MAPS_API_KEY_WEB ? 'SET' : 'NOT_SET',
              android: GOOGLE_MAPS_API_KEY_ANDROID ? 'SET' : 'NOT_SET',
              ios: GOOGLE_MAPS_API_KEY_IOS ? 'SET' : 'NOT_SET',
              fallback: GOOGLE_MAPS_API_KEY_FALLBACK ? 'SET' : 'NOT_SET',
            },
            requested_platform: platform,
            missing_secret: secretName,
          },
          help: {
            message: `Configuration requise dans Supabase Dashboard pour ${platform}`,
            steps: [
              '1. Allez dans Supabase Dashboard > Project Settings > Edge Functions',
              '2. Cliquez sur "Add secret" ou "Manage secrets"',
              `3. Ajoutez le secret ${secretName} avec votre clé API Google Maps`,
              '4. Assurez-vous que la clé est configurée dans Google Cloud Console avec les restrictions appropriées',
              '5. Redéployez cette Edge Function pour que les changements prennent effet'
            ],
            supabase_cli_alternative: [
              'Ou utilisez Supabase CLI:',
              `supabase secrets set ${secretName}=YOUR_API_KEY_HERE`,
              'Puis redéployez: supabase functions deploy google-places-proxy'
            ],
            documentation: 'https://supabase.com/docs/guides/functions/secrets'
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`🔐 Clé API ${platform} chargée avec succès (longueur: ${apiKey.length} caractères)`);

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
          key: apiKey,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log(`🏙️ City autocomplete pour: "${params.input}" (${platform})`);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${apiKey}`;
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

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${apiKey}`;
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

    const data = await response.json();
    
    // Log response status with detailed error information
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Erreur Google Maps API:`);
      console.error(`   Status: ${data.status}`);
      console.error(`   HTTP Status: ${response.status}`);
      console.error(`   Message: ${data.error_message || 'Pas de message d\'erreur'}`);
      console.error(`   Platform: ${platform}`);
      console.error(`   Referer: ${referer}`);
      console.error(`   API Key Length: ${apiKey.length} caractères`);
      console.error(`   API Key Prefix: ${apiKey.substring(0, 10)}...`);
      console.error(`🔍 Détails complets:`, JSON.stringify(data, null, 2));
      
      // Add platform info and debug data to error response
      data.platform_used = platform;
      data.referer = referer;
      data.timestamp = new Date().toISOString();
      data.http_status = response.status;
      data.debug = {
        api_key_length: apiKey.length,
        api_key_prefix: apiKey.substring(0, 10),
        request_url_pattern: url.replace(apiKey, 'REDACTED'),
        env_status: {
          web: GOOGLE_MAPS_API_KEY_WEB ? 'SET' : 'NOT_SET',
          android: GOOGLE_MAPS_API_KEY_ANDROID ? 'SET' : 'NOT_SET',
          ios: GOOGLE_MAPS_API_KEY_IOS ? 'SET' : 'NOT_SET',
          fallback: GOOGLE_MAPS_API_KEY_FALLBACK ? 'SET' : 'NOT_SET',
        },
      };
      
      // Add helpful error message based on platform and error type
      if (data.status === 'REQUEST_DENIED') {
        if (platform.toLowerCase() === 'ios') {
          data.help_ios = {
            message: 'Vérifiez que le Bundle ID est correctement configuré dans Google Cloud Console',
            bundle_id: 'com.yombalyoon.yombalyoonapp',
            steps: [
              '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
              '2. Sélectionnez votre clé API iOS (ou créez-en une nouvelle)',
              '3. Dans "Application restrictions", choisissez "iOS apps"',
              '4. Ajoutez le Bundle ID: com.yombalyoon.yombalyoonapp',
              '5. Dans "API restrictions", activez: Places API, Geocoding API, Distance Matrix API',
              '6. Sauvegardez les modifications',
              '7. Copiez la clé API et ajoutez-la aux secrets Supabase: GOOGLE_MAPS_API_KEY_IOS'
            ]
          };
        } else if (platform.toLowerCase() === 'android') {
          data.help_android = {
            message: 'Vérifiez que le package name et SHA-1 sont correctement configurés dans Google Cloud Console',
            package_name: 'com.yombalyoon.app',
            steps: [
              '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
              '2. Sélectionnez votre clé API Android (ou créez-en une nouvelle)',
              '3. Dans "Application restrictions", choisissez "Android apps"',
              '4. Ajoutez le package name: com.yombalyoon.app',
              '5. Ajoutez le SHA-1 de votre keystore (obtenez-le avec: keytool -list -v -keystore your-keystore.jks)',
              '6. Dans "API restrictions", activez: Places API, Geocoding API, Distance Matrix API',
              '7. Sauvegardez les modifications',
              '8. Copiez la clé API et ajoutez-la aux secrets Supabase: GOOGLE_MAPS_API_KEY_ANDROID'
            ]
          };
        } else if (platform.toLowerCase() === 'web') {
          data.help_web = {
            message: 'Vérifiez que les HTTP referrers sont correctement configurés dans Google Cloud Console',
            current_referer: referer,
            expected_referrers: [
              'https://*.natively.dev/*',
              'http://localhost/*',
              'http://127.0.0.1/*',
              'https://*.exp.direct/*'
            ],
            steps: [
              '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
              '2. Sélectionnez votre clé API Web (ou créez-en une nouvelle)',
              '3. Dans "Application restrictions", choisissez "HTTP referrers (web sites)"',
              '4. Ajoutez les referrers suivants:',
              '   - https://*.natively.dev/*',
              '   - http://localhost/*',
              '   - http://127.0.0.1/*',
              '   - https://*.exp.direct/* (pour Expo development)',
              '5. Dans "API restrictions", activez: Places API, Geocoding API, Distance Matrix API, Maps JavaScript API',
              '6. Sauvegardez les modifications',
              '7. Copiez la clé API et ajoutez-la aux secrets Supabase: GOOGLE_MAPS_API_KEY_WEB',
              '8. Attendez 5 minutes pour que les changements prennent effet'
            ],
            troubleshooting: [
              'Si le problème persiste après 5 minutes:',
              '- Vérifiez que la facturation est activée sur votre projet Google Cloud',
              '- Vérifiez que les APIs sont bien activées (Places API, Geocoding API, Distance Matrix API)',
              '- Vérifiez que la clé n\'a pas de quota dépassé',
              `- Vérifiez que le referer actuel (${referer}) correspond aux patterns autorisés`,
              '- Essayez de créer une nouvelle clé API sans restrictions pour tester'
            ]
          };
        }
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        data.help_quota = {
          message: 'Quota de requêtes dépassé',
          steps: [
            '1. Allez dans Google Cloud Console > APIs & Services > Dashboard',
            '2. Vérifiez les quotas pour Places API, Geocoding API, Distance Matrix API',
            '3. Si nécessaire, augmentez les quotas ou activez la facturation',
            '4. Attendez la réinitialisation du quota (généralement quotidien)'
          ]
        };
      } else if (data.status === 'INVALID_REQUEST') {
        data.help_invalid = {
          message: 'Requête invalide',
          request_params: params,
          steps: [
            '1. Vérifiez que tous les paramètres requis sont fournis',
            '2. Vérifiez le format des paramètres (coordonnées, place_id, etc.)',
            '3. Consultez la documentation Google Maps API pour le format correct'
          ]
        };
      }
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

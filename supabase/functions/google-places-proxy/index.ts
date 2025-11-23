
// GOOGLE MAPS API PROXY - YOMBAL YOON
// ====================================
// Cette Edge Function sert de proxy pour les appels à Google Maps API
// Elle utilise une seule clé API configurée pour fonctionner sur toutes les plateformes
//
// CONFIGURATION REQUISE:
// - GOOGLE_MAPS_API_KEY: Clé API unique pour Web, Android et iOS
//
// La clé doit être configurée dans Google Cloud Console avec les restrictions appropriées:
// - Web: Restrictions HTTP referrers (*.natively.dev/*, localhost/*)
// - Android: Restrictions d'application (package name + SHA-1)
// - iOS: Restrictions d'application (Bundle ID: com.yombalyoon.yombalyoonapp)
//
// IMPORTANT: Pour iOS, assurez-vous que le Bundle ID est correctement configuré dans les restrictions

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-platform'
};

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
    
    // Vérifier que la clé API est configurée
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('❌ GOOGLE_MAPS_API_KEY non configurée');
      return new Response(
        JSON.stringify({
          status: 'REQUEST_DENIED',
          error_message: 'La clé API Google Maps n\'est pas configurée. Veuillez ajouter GOOGLE_MAPS_API_KEY aux secrets Supabase Edge Function.',
          platform: platform,
          timestamp: new Date().toISOString(),
          help: {
            message: 'Configuration requise dans Supabase',
            steps: [
              '1. Créez une clé API dans Google Cloud Console',
              '2. Configurez les restrictions pour toutes les plateformes (Web, Android, iOS)',
              '3. Ajoutez la clé aux secrets Supabase Edge Function avec le nom GOOGLE_MAPS_API_KEY',
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
    
    console.log(`🔐 Clé API chargée avec succès pour ${platform}`);

    let url: string;
    let response: Response;

    switch (action) {
      case 'autocomplete': {
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: GOOGLE_MAPS_API_KEY,
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
          key: GOOGLE_MAPS_API_KEY,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log(`🏙️ City autocomplete pour: "${params.input}" (${platform})`);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${GOOGLE_MAPS_API_KEY}`;
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

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${GOOGLE_MAPS_API_KEY}`;
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
    
    // Log response status
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Erreur Google Maps API: ${data.status} - ${data.error_message || 'Pas de message d\'erreur'}`);
      console.error(`🔍 Détails:`, JSON.stringify(data, null, 2));
      
      // Add platform info to error response
      data.platform_used = platform;
      data.timestamp = new Date().toISOString();
      
      // Add helpful error message for iOS
      if (platform.toLowerCase() === 'ios' && data.status === 'REQUEST_DENIED') {
        data.help_ios = {
          message: 'Vérifiez que le Bundle ID est correctement configuré dans Google Cloud Console',
          bundle_id: 'com.yombalyoon.yombalyoonapp',
          steps: [
            '1. Allez dans Google Cloud Console > APIs & Services > Credentials',
            '2. Sélectionnez votre clé API',
            '3. Dans "Application restrictions", choisissez "iOS apps"',
            '4. Ajoutez le Bundle ID: com.yombalyoon.yombalyoonapp',
            '5. Sauvegardez les modifications'
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

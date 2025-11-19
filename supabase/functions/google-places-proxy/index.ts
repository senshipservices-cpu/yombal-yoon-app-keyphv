
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
        // AUTOCOMPLÉTION D'ADRESSES (Module "Envoi de Colis")
        // ===================================================
        // Zone couverte : Dakar métropolitaine uniquement
        // (Dakar, Parcelles, Pikine, Guédiawaye, Keur Massar, 
        // Mbao, Bargny, Rufisque, Sébikotane, Bambilor, Diamaguène, Diamniadio)
        
        // Types de lieux inclus :
        // - Adresses et rues (types=address)
        // - Hôpitaux et centres de santé
        // - Mosquées, églises et lieux de culte
        // - Rues, quartiers, communes et unités des Parcelles
        // - Ronds-points et carrefours
        // - Marchés, localités et lieux publics
        // - Universités, écoles et centres de formation
        // - Bâtiments administratifs et services publics
        // - Usines, zones industrielles et points de repère majeurs

        const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const urlParams = new URLSearchParams({
          input: params.input,
          key: GOOGLE_MAPS_API_KEY,
        });

        // Paramètre types : address pour inclure toutes les adresses et points de repère
        if (params.types) {
          urlParams.append('types', params.types);
        } else {
          // Par défaut, utiliser 'address' pour couvrir tous les types de lieux
          urlParams.append('types', 'address');
        }

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
        console.log('Autocomplete URL:', url);
        response = await fetch(url);
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
          key: GOOGLE_MAPS_API_KEY,
        });

        url = `${baseUrl}?${urlParams.toString()}`;
        console.log('City Autocomplete URL:', url);
        response = await fetch(url);
        break;
      }

      case 'place_details': {
        // RÉCUPÉRATION LAT/LNG (Google Places Details API)
        // =================================================
        // Récupère la géométrie (latitude et longitude) d'un lieu sélectionné
        // Utilisé après qu'une suggestion d'autocomplétion soit sélectionnée
        
        const fields = params.fields || 'geometry,formatted_address,name,types,address_components';
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${params.placeId}&fields=${fields}&language=fr&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Place Details URL:', url);
        response = await fetch(url);
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

        url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&language=${language}&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Distance Matrix URL:', url);
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
    } else if (data.rows) {
      // Distance Matrix response
      console.log('Distance Matrix result:', JSON.stringify(data.rows[0]?.elements[0], null, 2));
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

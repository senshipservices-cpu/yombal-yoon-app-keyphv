
// Global Demo Mode Configuration
// Set to true to display demo data, false to use real data from Supabase
// When demoMode is false and Supabase is configured, the app will use Supabase for data storage

export const demoMode = false;

// Estimated taxi price per kilometer in FCFA
export const estimatedTaxiPricePerKm = 500;

// Approximate distances between major cities in Senegal (in kilometers)
export const approxDistances: { [key: string]: number } = {
  // Dakar connections
  'Dakar-Thiès': 70,
  'Dakar-Mbour': 80,
  'Dakar-Saint-Louis': 260,
  'Dakar-Kaolack': 190,
  'Dakar-Ziguinchor': 450,
  'Dakar-Tambacounda': 460,
  'Dakar-Kolda': 380,
  'Dakar-Louga': 200,
  'Dakar-Fatick': 150,
  'Dakar-Diourbel': 145,
  'Dakar-Matam': 520,
  'Dakar-Kaffrine': 240,
  'Dakar-Kédougou': 700,
  'Dakar-Sédhiou': 420,
  'Dakar-Rufisque': 25,
  'Dakar-Pikine': 15,
  'Dakar-Guédiawaye': 18,
  'Dakar-Touba': 190,
  
  // Pikine connections
  'Pikine-Rufisque': 15,
  'Pikine-Thiès': 60,
  'Pikine-Mbour': 70,
  'Pikine-Guédiawaye': 8,
  
  // Thiès connections
  'Thiès-Mbour': 50,
  'Thiès-Saint-Louis': 200,
  'Thiès-Kaolack': 130,
  'Thiès-Louga': 140,
  'Thiès-Diourbel': 80,
  'Thiès-Touba': 130,
  
  // Mbour connections
  'Mbour-Fatick': 80,
  'Mbour-Kaolack': 120,
  'Mbour-Thiès': 50,
  
  // Saint-Louis connections
  'Saint-Louis-Louga': 90,
  'Saint-Louis-Matam': 280,
  'Saint-Louis-Richard-Toll': 60,
  
  // Kaolack connections
  'Kaolack-Fatick': 60,
  'Kaolack-Kaffrine': 80,
  'Kaolack-Tambacounda': 280,
  'Kaolack-Kolda': 200,
  'Kaolack-Diourbel': 90,
  'Kaolack-Touba': 100,
  
  // Other connections
  'Ziguinchor-Kolda': 150,
  'Ziguinchor-Sédhiou': 90,
  'Tambacounda-Kédougou': 250,
  'Tambacounda-Matam': 200,
  'Kolda-Sédhiou': 80,
  'Diourbel-Touba': 50,
  'Louga-Matam': 240,
};

// Helper function to get distance between two cities (bidirectional)
export const getDistance = (city1: string, city2: string): number | null => {
  // Normalize city names (remove accents, trim, lowercase)
  const normalize = (str: string) => 
    str.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  
  const normalizedCity1 = normalize(city1);
  const normalizedCity2 = normalize(city2);
  
  // Try both directions
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  
  if (approxDistances[key1]) {
    return approxDistances[key1];
  }
  
  if (approxDistances[key2]) {
    return approxDistances[key2];
  }
  
  // Try with normalized names
  for (const key in approxDistances) {
    const [keyCity1, keyCity2] = key.split('-').map(normalize);
    if (
      (keyCity1 === normalizedCity1 && keyCity2 === normalizedCity2) ||
      (keyCity1 === normalizedCity2 && keyCity2 === normalizedCity1)
    ) {
      return approxDistances[key];
    }
  }
  
  return null;
};

// Helper function to calculate economy compared to taxi
export const calculateEconomy = (
  departureCity: string,
  arrivalCity: string,
  ridePrice: number
): number | null => {
  const distance = getDistance(departureCity, arrivalCity);
  
  if (!distance) {
    return null;
  }
  
  const estimatedTaxiPrice = distance * estimatedTaxiPricePerKm;
  const economy = estimatedTaxiPrice - ridePrice;
  
  // Only return positive economy
  return economy > 0 ? Math.round(economy) : null;
};

// Demo data for Covoiturage module
export const demoRides = [
  {
    id: 'demo_ride_1',
    driverId: 'demo_driver_1',
    driverName: 'Mamadou Diallo',
    departureCity: 'Dakar',
    arrivalCity: 'Thiès',
    date: new Date().toISOString().split('T')[0],
    time: '07h30',
    availableSeats: 3,
    totalSeats: 4,
    pricePerPassenger: 2000,
    vehicleType: 'Renault Clio',
    intermediateStops: 'Rufisque',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_ride_2',
    driverId: 'demo_driver_2',
    driverName: 'Fatou Sall',
    departureCity: 'Dakar',
    arrivalCity: 'Mbour',
    date: new Date().toISOString().split('T')[0],
    time: '09h00',
    availableSeats: 2,
    totalSeats: 4,
    pricePerPassenger: 2500,
    vehicleType: 'Peugeot 208',
    intermediateStops: 'Thiès, Saly',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_ride_3',
    driverId: 'demo_driver_3',
    driverName: 'Ibrahima Ndiaye',
    departureCity: 'Pikine',
    arrivalCity: 'Rufisque',
    date: new Date().toISOString().split('T')[0],
    time: '08h15',
    availableSeats: 1,
    totalSeats: 3,
    pricePerPassenger: 1500,
    vehicleType: 'Toyota Corolla',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  },
];

// Demo data for Envoi de Colis module
export const demoParcels = [
  {
    id: 'demo_parcel_1',
    title: 'Colis livré à Pikine',
    description: 'Documents importants',
    status: 'delivered' as const,
    deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    from: 'Dakar Plateau',
    to: 'Pikine',
  },
  {
    id: 'demo_parcel_2',
    title: 'Colis livré à Thiès',
    description: 'Vêtements',
    status: 'delivered' as const,
    deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    from: 'Dakar',
    to: 'Thiès',
  },
  {
    id: 'demo_parcel_3',
    title: 'Colis livré à Guédiawaye',
    description: 'Matériel électronique',
    status: 'delivered' as const,
    deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    from: 'Dakar',
    to: 'Guédiawaye',
  },
  {
    id: 'demo_parcel_4',
    title: 'Colis en cours vers Rufisque',
    description: 'Colis alimentaire',
    status: 'en_route_delivery' as const,
    from: 'Dakar',
    to: 'Rufisque',
  },
];

// Demo data for Livraison 14 Régions module
export const demoIntercity = [
  {
    id: 'demo_intercity_1',
    title: 'Dakar → Thiès',
    description: 'Colis livré avec succès',
    status: 'delivered' as const,
    deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    from: 'Dakar Métropolitaine',
    to: 'Thiès',
    price: 3500,
  },
  {
    id: 'demo_intercity_2',
    title: 'Dakar → Saint-Louis',
    description: 'En transit',
    status: 'in_transit' as const,
    from: 'Dakar Métropolitaine',
    to: 'Saint-Louis',
    price: 5000,
  },
  {
    id: 'demo_intercity_3',
    title: 'Dakar → Kaolack',
    description: 'Colis livré',
    status: 'delivered' as const,
    deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    from: 'Dakar Métropolitaine',
    to: 'Kaolack',
    price: 4500,
  },
];

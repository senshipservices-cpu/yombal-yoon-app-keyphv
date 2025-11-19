
// Global Demo Mode Configuration
// Set to true to display demo data, false to use real data from Supabase

export const demoMode = true;

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

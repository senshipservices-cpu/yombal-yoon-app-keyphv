
/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate delivery price based on distance
 * Base fee: 700 FCFA
 * <= 10 km: 120 FCFA/km
 * > 10 km: 100 FCFA/km
 * Minimum total: 1000 FCFA
 */
export function calculateDeliveryPrice(distanceKm: number): {
  distance: number;
  baseFee: number;
  kmFee: number;
  total: number;
} {
  const baseFee = 700;
  let kmFee = 0;

  if (distanceKm <= 10) {
    kmFee = distanceKm * 120;
  } else {
    kmFee = (10 * 120) + ((distanceKm - 10) * 100);
  }

  const subtotal = baseFee + kmFee;
  const total = Math.max(subtotal, 1000); // Minimum 1000 FCFA

  return {
    distance: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
    baseFee,
    kmFee: Math.round(kmFee),
    total: Math.round(total),
  };
}

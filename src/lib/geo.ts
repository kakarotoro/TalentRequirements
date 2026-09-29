/**
 * Calculate distance between two coordinates using the Haversine formula (in meters).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Check if the user location is within the specified geofence radius.
 */
export function checkGeofence(
  userLat: number,
  userLon: number,
  venueLat: number,
  venueLon: number,
  radiusMeters: number
): {
  isInside: boolean;
  distanceMeters: number;
} {
  const distanceMeters = calculateHaversineDistance(
    userLat,
    userLon,
    venueLat,
    venueLon
  );

  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

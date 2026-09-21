const EARTH_KM = 6371.0088;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceKm(from: { lat: number; lon: number }, to: { lat: number; lon: number }): number {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLat = lat2 - lat1;
  const dLon = toRadians(to.lon - from.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function speedKmh(distance: number, hours: number): number | null {
  if (hours <= 0) {
    return null;
  }
  return distance / hours;
}

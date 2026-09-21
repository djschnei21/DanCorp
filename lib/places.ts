export type Place = {
  lat: number;
  lon: number;
  kind: "ground" | "station";
};

// Each far port is the other end of one hull's lane. The miles are long enough
// that a low-orbit pass takes about half an hour, which is the product.
export const PLACES: Record<string, Place> = {
  "Boca Chica": { lat: 26.0, lon: -97.2, kind: "ground" },
  Vandenberg: { lat: 34.7, lon: -120.6, kind: "ground" },
  Wallops: { lat: 37.9, lon: -75.5, kind: "ground" },
  Keel: { lat: -24.2, lon: 83.2, kind: "ground" },
  Gale: { lat: -33.2, lon: 59.4, kind: "ground" },
  Harrow: { lat: -36.2, lon: 104.4, kind: "ground" },
};

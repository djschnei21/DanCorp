export type Place = {
  lat: number;
  lon: number;
  kind: "ground" | "station";
};

export const PLACES: Record<string, Place> = {
  Kourou: { lat: 5.2, lon: -52.8, kind: "ground" },
  Vandenberg: { lat: 34.7, lon: -120.6, kind: "ground" },
  Mojave: { lat: 35.1, lon: -118.2, kind: "ground" },
  Wallops: { lat: 37.9, lon: -75.5, kind: "ground" },
  "Boca Chica": { lat: 26.0, lon: -97.2, kind: "ground" },
  Kodiak: { lat: 57.8, lon: -152.5, kind: "ground" },
  "Harbor Station": { lat: 10, lon: -18, kind: "station" },
  "Polar Yard": { lat: 70, lon: -135, kind: "station" },
};

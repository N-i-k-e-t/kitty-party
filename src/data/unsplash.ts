export const unsplash = {
  heroIvory: "photo-1519225421980-715cb0215aed",
  /** Brunch / table — prior id returned 404 from images.unsplash.com */
  floralTable: "photo-1466978913421-dad2ebd01d17",
  /** Warm café interior */
  cafeWarm: "photo-1501339847302-ac426a4a7cbb",
  rooftopGolden: "photo-1517248135467-4c7edcad34c4",
  balloons: "photo-1530103862676-de8c9debad1d",
  teaParty: "photo-1544787219-7f47ccb76574",
  gardenParty: "photo-1464207687429-7505649dae38",
  holiPastel: "photo-1527529482837-4698179dc6ce",
  /** Warm lights / festive — prior id returned 404 */
  diwaliLights: "photo-1578662996442-48f60103fc96",
  monsoonWindow: "photo-1500530855697-b586d89ba3ee",
  brunchSpread: "photo-1504754524776-8f4f37790ca0",
  lavenderField: "photo-1490750967868-88aa4486c946",
  sareeTexture: "photo-1596462502278-27bfdc403348",
  karaokeNeon: "photo-1514525253161-7a46d19cd819",
  resortPool: "photo-1520250497591-112f2f40a3f4",
  farmhouseLunch: "photo-1504674900247-0877df9cc836",
} as const;

export function uPhoto(id: string, w = 800, q = 80): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export const VEVEY = {
  lat: Number(process.env.SEARCH_LAT) || 46.4628,
  lng: Number(process.env.SEARCH_LNG) || 6.8417,
  radius: Number(process.env.SEARCH_RADIUS) || 6000,
} as const;

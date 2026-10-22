export const MAP_IMAGE = require("../../assets/maps/kl-map.jpg") as number;
export const MAP_ASPECT = 2400 / 2103;

export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [3.03, 101.57],
  [3.24, 101.81],
];

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

export function toImageXY(lat: number, lng: number) {
  const [[s, w], [n, e]] = MAP_BOUNDS;
  return { x: (lng - w) / (e - w), y: (mercY(n) - mercY(lat)) / (mercY(n) - mercY(s)) };
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

import type { LngLatLike } from "maplibre-gl";

export const CENTER_UK = [-74.00685, 40.73330] as LngLatLike;

export const LOCATION_PAGES = new Set(["dashboard", "dashboard-add"]);
export const CURRENT_LOCATION_PAGES = new Set([
  "dashboard-location-slug",
  "dashboard-location-slug-add",
  "dashboard-location-slug-edit",
]);
export const EDIT_PAGES = new Set([
  "dashboard-add",
  "dashboard-location-slug-add",
  "dashboard-location-slug-edit",
]);

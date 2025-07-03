import type { SelectLocationWithLocationLog } from "~/lib/db/schema";
import type { MapPoint } from "~/lib/types";

import { createMapPointFromLocation } from "~/util/map-points";

const listLocationsInSidebar = new Set(["dashboard", "dashboard-add"]);
const listCurrentLocationsInSidebar = new Set(["dashboard-location-slug", "dashboard-location-slug-add", "dashboard-location-slug-edit"]);

export const useLocationStore = defineStore("useLocationStore", () => {
  const route = useRoute();

  const { data: locations, status: locationsStatus, refresh: refreshLocations } = useFetch("/api/locations", {
    lazy: true,
  });

  const locationUrlWithSlug = computed(() => `/api/location/${route.params.slug}`);

  const {
    data: currentLocation,
    status: currentLocationStatus,
    error: currentLocationError,
    refresh: currentLocationRefresh,
  } = useFetch<SelectLocationWithLocationLog>(locationUrlWithSlug, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (locations.value && listLocationsInSidebar.has(route.name?.toString() || "")) {
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      locations.value.forEach((location) => {
        const mapPoint = createMapPointFromLocation(location);
        sidebarItems.push({
          id: `location-${location.id}`,
          label: location.name,
          icon: "tabler:map-pin-filled",
          to: { name: "dashboard-location-slug", params: { slug: location.slug } },
          mapPoint,
        });
        mapPoints.push(mapPoint);
      });

      sidebarStore.sidebarItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
    }
    else if (currentLocation.value && listCurrentLocationsInSidebar.has(route.name?.toString() || "")) {
      sidebarStore.sidebarItems = [];
      mapStore.mapPoints = [currentLocation.value];
    }
    sidebarStore.loading = locationsStatus.value === "pending";
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    currentLocationRefresh,
  };
});

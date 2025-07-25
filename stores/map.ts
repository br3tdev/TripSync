import type { LngLatBounds } from "maplibre-gl";

import type { MapPoint } from "~/lib/types";

import { CENTER_UK } from "~/lib/constants";

export const useMapStore = defineStore("useMapStore", () => {
  const mapPoints = ref<MapPoint[]>([]);
  const selectedPoint = ref<MapPoint | null>(null);
  const addedPoint = ref<MapPoint & { centerMap?: boolean; zoom?: number } | null>(null);
  const shouldFlyTo = ref(true);

  function selectPointWithoutFlyTo(point: MapPoint | null) {
    shouldFlyTo.value = false;
    selectedPoint.value = point;
  }

  async function init() {
    const { useMap } = await import("@indoorequal/vue-maplibre-gl");
    const { LngLatBounds } = await import("maplibre-gl");

    const map = useMap();

    let bounds: LngLatBounds | null = null;

    effect(() => {
      const firstPoint = mapPoints.value[0];
      if (!firstPoint) {
        map.map?.flyTo({
          center: CENTER_UK,
          zoom: 2,
        });
        return;
      }

      bounds = mapPoints.value.reduce((bounds, point) => {
        return bounds.extend([point.long, point.lat]);
      }, new LngLatBounds(
        [firstPoint.long, firstPoint.lat],
        [firstPoint.long, firstPoint.lat],
      ));

      map.map?.fitBounds(bounds, {
        padding: 40,
        maxZoom: 10,
      });
    });

    effect(() => {
      if (addedPoint)
        return;
      if (selectedPoint.value) {
        if (shouldFlyTo.value) {
          map.map?.flyTo({
            center: [selectedPoint.value?.long, selectedPoint.value?.lat],
            speed: 0.8,
          });
        }
        shouldFlyTo.value = true;
      }
      else if (bounds) {
        map.map?.fitBounds(bounds, {
          padding: 40,
        });
      }
    });

    watch(addedPoint, (newValue, oldValue) => {
      if ((newValue && !oldValue) || newValue?.centerMap) {
        map.map?.flyTo({
          center: [newValue.long, newValue.lat],
          speed: 0.8,
          zoom: newValue.zoom ?? 4,
        });
      }
    }, {
      immediate: true,
    });
  }

  return {
    init,
    mapPoints,
    addedPoint,
    selectedPoint,
    selectPointWithoutFlyTo,
  };
});

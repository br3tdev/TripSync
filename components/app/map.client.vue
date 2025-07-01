<script lang="ts" setup>
import { CENTER_UK } from "~/lib/constants";

const mapStore = useMapStore();

const colorMode = useColorMode();

const style = computed(() => colorMode.value === "dark"
  ? "/styles/dark.json"
  : "https://tiles.openfreemap.org/styles/liberty");

const zoom = 4;

onMounted(() => {
  mapStore.init();
});
</script>

<template>
  <MglMap
    :map-style="style"
    :center="CENTER_UK"
    :zoom="zoom"
  >
    <MglNavigationControl />
    <MglMarker
      v-for="point in mapStore.mapPoints"
      :key="point.id"
      :coordinates="[point.long, point.lat]"
    >
      <template #marker>
        <div
          class="tooltip tooltip-top hover:cursor-pointer"
          :data-tip="point.name"
          :class="{
            'tooltip-open': mapStore.selectedPoint?.id === point.id,
          }"
          @mouseenter="mapStore.selectPointWithoutFlyTo(point)"
          @mouseleave="mapStore.selectPointWithoutFlyTo(null)"
        >
          <Icon
            name="tabler:map-pin-filled"
            size="30"
            :class="mapStore.selectedPoint?.id === point.id ? 'text-accent' : 'text-secondary'"
          />
        </div>
      </template>
      <MglPopup>
        <h3 class="text-xl">
          {{ point.name }}
        </h3>
        <p>
          {{ point.description || "No description provided" }}
        </p>
      </MglPopup>
    </MglMarker>
  </MglMap>
</template>

<script lang="ts" setup>
import { createMapPointFromLocation } from "~/utils/map-points";

const locationStore = useLocationStore();
const { locations: data, locationsStatus } = storeToRefs(locationStore);

onMounted(() => {
  locationStore.refreshLocations();
});
</script>

<template>
  <div class="page-content-top">
    <h2 class="text-2xl">
      Locations
    </h2>
    <div v-if="locationsStatus === 'pending'">
      <span className="loading loading-spinner loading-xl" />
    </div>
    <div v-else-if="data && data.length > 0" class="location-list scrollbar-custom">
      <LocationCard
        v-for="location in data"
        :key="location.id"
        :map-point="createMapPointFromLocation(location)"
      />
    </div>
    <div v-else class="flex flex-col gap-2 mt-4">
      <p class="">
        Add a location to get started
      </p>
      <div class="w-40">
        <NuxtLink to="/dashboard/add" class="btn btn-primary">
          Add Location
          <Icon name="tabler:circle-plus-filled" size="24" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

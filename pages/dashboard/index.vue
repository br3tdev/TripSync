<script lang="ts" setup>
const mapStore = useMapStore();
const locationStore = useLocationStore();
const { locations: data, status } = storeToRefs(locationStore);

onMounted(() => {
  locationStore.refresh();
});
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl">
      Locations
    </h2>
    <div v-if="status === 'pending'">
      <span className="loading loading-spinner loading-xl" />
    </div>
    <div v-else-if="data && data.length > 0" class="flex overflow-x-auto scrollbar-custom mt-4 gap-2">
      <div
        v-for="location in data"
        :key="location.id"
        class="card card-compact bg-base-300 h-40 border-1 w-72 mb-2 shrink-0 hover:cursor-pointer"
        :class="{
          'border-accent': location.id === mapStore.selectedPoint?.id,
          'border-transparent': location.id !== mapStore.selectedPoint?.id,
        }"
        @mouseenter="mapStore.selectedPoint = location"
        @mouseleave="mapStore.selectedPoint = null"
      >
        <div class="card-body">
          <h3 class="text-xl" :class="{ 'line-clamp-1': location.description !== null }">
            {{ location.name }}
          </h3>
          <p>{{ location.description }}</p>
        </div>
      </div>
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

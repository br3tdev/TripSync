<script lang="ts" setup>
const route = useRoute();
const mapStore = useMapStore();
const { slug } = route.params;
const { data: location, status, error } = await useFetch(`/api/location/${slug}`, {
  lazy: true,
});

effect(() => {
  if (location.value) {
    mapStore.mapPoints = [location.value];
  }
});
</script>

<template>
  <div class="p-4 min-h-64">
    <div v-if="status === 'pending'">
      <div class="loading" />
    </div>
    <div v-else-if="location">
      <h3 class="text-xl">
        {{ location?.name }}
      </h3>
      <p class="text-sm">
        {{ location.description }}
      </p>
      <div v-if="!location.locationLogs.length" class="flex flex-col text-sm italic mt-4 w-max">
        Add a location to get started
        <button class="btn btn-primary mt-2">
          Add location log
          <Icon name="tabler:map-pin-plus" size="24" />
        </button>
      </div>
    </div>
    <div v-if="error">
      <div class="alert alert-error">
        <Icon
          name="tabler:alert-hexagon"
          class="shrink-0 stroke-current"
          size="24"
        />
        <span>
          {{ error.statusMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

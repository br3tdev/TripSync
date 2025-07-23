<script lang="ts" setup>
const route = useRoute();
const locationStore = useLocationStore();

const {
  currentLocationLog: locationLog,
  currentLocationLogError: error,
  currentLocationLogStatus: status,
} = storeToRefs(locationStore);

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage);

onMounted(() => {
  locationStore.refreshCurrentLocationLog();
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-location-slug-id") {
    locationStore.refreshCurrentLocationLog();
  }
});
</script>

<template>
  <div class="page-content-top">
    <div v-if="loading">
      <div class="loading" />

      <div class="location-list">
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton h-40 w-72"
        />
      </div>
    </div>

    <div v-if="error && !loading">
      <div class="alert alert-error">
        <Icon
          name="tabler:alert-hexagon"
          class="shrink-0 stroke-current"
          size="24"
        />
        <span>
          {{ errorMessage }}
        </span>
      </div>
    </div>

    <div v-else-if="route.name === 'dashboard-location-slug-id' && locationLog && !loading">
      <p class="text-sm italic text-gray-500">
        <span v-if="locationLog.startedAt !== locationLog.endedAt">
          {{ formatDate(locationLog.startedAt) }} / {{ formatDate(locationLog.endedAt) }}
        </span>
        <span v-else>
          {{ formatDate(locationLog.startedAt) }}
        </span>
      </p>
      <h3 class="text-xl">
        {{ locationLog?.name }}
      </h3>
      <p class="text-sm">
        {{ locationLog.description }}
      </p>
    </div>
    <div v-else>
      <NuxtPage />
    </div>
  </div>
</template>

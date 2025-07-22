<script lang="ts" setup>
import type { FetchError } from "ofetch";

import getFetchErrorMessage from "~/utils/get-fetch-error-message";
import { createMapPointFromLocationLog } from "~/utils/map-points";

const route = useRoute();

const isOpen = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");

const locationStore = useLocationStore();
const {
  currentLocation: location,
  currentLocationError: error,
  currentLocationStatus: status,
} = storeToRefs(locationStore);

const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

async function onConfirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/location/${route.params.slug}`, {
      method: "DELETE",
    });
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
    console.error(deleteError.value);
  }
  isDeleting.value = false;
}

onMounted(() => {
  locationStore.refreshCurrentLocation();
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-location-slug") {
    locationStore.refreshCurrentLocation();
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

    <div v-if="errorMessage && !loading">
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

    <div v-else-if="route.name === 'dashboard-location-slug' && location && !loading">
      <h3 class="text-xl">
        {{ location?.name }}

        <div class="dropdown dropdown-bottom">
          <div
            tabindex="0"
            role="button"
            class="btn m-1 p-0"
          >
            <Icon name="tabler:dots-vertical" size="20" />
          </div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
            <li>
              <NuxtLink
                to=""
                class="flex items-center"
                @click="openDialog"
              >
                <Icon name="tabler:trash-x-filled" size="20" />
                Delete
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="{ name: 'dashboard-location-slug-edit', params: { slug: route.params.slug } }" class="flex items-center">
                <Icon name="tabler:map-pin-cog" size="20" />
                Edit
              </NuxtLink>
            </li>
          </ul>
        </div>
      </h3>
      <p class="text-sm">
        {{ location.description }}
      </p>
      <div v-if="!location.locationLogs.length" class="flex flex-col text-sm italic mt-4 w-max">
        Add a location to get started
        <NuxtLink
          class="btn btn-primary mt-2"
          :to="{
            name: 'dashboard-location-slug-add',
            params: { slug: route.params.slug },
          }"
        >
          Add location log
          <Icon name="tabler:map-pin-plus" size="24" />
        </NuxtLink>
      </div>
      <div v-else-if="location.locationLogs.length" class="location-list scrollbar-custom">
        <LocationCard
          v-for="log in location.locationLogs"
          :key="log.id"
          :map-point="createMapPointFromLocationLog(log)"
        >
          <template #top>
            <p v-if="log.startedAt !== log.endedAt" class="text-sm italic text-gray-500">
              {{ formatDate(log.startedAt) }} / {{ formatDate(log.endedAt) }}
            </p>
            <p v-else class="text-sm italic text-gray-500">
              {{ formatDate(log.startedAt) }}
            </p>
          </template>
        </LocationCard>
      </div>
    </div>

    <div v-else-if="route.name !== 'dashboard-location-slug'">
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location will also delete all of the associated logs. This cannot be undone. Are you sure you want to do this?"
      confirm-label="Yes, I am sure"
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="onConfirmDelete"
    />
  </div>
</template>

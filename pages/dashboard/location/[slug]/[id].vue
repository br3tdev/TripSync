<script lang="ts" setup>
import type { FetchError } from "ofetch";

import ImageList from "~/components/image-list.vue";

const route = useRoute();
const locationStore = useLocationStore();

const {
  currentLocationLog: locationLog,
  currentLocationLogError: error,
  currentLocationLogStatus: status,
} = storeToRefs(locationStore);

const isOpen = ref(false);
const deleteError = ref("");
const isDeleting = ref(false);

const loading = computed(() => isDeleting.value || status.value === "pending");
const errorMessage = computed(() => deleteError.value || error.value?.statusMessage);

async function onConfirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/location/${route.params.slug}/${route.params.id}`, {
      method: "DELETE",
    });
    navigateTo({
      name: "dashboard-location-slug",
      params: {
        slug: route.params.slug,
      },
    });
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
    console.error(deleteError.value);
  }
  isDeleting.value = false;
}

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

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
              <NuxtLink
                :to="{
                  name: 'dashboard-location-slug-id-edit',
                  params: { slug: route.params.slug, id: route.params.id },
                }"
                class="flex items-center"
              >
                <Icon name="tabler:map-pin-cog" size="20" />
                Edit
              </NuxtLink>
            </li>
          </ul>
        </div>
      </h3>
      <p class="text-sm">
        {{ locationLog.description }}
      </p>
      <div v-if="!locationLog.images.length" class="flex flex-col gap-2 mt-4">
        <div class="w-40">
          <NuxtLink
            :to="{
              name: 'dashboard-location-slug-id-images',
              params: {
                slug: route.params.slug,
                id: route.params.id,
              },
            }"
            class="btn btn-primary"
          >
            Add images
            <Icon name="tabler:photo-cog" size="24" />
          </NuxtLink>
        </div>
      </div>
      <ImageList :images="locationLog.images" />
    </div>
    <div v-else>
      <NuxtPage />
    </div>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location log cannot be undone. Are you sure you want to do this?"
      confirm-label="Yes, I am sure"
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="isOpen = false"
      @on-confirmed="onConfirmDelete"
    />
  </div>
</template>

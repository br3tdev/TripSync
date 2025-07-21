<script lang="ts" setup>
import { CENTER_UK } from "~/lib/constants";

const route = useRoute();
const { currentLocation } = useLocationStore();

const { $csrfFetch } = useNuxtApp();

async function onSubmit(values: any) {
  await $csrfFetch(`/api/location/${route.params.slug}/add`, {
    method: "post",
    body: values,
  });
}

function submitComplete() {
  navigateTo({
    name: "dashboard-location-slug",
    params: {
      slug: route.params.slug,
    },
  });
}
</script>

<template>
  <LocationLogForm
    submit-label="Add Location Log"
    submit-icon="tabler:map-pin-plus"
    :on-submit="onSubmit"
    :on-submit-complete="submitComplete"
    :initial-values="{
      name: '',
      description: '',
      startedAt: Date.now() - (24 * 60 * 60 * 1000),
      endedAt: Date.now(),
      long: currentLocation?.long || (CENTER_UK as [number, number])[0],
      lat: currentLocation?.lat || (CENTER_UK as [number, number])[1],
    }"
  />
</template>

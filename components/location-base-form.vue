<script lang="ts" setup generic="T extends LatLongCoordinate">
import type { FetchError } from "ofetch";
import type { ZodSchema } from "zod";

import { toTypedSchema } from "@vee-validate/zod";
import { AppPlaceSearch } from "#components";

import type { LatLongCoordinate, NominatimResult } from "~/lib/types";

import { CENTER_UK } from "~/lib/constants";
import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const props = defineProps<{
  initialValues: T;
  schema: ZodSchema;
  onSubmit: (location: T) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  zoom?: number;
}>();

const router = useRouter();
const mapStore = useMapStore();

const { handleSubmit, errors, meta, setErrors, setFieldValue, controlledValues } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues,
});

const submitted = ref(false);
const submitError = ref("");
const loading = ref(false);

const onSubmit = handleSubmit(async (values: T) => {
  try {
    submitError.value = "";
    loading.value = true;
    await props.onSubmit(values);
    submitted.value = true;
    props.onSubmitComplete();
  }
  catch (e) {
    const error = e as FetchError;

    if (error.data?.data) {
      setErrors(error.data.data);
    }

    submitError.value = getFetchErrorMessage(error);
  }
  loading.value = false;
});

function formatNumber(value?: number) {
  if (!value)
    return 0;
  return value.toFixed(5);
}

function searchResultSelected(result: NominatimResult) {
  setFieldValue("name", result.display_name);
  mapStore.addedPoint = {
    id: 1,
    name: "Added Point",
    description: "",
    long: Number(result.lon),
    lat: Number(result.lat),
    centerMap: true,
  };
}

effect(() => {
  if (mapStore.addedPoint) {
    setFieldValue("long", mapStore.addedPoint.long);
    setFieldValue("lat", mapStore.addedPoint.lat);
  }
});

onMounted(() => {
  mapStore.addedPoint = {
    id: 1,
    name: "Added Point",
    description: "",
    long: props.initialValues?.long ?? (CENTER_UK as [number, number])[0],
    lat: props.initialValues?.lat ?? (CENTER_UK as [number, number])[1],
    zoom: props.zoom,
  };
});

onBeforeRouteLeave(() => {
  if (!submitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm(
      "Are you sure you want to leave? All unsaved changes will be lost.",
    );

    if (!confirm) {
      return false;
    }
  }
  mapStore.addedPoint = null;
  return true;
});
</script>

<template>
  <div
    v-if="submitError"
    role="alert"
    class="alert alert-error"
  >
    <Icon
      name="tabler:alert-hexagon"
      class="shrink-0 stroke-current"
      size="24"
    />
    <span>{{ submitError }}</span>
  </div>
  <form class="flex flex-col gap-1" @submit.prevent="onSubmit">
    <slot :errors="errors" :loading />
    <p class="text-sm">
      Current coordinates: {{ formatNumber(controlledValues.lat) }}, {{ formatNumber(controlledValues.long) }}
    </p>
    <p class="text-sm text-gray-600">
      To set desired coordinates
    </p>
    <ul class="list-disc ml-4 text-xs text-gray-600">
      <li>
        Drag the
        <span>
          <Icon name="tabler:map-pin-filled" class="text-warning" />
        </span>
        marker to your desired coordinates
      </li>
      <li>
        Double-click
        <span>
          <Icon name="tabler:hand-click" class="text-warning" />
        </span>
        on map.
      </li>
      <li>
        Search
        <span>
          <Icon name="tabler:search" class="text-warning" />
        </span>
        below
      </li>
    </ul>

    <div class="flex justify-between mt-2">
      <button
        type="button"
        class="btn bg-base-300"
        :disabled="loading"
        @click="router.back()"
      >
        <Icon name="tabler:arrow-left" size="24" />
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ props.submitLabel }}
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <Icon
          v-else
          :name="props.submitIcon"
          size="24"
        />
      </button>
    </div>
  </form>
  <div class="divider" />
  <AppPlaceSearch @result-selected="searchResultSelected" />
</template>

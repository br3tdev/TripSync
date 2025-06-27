<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { AppFormField } from "#components";

import { InsertLocation } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp();

const { handleSubmit, errors, meta, setErrors } = useForm({
  validationSchema: toTypedSchema(InsertLocation),
});

const loading = ref(false);
const submitted = ref(false);
const submitError = ref("");

const onSubmit = handleSubmit(async (values) => {
  try {
    submitError.value = "";
    loading.value = true;
    await $csrfFetch("/api/locations", {
      method: "POST",
      body: values,
    });
    submitted.value = true;
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;

    if (error.data?.data) {
      setErrors(error.data?.data);
    }

    submitError.value = error.data?.statusMessage || error.statusMessage || "Unknown error occurred.";
  }
  loading.value = false;
});

const router = useRouter();

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
  return true;
});
</script>

<template>
  <div class="container max-w-md mx-auto p-4">
    <div class="my-4">
      <h1 class="text-lg">
        Add Location
      </h1>
      <p class="text-sm">
        A location is a place you have traveled or will travel to. It can be a city, country, state or point of interest. You can add specific times you visited this location after adding it.
      </p>
    </div>
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
      <AppFormField
        name="name"
        label="Name"
        type="text"
        description="e.g. Paris, France or Grand Canyon"
        :error="errors.name"
        :disabled="loading"
      />
      <AppFormField
        name="description"
        label="Description"
        type="textarea"
        description="Describe the location, your experiences, or why you want to visit (optional)"
        :error="errors.description"
        :disabled="loading"
      />
      <AppFormField
        name="lat"
        type="number"
        label="Latitude"
        description="e.g. 48.8566"
        :error="errors.lat"
        :disabled="loading"
      />
      <AppFormField
        name="long"
        type="number"
        label="Longitude"
        description="e.g. 2.3522"
        :error="errors.long"
        :disabled="loading"
      />

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
          Add
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          <Icon
            v-else
            name="tabler:circle-plus-filled"
            size="24"
          />
        </button>
      </div>
    </form>
  </div>
</template>

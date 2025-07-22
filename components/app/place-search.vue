<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { NominatimResult } from "~/lib/types";

import { SearchSchema } from "~/lib/zod-schemas";
import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const emit = defineEmits<{
  resultSelected: [result: NominatimResult];
}>();

const searchResults = ref<NominatimResult[]>([]);
const form = useTemplateRef("form");
const loading = ref(false);
const hasSearched = ref(false);
const errorMessage = ref("");

async function onSubmit(query: Record<string, string>) {
  try {
    loading.value = true;
    hasSearched.value = true;
    errorMessage.value = "";
    searchResults.value = [];
    const results = await $fetch("/api/search", {
      query,
    });
    searchResults.value = results;
    hasSearched.value = true;
  }
  catch (e) {
    const error = e as FetchError;

    errorMessage.value = getFetchErrorMessage(error);
  }
  loading.value = false;
}

function setLocationWithResult(result: NominatimResult) {
  emit("resultSelected", result);
  searchResults.value = [];
  errorMessage.value = "";
  hasSearched.value = false;
  if (form.value) {
    form.value.resetForm();
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Form
      ref="form"
      v-slot="{ errors }"
      class="flex flex-col gap-2 items-center"
      :validation-schema="toTypedSchema(SearchSchema)"
      :initial-values="{ q: '' }"
      @submit="onSubmit"
    >
      <div class="join mt-4">
        <div>
          <label class="input validator join-item">
            <Icon name="tabler:map-pin-share" size="24" />
            <Field
              type="text"
              name="q"
              :disabled="loading"
              placeholder="Search for a location..."
              :class="{
                'input-error': errors.q,
              }"
            />
          </label>
          <div v-if="errors.q" class="validator-hint text-error">
            {{ errors.q }}
          </div>
        </div>
        <button
          type="submit"
          class="btn btn-neutral join-item"
          :disabled="loading"
        >
          Search
        </button>
      </div>
    </Form>
    <div
      v-if="!loading && errorMessage"
      role="alert"
      class="alert alert-error"
    >
      <Icon
        name="tabler:alert-hexagon"
        class="shrink-0 stroke-current"
        size="24"
      />
      <span>{{ errorMessage }}</span>
    </div>
    <div
      v-if="!loading && hasSearched && !searchResults.length"
      role="alert"
      class="alert"
    >
      <Icon
        name="tabler:barrier-block-filled"
        class="shrink-0 stroke-current"
        size="24"
      />
      <span>No results found.</span>
    </div>
    <div v-if="loading" class="flex justify-center">
      <div class="loading loading-lg" />
    </div>
    <div class="flex flex-col overflow-auto scrollbar-custom gap-2 max-h-36 mt-2">
      <div
        v-for="result in searchResults"
        :key="result.place_id"
        class="card w-96 bg-base-100 card-xs shadow-sm"
      >
        <div class="card-body">
          <h2 class="card-title">
            {{ result.name }}
          </h2>
          <div class="justify-end card-actions">
            <button class="btn btn-warning btn-xs" @click="setLocationWithResult(result)">
              Set location
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

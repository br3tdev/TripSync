<script lang="ts" setup>
import { CENTER_UK } from "~/lib/constants";
import { InsertLocation } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertLocation;
  onSubmit: (location: InsertLocation) => Promise<any>;
  onSubmitComplete: () => void;
  submitLabel: string;
  submitIcon: string;
  zoom?: number;
}>();
</script>

<template>
  <LocationBaseForm
    v-slot="{ errors, loading }"
    :schema="InsertLocation"
    :initial-values="props.initialValues || {
      name: '',
      description: '',
      long: (CENTER_UK as [number, number])[0],
      lat: (CENTER_UK as [number, number])[1],
    }"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
    :zoom="props.zoom ?? 6"
  >
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
  </LocationBaseForm>
</template>

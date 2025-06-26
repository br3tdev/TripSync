<script lang="ts" setup>
type InputType = "text" | "textarea" | "number";

const props = defineProps<{
  label: string;
  name: string;
  type?: InputType;
  error?: string;
  description: string;
  disabled?: boolean;
}>();

// Default to text if not specified
const inputType = computed(() => props.type || "text");
const isTextarea = computed(() => inputType.value === "textarea");
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ props.label }}
    </legend>
    <Field
      :as="isTextarea ? 'textarea' : 'input'"
      :name="props.name"
      :type="isTextarea ? undefined : inputType"
      class="w-full"
      :class="{
        'input-error': props.error,
        'input': !isTextarea,
        'textarea': isTextarea,
      }"
      :placeholder="props.description"
      :disabled="disabled"
    />
    <p v-if="props.error" class="label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>

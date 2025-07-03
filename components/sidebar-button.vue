<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
  label: string;
  icon: string;
  href?: string;
  to?: RouteLocationRaw;
  showLabel: boolean;
  iconColor?: "text-accent" | "text-primary" | "text-secondary";
}>();

const route = useRoute();
</script>

<template>
  <div
    class="tooltip-right"
    :class="{ tooltip: !showLabel }"
    :data-tip="showLabel ? undefined : props.label"
  >
    <NuxtLink
      :to="props.href || props.to"
      :class="{ 'bg-base-200': route.path === props.href, 'justify-start': showLabel, 'justify-center': !showLabel }"
      class="flex gap-1.5 px-4 py-2 hover:bg-base-300 hover:cursor-pointer flex-nowrap"
    >
      <Icon
        :name="props.icon"
        size="24"
        class="shrink-0"
        :class="iconColor"
      />
      <span v-if="showLabel" class="truncate">
        {{ props.label }}
      </span>
    </NuxtLink>
  </div>
</template>

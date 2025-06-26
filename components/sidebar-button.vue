<script lang="ts" setup>
const props = defineProps<{
  label: string;
  icon: string;
  href: string;
  showLabel: boolean;
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
      :to="props.href"
      :class="{ 'bg-base-200': route.path === props.href, 'justify-start': showLabel, 'justify-center': !showLabel }"
      class="flex gap-1.5 px-4 py-2 hover:bg-base-300 hover:cursor-pointer flex-nowrap"
    >
      <Icon :name="props.icon" size="24" />
      <span v-if="showLabel">
        {{ props.label }}
      </span>
    </NuxtLink>
  </div>
</template>

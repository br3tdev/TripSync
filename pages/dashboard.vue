<script lang="ts" setup>
const route = useRoute();
const isSidebarOpen = ref(true);
const sidebarStore = useSidebarStore();
const locationStore = useLocationStore();

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("isSidebarOpen") === "true";
  if (route.path !== "/dashboard") {
    locationStore.refresh();
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="flex-1 flex">
    <div class="bg-base-100 transition-all duration-300 ease-in-out" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
      <div
        class="flex hover:cursor-pointer hover:bg-base-200"
        :class="{ 'justify-end': isSidebarOpen, 'justify-center': !isSidebarOpen }"
        @click="toggleSidebar"
      >
        <Icon
          name="tabler:chevron-left"
          :class="{ 'rotate-180 transition-all duration-300 ease-in-out': !isSidebarOpen }"
          size="32"
        />
      </div>
      <div class="flex flex-col">
        <SidebarButton
          label="Locations"
          icon="tabler:map"
          href="/dashboard"
          :show-label="isSidebarOpen"
        />
        <SidebarButton
          label="Add locations"
          icon="tabler:circle-plus-filled"
          href="/dashboard/add"
          :show-label="isSidebarOpen"
        />
        <div v-if="sidebarStore.loading || sidebarStore.sidebarItems.length" class="divider" />
        <div class="px-4">
          <div v-if="sidebarStore.loading">
            <div
              v-for="i in 5"
              :key="i"
              class="skeleton h-6 self-center mb-2"
            />
          </div>
        </div>
        <div v-if="sidebarStore.loading || sidebarStore.sidebarItems.length" class="flex flex-col">
          <SidebarButton
            v-for="item in sidebarStore.sidebarItems"
            :key="item.id"
            :show-label="isSidebarOpen"
            :label="item.label"
            :icon="item.icon"
            :href="item.href"
          />
        </div>
        <div class="divider" />
        <SidebarButton
          label="Sign Out"
          icon="tabler:logout-2"
          href="/sign-out"
          :show-label="isSidebarOpen"
        />
      </div>
    </div>
    <div class=" flex-1">
      <NuxtPage />
    </div>
  </div>
</template>

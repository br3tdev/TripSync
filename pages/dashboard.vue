<script lang="ts" setup>
import { CURRENT_LOCATION_PAGES, EDIT_PAGES, LOCATION_PAGES } from "~/lib/constants";
import { isPointSelected } from "~/util/map-points";

const route = useRoute();
const isSidebarOpen = ref(true);
const sidebarStore = useSidebarStore();
const locationStore = useLocationStore();
const mapStore = useMapStore();

const {
  currentLocation,
  currentLocationStatus,
} = storeToRefs(locationStore);

if (LOCATION_PAGES.has(route.name?.toString() ?? "")) {
  await locationStore.refreshLocations();
}

if (CURRENT_LOCATION_PAGES.has(route.name?.toString() ?? "")) {
  await locationStore.refreshCurrentLocation();
}

onMounted(() => {
  isSidebarOpen.value = localStorage.getItem("isSidebarOpen") === "true";
});

effect(() => {
  if (LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarTopItems = [{
      id: "link-dashboard",
      label: "Locations",
      href: "/dashboard",
      icon: "tabler:map",
    }, {
      id: "link-location-add",
      label: "Add Location",
      href: "/dashboard/add",
      icon: "tabler:circle-plus-filled",
    }];
  }
  else if (CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
    sidebarStore.sidebarTopItems = [{
      id: "link-dashboard",
      label: "Back to Locations",
      href: "/dashboard",
      icon: "tabler:arrow-left",
    }];

    if (currentLocation.value && currentLocationStatus.value !== "pending") {
      sidebarStore.sidebarTopItems.push({
        id: "link-dashboard",
        label: currentLocation.value.name,
        to: {
          name: "dashboard-location-slug",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map",
      }, {
        id: "link-dashboard-edit",
        label: "Edit Location",
        to: {
          name: "dashboard-location-slug-edit",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:map-pin-cog",
      }, {
        id: "link-location-add",
        label: "Add Location Log",
        to: {
          name: "dashboard-location-slug-add",
          params: {
            slug: route.params.slug,
          },
        },
        icon: "tabler:circle-plus-filled",
      });
    }
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="flex-1 flex">
    <div class="bg-base-100 transition-all duration-300 ease-in-out shrink-0" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
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
      <div class="h-full flex flex-col">
        <SidebarButton
          v-for="item in sidebarStore.sidebarTopItems"
          :key="item.id"
          :label="item.label"
          :icon="item.icon"
          :href="item.href"
          :to="item.to"
          :show-label="isSidebarOpen"
        />
        <div v-if="route.path.startsWith('/dashboard/location') && currentLocationStatus === 'pending'" class="flex items-center justify-center">
          <div class="loading" />
        </div>
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
            :to="item.to"
            :icon-color="isPointSelected(item.mapPoint, mapStore.selectedPoint) ? 'text-accent' : undefined"
            @mouseenter="mapStore.selectedPoint = item.mapPoint ?? null"
            @mouseleave="mapStore.selectedPoint = null"
          />
        </div>
        <div class="my-auto">
          <div class="divider" />
          <SidebarButton
            label="Sign Out"
            icon="tabler:logout-2"
            href="/sign-out"
            :show-label="isSidebarOpen"
          />
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-auto bg-base-200">
      <div
        class="flex size-full"
        :class="{ 'flex-col': !EDIT_PAGES.has(route.name?.toString() || '') }"
      >
        <NuxtPage
          :class="{
            'w-96': EDIT_PAGES.has(route.name?.toString() || ''),
            'shrink-0': EDIT_PAGES.has(route.name?.toString() || ''),
          }"
        />
        <AppMap class="flex-1" />
      </div>
    </div>
  </div>
</template>

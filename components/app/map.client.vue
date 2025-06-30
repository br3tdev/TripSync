<script lang="ts" setup>
import { CENTER_UK } from "~/lib/constants";

const colorMode = useColorMode();

const style = computed(() => colorMode.value === "dark"
  ? "/styles/dark.json"
  : "https://tiles.openfreemap.org/styles/liberty");

const zoom = 4;
</script>

<template>
  <MglMap
    :map-style="style"
    :center="CENTER_UK"
    :zoom="zoom"
  >
    <MglNavigationControl />
  </MglMap>
</template>

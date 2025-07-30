<script lang="ts" setup>
import { FetchError } from "ofetch";

import type { SelectLocationLogImage } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp();
const route = useRoute();

const locationStore = useLocationStore();
const {
  currentLocationLog: locationLog,
} = storeToRefs(locationStore);
const image = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const loading = ref<boolean>(false);
const errorMessage = ref("");
const imageInput = useTemplateRef("imageInput");

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    image.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
}

async function getCheckSum(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

function uploadImage() {
  if (!image.value || !previewUrl.value) {
    return;
  };

  loading.value = true;
  errorMessage.value = "";
  const previewImage = new Image();
  previewImage.addEventListener("load", async () => {
    const width = Math.min(1000, previewImage.width);
    const resized = await createImageBitmap(previewImage, {
      resizeWidth: width,
    });
    const canvas = new OffscreenCanvas(width, resized.height);
    canvas.getContext("bitmaprenderer")?.transferFromImageBitmap(resized);
    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.9,
    });

    const checksum = await getCheckSum(blob);

    try {
      const { url, fields, key } = await $csrfFetch(`/api/location/${route.params.slug}/${route.params.id}/sign-image`, {
        method: "POST",
        body: {
          contentLength: blob.size,
          checksum,
        },
      });
      console.log(url, fields, key);

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string); // Automatically includes metadata
      });
      formData.append("file", blob);

      await $fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "x-amz-checksum-algorithm": "SHA256",
        },
      });

      await $csrfFetch(`/api/location/${route.params.slug}/${route.params.id}/image`, {
        method: "POST",
        body: { key },
      });

      await locationStore.refreshCurrentLocationLog();
      image.value = null;
      previewUrl.value = null;
      if (imageInput.value) {
        imageInput.value.value = "";
      };
    }
    catch (e) {
      if (e instanceof FetchError) {
        errorMessage.value = (e as FetchError).statusMessage || "Unknown error occurred";
      }
      else if (e instanceof Error) {
        errorMessage.value = (e as Error).message;
      }
      else {
        errorMessage.value = "Unknown Error";
      }
    }

    loading.value = false;
  });
  previewImage.src = previewUrl.value;
}

// Delete image dialog
const isOpen = ref(false);
const deletingImage = ref<SelectLocationLogImage | null>();
const deleteError = ref("");
const isDeleting = ref(false);

function deleteImage(image: SelectLocationLogImage) {
  deletingImage.value = image;
  isOpen.value = true;
}

function onDialogClose() {
  isOpen.value = false;
}

async function onConfirmDelete() {
  if (!deletingImage.value) {
    return;
  }
  isOpen.value = false;
  try {
    isDeleting.value = true;
    deleteError.value = "";
    await $fetch(`/api/location/${route.params.slug}/${route.params.id}/image/${deletingImage.value?.id}`, {
      method: "DELETE",
    });
    await locationStore.refreshCurrentLocationLog();
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = getFetchErrorMessage(error);
  }
  isDeleting.value = false;
  deletingImage.value = null;
}
</script>

<template>
  <div class="flex justify-start">
    <div>
      <h2 class="mb-2 line-clamp-1">
        Manage {{ locationLog?.name ?? "Location log" }} Images
      </h2>

      <div class="flex gap-2 flex-col w-72">
        <div class="bg-gray-500 h-28 w-full flex justify-center items-center p-1 relative">
          <p v-if="!previewUrl" class="text-center text-white">
            Image preview
          </p>
          <img
            v-else
            :src="previewUrl"
            class="h-full object-cover"
            alt="upload preview"
          >
          <div v-if="loading || errorMessage" class="size-full absolute flex justify-center items-center bg-black opacity-50">
            <div v-if="loading" class="loading loading-lg" />
            <div v-else-if="errorMessage" class="error">
              {{ errorMessage }}
            </div>
          </div>
        </div>
        <input
          ref="imageInput"
          type="file"
          class="file-input"
          :disabled="loading"
          @change="selectImage"
        >
        <button
          class="btn btn-primary"
          :disabled="!image || loading"
          @click="uploadImage"
        >
          Upload
          <Icon name="tabler:photo-share" size="24" />
        </button>
      </div>
    </div>
    <ImageList class="ml-2" :images="locationLog?.images ?? []">
      <template #default="{ image: img }">
        <button
          :disabled="deletingImage?.id === img.id && isDeleting"
          class="btn btn-square btn-error btn-xs absolute top-2 right-2 z-10"
          @click="deleteImage(img)"
        >
          <Icon
            v-if="deletingImage?.id === img.id && deleteError"
            name="tabler:alert-circle"
            size="16"
          />
          <div v-else-if="deletingImage?.id === img.id && isDeleting" class="loading loading-xs" />
          <Icon
            v-else
            name="tabler:trash-x-filled"
            size="16"
          />
        </button>
      </template>
    </ImageList>
    <AppDialog
      title="Are you sure?"
      description="Deleting this location log cannot be undone. Are you sure you want to do this?"
      confirm-label="Yes, I am sure"
      confirm-class="btn-error"
      :is-open="isOpen"
      @on-closed="onDialogClose"
      @on-confirmed="onConfirmDelete"
    />
  </div>
</template>

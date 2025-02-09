<script lang="ts" setup>
import {
  SettingsS3,
  SettingsAppGallery,
  SettingsAppUpload,
  SettingsAppMisc,
  SettingsProfiles,
  SettingsSync
} from "#components";
import { z } from "zod";
const typeComponentMap = {
  profiles: SettingsProfiles,
  s3: SettingsS3,
  sync: SettingsSync,
  upload: SettingsAppUpload,
  gallery: SettingsAppGallery,
  misc: SettingsAppMisc,
};
const route = useRoute();
const type = computed(() => {
  try {
    return z
      .enum(["profiles", "sync", "s3", "upload", "gallery", "misc"])
      .parse(route.params.type);
  } catch {
    throw createError({
      statusCode: 404,
      message: "Not Found",
    });
  }
});
const component = computed(() => typeComponentMap[type.value]);
</script>
<template>
  <UContainer class="w-full">
    <UCard class="max-w-3xl w-full m-auto" style="view-transition-name: settings-panel">
      <SettingsLayout>
        <component :is="component" />
      </SettingsLayout>
    </UCard>
  </UContainer>
</template>

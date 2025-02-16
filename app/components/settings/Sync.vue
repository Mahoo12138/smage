<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

import { SUPPORT_SYNC_TYPE } from '~/common/data';
import { SyncFormSchemas } from '~/common/sync';

import DynamicForm from "../DynamicForm.vue";

const { t } = useI18n();
const toast = useToast();
const settings = useSettingsStore();
const { sync, app } = storeToRefs(settings);
const state = computed(() => sync.value[app.value.syncType])

const form = ref();
const uploadChipColor = ref<"green" | "red" | "gray">("gray");

const isTestingConnectivity = ref(false);

const action = ref("test")

const s3SettingsSchema = z.object({
  syncType: z.string()
});

type Schema = z.output<typeof s3SettingsSchema>;

const failActions = [
  {
    label: t("settings.s3.submitFormButton.message.fail.actionLabel"),
    click: () => {
      window.open(
        t("settings.s3.submitFormButton.message.fail.actionLink"),
        "_blank",
      );
    },
  },
];


async function onSubmit(_event: FormSubmitEvent<Schema>) {
  console.log('action', action);
  isTestingConnectivity.value = true;

  toast.add({
    title: t("settings.s3.submitFormButton.message.try.title"),
  });

  await settings.processor.checkAuth();

  if ('!get'.lastIndexOf('')) {
    toast.add({
      title: t("settings.s3.submitFormButton.message.fail.title"),
      description: t("settings.s3.submitFormButton.message.fail.desc4configOrCors"),
      actions: failActions,
    });
    uploadChipColor.value = "red";
    isTestingConnectivity.value = false;
    return;
  }


  isTestingConnectivity.value = false;
}
</script>

<template>
  <div class="flex flex-col space-y-2 mb-4">
    <UAlert :title="$t('settings.info.privacy.title')" :description="$t('settings.info.privacy.description')" />
  </div>
  <UFormGroup :label="$t('settings.app.syncType.title')" :description="$t('settings.app.syncType.description')"
    name="syncType">
    <USelectMenu v-model="app.syncType" :options="SUPPORT_SYNC_TYPE">
      <template #label>
        {{ $t(`settings.sync.${app.syncType}.title`) }}
      </template>
      <template #option="{ option: type }">
        {{ $t(`settings.sync.${type}.title`) }}
      </template>
    </USelectMenu>
  </UFormGroup>

  <UDivider class="my-4" />

  <DynamicForm v-if="app.syncType !== 'none'" :key="app.syncType" :schema="SyncFormSchemas[app.syncType]!" :state="state"
    :onSubmit="onSubmit">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row gap-2 items-center justify-start">
        <UTooltip :text="$t('settings.s3.submitFormButton.icons.upload')">
          <UChip :color="uploadChipColor">
            <UIcon name="i-mingcute-file-upload-line" class="text-xl" />
          </UChip>
        </UTooltip>
      </div>
      <div class="flex flex-row justify-between gap-2">
        <UButton color="white" type="submit" @click="action = 'test'" :loading="isTestingConnectivity">
          {{ $t("settings.sync.submitFormButton.titles.test") }}
        </UButton>
        <UButton type="submit" @click="action = 'download'" :loading="isTestingConnectivity">
          {{ $t("settings.sync.submitFormButton.titles.download") }}
        </UButton>
        <UButton type="submit" @click="action = 'upload'" :loading="isTestingConnectivity">
          {{ $t("settings.sync.submitFormButton.titles.upload") }}
        </UButton>
      </div>
    </div>
  </DynamicForm>

</template>

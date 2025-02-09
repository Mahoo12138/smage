<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

import { SUPPORT_SYNC_TYPE } from '~/common/data';

const toast = useToast();
const settings = useSettingsStore();
const { app: state } = storeToRefs(settings);
const { t } = useI18n();

const form = ref();

const uploadChipColor = ref<"green" | "red" | "gray">("gray");
const listChipColor = ref<"green" | "red" | "gray">("gray");
const deleteChipColor = ref<"green" | "red" | "gray">("gray");

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
  // const { get, upload, delete: del, list } = await settings.test();
  if ('!get'.lastIndexOf('')) {
    toast.add({
      title: t("settings.s3.submitFormButton.message.fail.title"),
      description: t("settings.s3.submitFormButton.message.fail.desc4configOrCors"),
      actions: failActions,
    });
    uploadChipColor.value = "red";
    listChipColor.value = "red";
    deleteChipColor.value = "red";
    isTestingConnectivity.value = false;
    return;
  }

  // uploadChipColor.value = upload ? "green" : "red";
  // listChipColor.value = list ? "green" : "red";
  // deleteChipColor.value = del ? "green" : "red";

  isTestingConnectivity.value = false;

  // const i18nSectionInToast = (() => {
  //   if (upload && list && del) {
  //     return "success";
  //   } else if (!upload && !list && !del) {
  //     return "fail";
  //   } else {
  //     return "warning";
  //   }
  // })();
  // toast.add({
  //   // prettier-ignore
  //   title: t(`settings.s3.submitFormButton.message.${i18nSectionInToast}.title`),
  //   // prettier-ignore
  //   description: t(`settings.s3.submitFormButton.message.${i18nSectionInToast}.description`),
  //   actions: i18nSectionInToast === "success" ? undefined : failActions,
  // });
}
</script>

<template>
  <div class="flex flex-col space-y-2 mb-4">
    <UAlert :title="$t('settings.info.privacy.title')" :description="$t('settings.info.privacy.description')" />
  </div>
  <UForm ref="form" :schema="s3SettingsSchema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup :label="$t('settings.app.syncType.title')" :description="$t('settings.app.syncType.description')"
      name="syncType">
      <USelectMenu v-model="state.syncType" :options="SUPPORT_SYNC_TYPE">
        <template #label>
          {{ $t(`settings.sync.${state.syncType}.title`) }}
        </template>
        <template #option="{ option: type }">
          {{ $t(`settings.sync.${type}.title`) }}
        </template>
      </USelectMenu>
    </UFormGroup>

    <UDivider />


    <div class="flex justify-between">
      <UFormGroup :label="$t('settings.s3.form.forcePathStyle.title')"
        :description="$t('settings.s3.form.forcePathStyle.description')" name="forcePathStyle" />
      <div class="flex flex-col justify-center">
        <UToggle v-model="state.forcePathStyle" on-icon="i-heroicons-check-20-solid"
          off-icon="i-heroicons-x-mark-20-solid" />
      </div>
    </div>

    <UFormGroup :label="$t('settings.s3.form.publicUrl.title')" :hint="$t('settings.s3.form.publicUrl.optional')"
      name="pubUrl">
      <template #description>
        <div>
          <span class="inline-flex items-center">
            {{ $t("settings.s3.form.publicUrl.description") }}
            <UPopover mode="hover">
              <UButton icon="i-mingcute-information-line" size="2xs" color="primary" square variant="link" :aria-label="$t(
                'a11y.settings.s3.form.publicUrl.description.learnMoreButton',
              )
                " />
              <template #panel>
                <UCard :ui="{
                  body: {
                    base: 'max-w-[90vw] md:w-[40rem] space-y-3',
                  },
                }">
                  <!-- prettier-ignore -->
                  <p>{{ $t("settings.s3.form.publicUrl.descriptionExtended.line1") }}</p>
                  <!-- prettier-ignore -->
                  <p>{{ $t("settings.s3.form.publicUrl.descriptionExtended.line2") }}</p>
                </UCard>
              </template>
            </UPopover>
          </span>
        </div>
      </template>
      <UInput v-model="state.keyTemplate" />
    </UFormGroup>

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
  </UForm>
</template>

import { skipHydrate } from "pinia";
import type { SyncConfigSetting } from "~/common/sync";
import type { AllSettings, AppSettings, S3Settings, SyncSettings } from "~/types";
import { appSettingsSchema, s3SettingsSchema } from "~/types";
import * as checkOp from "~/utils/testOps";

export const useSettingsStore = defineStore("settings", () => {
  // MARK: states
  const s3 = useLocalStorage(
    "s3-settings",
    {
      endpoint: "",
      bucket: "",
      accKeyId: "",
      secretAccKey: "",
      region: "",
      pubUrl: "",
      forcePathStyle: false,
    } satisfies S3Settings as S3Settings,
    { mergeDefaults: true },
  );

  const app = useLocalStorage(
    "app-settings",
    {
      enableAutoRefresh: false,
      enableFuzzySearch: true,
      fuzzySearchThreshold: 0.6,
      convertType: "none",
      compressionMaxSize: "",
      compressionMaxWidthOrHeight: "",
      keyTemplate: "",
      noLongerShowRootPage: false,
      syncType: "none"
    } satisfies AppSettings as AppSettings,
    { mergeDefaults: true },
  );

  const sync = useLocalStorage(
    "sync-settings",
    {
      gist: {
        token: ""
      },
      webdav: {
        path: "",
        host: "",
        username: "",
        password: ""
      }
    } satisfies SyncConfigSetting as SyncConfigSetting,
    { mergeDefaults: true },
  );

  const validity = computed(() => ({
    app: appSettingsSchema.safeParse(app.value).success,
    s3: s3SettingsSchema.safeParse(s3.value).success,
    all:
      appSettingsSchema.safeParse(app.value).success &&
      s3SettingsSchema.safeParse(s3.value).success,
  }));

  //MARK: actions

  const test: () => Promise<{
    get: boolean;
    list: boolean;
    delete: boolean;
    upload: boolean;
  }> = async () => {
    debug("Start testing S3 connectivity...");
    let { testKey, testContent } = generateTestKeyAndContent();
    debug("Generated test key and content:", testKey, testContent);
    try {
      let limit = 3;
      while ((await checkOp.exists(s3.value, testKey)) && limit-- > 0) {
        debug("Object already exists, generating new test key and content...");
        ({ testKey, testContent } = generateTestKeyAndContent());
      }
    } catch (e) {
      console.error("Error occurred while checking if object exists:", e);
      return {
        get: false,
        list: false,
        delete: false,
        upload: false,
      };
    }
    debug("Unique test key and content generated.");

    const upload = await checkOp.upload(s3.value, testKey, testContent);
    const list = await checkOp.list(s3.value);
    const del = await checkOp.del(s3.value, testKey);
    return {
      get: true,
      upload,
      list,
      delete: del,
    };
  };

  const exportSettings = (name?: string): AllSettings => {
    if (!name)
      return {
        s3: s3.value,
        app: app.value,
      };

    const profile = profiles.value.find((p) => p.name === name);
    if (profile) {
      return profile.settings;
    } else {
      throw new Error(`Profile "${name}" not found`);
    }
  };

  const importSettings = (settings: AllSettings) => {
    const { success: appSuccess, data: appData } = appSettingsSchema.safeParse(
      settings.app,
    );
    const { success: s3Success, data: s3Data } = s3SettingsSchema.safeParse(
      settings.s3,
    );
    if (!appSuccess || !s3Success) {
      throw new Error("Invalid settings format");
    }
    app.value = appData;
    s3.value = s3Data;
  };

  const profiles = useLocalStorage<{ name: string; settings: AllSettings }[]>(
    "s3pi:settings-profiles",
    [],
  );

  const saveProfile = (name: string) => {
    const index = profiles.value.findIndex((p) => p.name === name);
    if (index === -1) {
      profiles.value.push({ name, settings: { s3: s3.value, app: app.value } });
    } else {
      profiles.value[index] = {
        name,
        settings: { s3: s3.value, app: app.value },
      };
    }
  };

  const loadProfile = (name: string) => {
    const profile = profiles.value.find((p) => p.name === name);
    if (profile) {
      if (!profileEquals(profile.settings, { s3: s3.value, app: app.value })) {
        useGalleryStateStore().clearAll();
      }

      s3.value = profile.settings.s3;
      app.value = profile.settings.app;
    }
  };

  const deleteProfile = (name: string) => {
    const index = profiles.value.findIndex((p) => p.name === name);
    if (index !== -1) {
      profiles.value.splice(index, 1);
    }
  };

  return {
    s3: skipHydrate(s3),
    app: skipHydrate(app),
    sync: skipHydrate(sync),
    validity: skipHydrate(validity),

    test,
    exportSettings,
    importSettings,

    profiles: skipHydrate(profiles),
    saveProfile,
    loadProfile,
    deleteProfile,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}

function generateTestKeyAndContent() {
  const timestamp = Date.now();
  const testKey = `test-object-key-${timestamp}.txt`;
  const testContent = `This is a test object generated by S3-image-port at ${new Date(timestamp).toISOString()}`;
  return { testKey, testContent };
}

function profileEquals(a: AllSettings, b: AllSettings) {
  for (const key in a.s3) {
    if (a.s3[key as keyof S3Settings] !== b.s3[key as keyof S3Settings]) {
      return false;
    }
  }
  for (const key in a.app) {
    if (a.app[key as keyof AppSettings] !== b.app[key as keyof AppSettings]) {
      return false;
    }
  }
  return true;
}

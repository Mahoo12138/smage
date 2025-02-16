// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    // typeCheck: true
  },
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/global.css"],
  i18n: {
    locales: [
      {
        code: "en",
        language: "en-US",
        file: "en.json",
        name: "English",
      },
      {
        code: "zh",
        language: "zh-CN",
        file: "zh.json",
        name: "简体中文",
      },
    ],
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      fallbackLocale: "en",
      alwaysRedirect: false,
      redirectOn: "root",
    },
    skipSettingLocaleOnNavigate: true,
  },
  experimental: {
    viewTransition: true,
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2024-09-21",
});

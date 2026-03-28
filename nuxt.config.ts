// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-27',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@pinia/nuxt'],
  nitro: {
    preset: 'cloudflare-module',
  },
})

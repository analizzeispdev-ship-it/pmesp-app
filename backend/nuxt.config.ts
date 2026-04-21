export default defineNuxtConfig({
  ssr: false,

  nitro: {
    preset: 'node-server',
    devProxy: {},
  },

  runtimeConfig: {
    mongoUri: '',
    jwtSecret: '',
  },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css',"element-plus/dist/index.css"],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  ssr: true,
  pages: true,
  plugins: ['~/plugins/axios.ts'],
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      axios: {
        baseURL: 'https://localhost:8001/api',
        credentials: true,
      },
    },
  },
  nitro: {
    devProxy: {
      "/api": {
        target: "https://localhost:8001",
        changeOrigin: true,
        secure: false  // 忽略无效证书
      }
    }
  }
})

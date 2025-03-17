import type { AxiosInstance } from 'axios'

declare module 'nuxt/app' {
    interface NuxtApp {
        $axios: AxiosInstance
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $axios: AxiosInstance
    }
}

export {}
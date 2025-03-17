import axios from 'axios'
import type { AxiosInstance } from 'axios'

export default defineNuxtPlugin(() => {
    // 创建 Axios 实例
    const instance: AxiosInstance = axios.create({
        baseURL: 'http://localhost:3001', // 根据需要替换你的后端 API 地址
        withCredentials: true, // 如果后端需要支持跨域 Cookies
        headers: {
            'Content-Type': 'application/json', // 请求格式
        },
    })

    // 返回插件内容，将 $axios 注入到 Nuxt 应用中
    return {
        provide: {
            axios: instance, // 全局注册 $axios
        },
    }
})
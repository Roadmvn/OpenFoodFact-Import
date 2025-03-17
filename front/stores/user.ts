import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as null | { id: number; firstName: string; lastName: string,
            phone: string, address: string, zipCode: string, city: string,
            country: string, email: string, createdAt: string,
            updatedAt: string, role: string}, // 当前用户信息
        isAuthenticated: false, // 登录状态
    }),
    actions: {
        async login(email: string, password: string) {
            const { $axios } = useNuxtApp() // 使用 Axios 实例

            try {
                // 登录 API 调用（Cookies 会由后端通过 Set-Cookie 传递）
                const response = await $axios.post('/auth/login', {
                    "email":email,
                    "password":password,
                })

                // 假设后端返回用户信息
                this.user = response.data.token
                this.isAuthenticated = true
            } catch (error) {
                console.error('La connexion a échoué:', error)
                throw error
            }
        },

        async fetchUser() {
            const { $axios } = useNuxtApp()

            try {
                // 获取用户信息
                const response = await $axios.get('/auth/me') // /me 是后端返回当前登录用户信息的接口
                console.log('User fetched:', response.data.user)

                this.user = response.data.user
                this.isAuthenticated = true
            } catch (error) {
                console.error('Impossible d\'obtenir les informations de l\'utilisateur:', error)
                this.isAuthenticated = false
                this.user = null
            }
        },

        isAdmin() {
            return this.user?.role === 'admin'
        },

        isSeller() {
          return this.user?.role === 'seller'
        },

        isBuyer() {
            return this.user?.role === 'buyer'
        },

        isConnected() {
            console.log(this.user)
            return this.user !== null
        },

        logout() {
            const { $axios } = useNuxtApp()

            // 请求后端的登出 API（同时清理 Cookie）
            $axios.post('/auth/logout')
            this.isAuthenticated = false
            this.user = null
        },
    },
})
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore()

    try {
        // 等待用户信息加载完成
        await userStore.fetchUser()

        // 检测用户是否已认证
        if (!userStore.isAuthenticated) {
            return navigateTo('/401')
        }
    } catch (error) {
        console.error('Authentication failed:', error)
        return navigateTo('/401') // 即使失败也确保拦截未登录用户
    }
})

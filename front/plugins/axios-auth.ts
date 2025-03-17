export default defineNuxtPlugin(async () => {
    const userStore = useUserStore()

    try {
        // 每次应用启动时刷新用户信息
        await userStore.fetchUser()
    } catch (error) {
        console.error('初始化用户状态失败:', error)
    }
})
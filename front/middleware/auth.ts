export default defineNuxtRouteMiddleware(() => {
    const userStore = useUserStore()

    // 检测用户是否已认证，未登录则跳转到登录页面
    if (!userStore.isConnected) {
        // alert('Vous devez vous connecter pour accéder à cette page！')
        return navigateTo('/401')
    }
})
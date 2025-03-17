export default defineNuxtRouteMiddleware(() => {
    const userStore = useUserStore()

    if (!userStore.isAdmin) {
        // alert('Vous n\'avez pas la permission d\'accéder à cette page！')
        return navigateTo('/401')
    }

})
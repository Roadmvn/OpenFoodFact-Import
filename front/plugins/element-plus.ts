import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

export default defineNuxtPlugin((nuxtApp : any) => {
    nuxtApp.vueApp.use(ElementPlus)
})
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './components/**/*.{vue,js}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
        './plugins/**/*.{js,ts}', // 扫描项目的这些文件以生成相应样式
    ],
    theme: {
        extend: {}
    },
    plugins: []
}
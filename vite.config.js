import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    define: {
        'process.env': {},
    },
    plugins: [vue()],
    build: {
        target: 'esnext',
    },
    optimizeDeps: {
        include: ['monaco-editor']
    },
})
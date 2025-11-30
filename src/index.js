import * as vue from 'vue'
import * as pinia from 'pinia'
import App from './App.vue'

const { createApp } = vue
const { createPinia } = pinia

const piniaInstance = createPinia()

const app = createApp(App)
app.use(piniaInstance)

export { app }

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/lcars.css'
import { analytics } from './plugins/analytics'

const app = createApp(App)
app.use(router)
app.use(analytics)
app.mount('#app')

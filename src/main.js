import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia()); // 使用 Pinia
app.mount('#app');


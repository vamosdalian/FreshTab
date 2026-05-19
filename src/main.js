import { createApp, watch } from 'vue'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia';
import { useSettingsStore } from './stores/settingsStore';
import { createAppI18n, setI18nInstance, setI18nLocale } from './i18n';

const pinia = createPinia();

async function bootstrap() {
  const app = createApp(App);
  app.use(pinia);

  const settingsStore = useSettingsStore(pinia);
  await settingsStore.initialize();

  const i18n = createAppI18n(settingsStore.settings.uiLocale);
  setI18nInstance(i18n);
  app.use(i18n);

  watch(
    () => settingsStore.settings.uiLocale,
    (locale) => {
      setI18nLocale(locale);
    },
    { immediate: true }
  );

  app.mount('#app');
}

bootstrap();

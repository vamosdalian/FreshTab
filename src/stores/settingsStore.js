import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as configManager from '../services/configManager.js';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({});

  async function initialize() {
    settings.value = await configManager.getConfig();
    console.log('Pinia: Settings initialized.', settings.value);

    configManager.onConfigChange((changedItems) => {
      console.log('Pinia: Detected storage changes from background.', changedItems);
      settings.value = changedItems;
    });
  }

  async function updateSettings(newPartialSettings) {
    settings.value = { ...settings.value, ...newPartialSettings };
    await configManager.setConfig(settings.value);
    console.log('Pinia: Settings persisted to chrome.storage.',settings.value);
  }

  return {
    settings,
    initialize,
    updateSettings,
  };
});

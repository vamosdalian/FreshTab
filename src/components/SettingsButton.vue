<template>
  <button @click="$emit('openSettings')" class="settings-button" :title="t('settingsButton.title')">
    <Settings :size="20" :stroke-width="2.2" />
  </button>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { Settings } from 'lucide-vue-next'

export default {
  name: 'SettingsButton',
  emits: ['openSettings'],
  components: {
    Settings
  },
  setup() {
    const { t } = useI18n()

    return {
      t
    }
  }
}
</script>

<style scoped>
.settings-button {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--button-bg, rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-button:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.25));
  transform: rotate(45deg) scale(1.05);
  box-shadow: 0 4px 20px var(--card-shadow, rgba(0, 0, 0, 0.2));
}

@media (max-width: 768px) {
  .settings-button {
    bottom: 1rem;
    left: 1rem;
    width: 44px;
    height: 44px;
  }
}

:global([data-theme="dark"]) .settings-button {
  color: #e0e0e0;
}
</style>

<template>
  <button @click="toggleTheme" class="theme-toggle-button" :title="themeTooltip">
    <Sun v-if="settingsStore.settings.isDarkMode" :size="20" :stroke-width="2.2" />
    <Moon v-else :size="20" :stroke-width="2.2" />
  </button>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settingsStore'
import { Moon, Sun } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const { t } = useI18n()

const themeMode = computed(() => settingsStore.settings.theme || 'auto')
const themeTooltip = computed(() => settingsStore.settings.isDarkMode ? t('themeToggle.toLight') : t('themeToggle.toDark'))

const toggleTheme = async () => {
  const currentIsDark = settingsStore.settings.isDarkMode
  if (currentIsDark) {
    settingsStore.updateSettings({ theme: 'light', isDarkMode: false })
  } else {
    settingsStore.updateSettings({ theme: 'dark', isDarkMode: true })
  }
}

const setDocumentTheme = (theme) => {
  document.documentElement.setAttribute('data-theme',theme)
}

watch(() => settingsStore.settings.isDarkMode, (value) => {
  console.log('Theme changed:', value ? 'dark' : 'light')
  setDocumentTheme(value ? 'dark' : 'light')
}, { immediate: true })

const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
darkModeQuery.addEventListener('change', (e) => {
  if (themeMode.value === 'auto') {
    settingsStore.updateSettings({ isDarkMode: e.matches })
  }
})
</script>

<style scoped>
.theme-toggle-button {
  position: fixed;
  bottom: 6rem; /* 在设置按钮上方 */
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
  z-index: 99;
  overflow: hidden;
}

.theme-toggle-button:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.25));
  transform: scale(1.05);
  box-shadow: 0 4px 20px var(--card-shadow, rgba(0, 0, 0, 0.2));
}

.theme-toggle-button:active {
  transform: scale(0.95);
}

/* 图标动画 */
.theme-toggle-button svg {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-button:hover svg {
  transform: rotate(20deg);
}

/* 深色模式时的太阳图标特殊动画 */
.theme-toggle-button:hover svg:first-child {
  transform: rotate(90deg) scale(1.1);
}

/* 浅色模式时的月亮图标特殊动画 */
.theme-toggle-button:hover svg:last-child {
  transform: rotate(-20deg) scale(1.1);
}

/* 添加一个微妙的发光效果 */
.theme-toggle-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(45deg, 
    var(--text-color, rgba(255, 255, 255, 0.3)), 
    transparent, 
    var(--text-color, rgba(255, 255, 255, 0.3))
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.theme-toggle-button:hover::before {
  opacity: 1;
}

:global([data-theme="dark"]) .theme-toggle-button {
  color: #e0e0e0;
}
</style>

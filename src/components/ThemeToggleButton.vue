<template>
  <button @click="toggleTheme" class="theme-toggle-button" :title="themeTooltip">
    <svg v-if="settingsStore.settings.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <!-- 太阳图标 (浅色模式) -->
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <!-- 月亮图标 (深色模式) -->
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()

const themeMode = computed(() => settingsStore.settings.theme || 'auto')
const themeTooltip = computed(() =>  settingsStore.settings.isDarkMode ? '切换到浅色模式' : '切换到深色模式')

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

watch(settingsStore.settings.isDarkMode, (value) => {
  console.log('Theme changed:', value ? 'dark' : 'light')
  setDocumentTheme(value ? 'dark' : 'light')
})

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

onMounted(() => {
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
  color: var(--text-color, white);
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
</style>

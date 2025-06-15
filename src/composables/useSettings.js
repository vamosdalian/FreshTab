import { reactive, onMounted, watch } from 'vue'

export function useSettings() {
  const settings = reactive({
    columnsPerRow: 6,
    bookmarkSize: 'medium',
    searchEngine: 'google',
    showTime: true,
    showSearch: true,
    showBookmarks: true,
    theme: 'auto', // 'light', 'dark', 'auto'
    isDarkMode: false
  })

  // 检测系统主题偏好
  const detectSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 更新主题
  const updateTheme = () => {
    if (settings.theme === 'auto') {
      settings.isDarkMode = detectSystemTheme()
    } else {
      settings.isDarkMode = settings.theme === 'dark'
    }
    
    // 应用主题到文档
    document.documentElement.setAttribute('data-theme', settings.isDarkMode ? 'dark' : 'light')
  }

  // 监听系统主题变化
  const setupThemeListener = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = () => {
        if (settings.theme === 'auto') {
          updateTheme()
        }
      }
      
      // 监听主题变化
      mediaQuery.addEventListener('change', handleThemeChange)
      
      // 返回清理函数
      return () => mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }

  // 加载设置
  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get(['settings'])
      Object.assign(settings, result.settings || {})
    } catch (error) {
      console.log('使用默认设置')
      const savedSettings = localStorage.getItem('freshtab-settings')
      if (savedSettings) {
        Object.assign(settings, JSON.parse(savedSettings))
      }
    }
    
    // 加载完设置后更新主题
    updateTheme()
  }

  // 保存设置
  const saveSettings = async (newSettings) => {
    Object.assign(settings, newSettings)
    
    try {
      await chrome.storage.sync.set({ settings })
    } catch (error) {
      console.log('无法保存到Chrome存储，使用localStorage')
      localStorage.setItem('freshtab-settings', JSON.stringify(settings))
    }
    
    // 保存后更新主题
    updateTheme()
  }

  onMounted(() => {
    loadSettings()
    
    // 设置主题监听器
    setupThemeListener()
    
    // 监听主题设置变化
    watch(() => settings.theme, updateTheme)
  })

  return {
    settings,
    saveSettings,
    updateTheme
  }
}

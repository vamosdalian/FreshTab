import { reactive, onMounted, watch } from 'vue'
import { useToast } from './useToast'

export function useSettings() {
  const { error, warning, log } = useToast()
  
  // 当前数据版本
  const CURRENT_VERSION = '1'
  
  // 检测系统主题偏好
  const detectSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // 获取默认设置
  const getDefaultSettings = () => ({
    version: CURRENT_VERSION,
    lastModified: new Date().toISOString(),
    columnsPerRow: 6,
    bookmarkSize: 'medium',
    searchEngine: 'chrome-default',
    showTime: true,
    showSearch: true,
    showBookmarks: true,
    theme: 'auto',
    isDarkMode: detectSystemTheme(),
    timeFormat: '24h',
    showDate: true,
    showSeconds: false,
    displayWidth: 800
  })

  const settings = reactive(getDefaultSettings())

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
      const loadedData = result.settings || getDefaultSettings()
      
      // 数据版本迁移
      if (!loadedData.version || loadedData.version !== CURRENT_VERSION) {
        log(`设置数据从 ${loadedData.version || '旧版本'} 迁移到 ${CURRENT_VERSION}`)
        const migratedData = { ...getDefaultSettings(), ...loadedData }
        migratedData.version = CURRENT_VERSION
        migratedData.lastModified = new Date().toISOString()
        Object.assign(settings, migratedData)
        await saveSettings()
      } else {
        Object.assign(settings, loadedData)
      }
    } catch (chromeError) {
      error('Chrome存储不可用，加载设置失败')
      throw chromeError
    }
    
    updateTheme()
  }

  // 保存设置
  const saveSettings = async (newSettings = null) => {
    if (newSettings) {
      Object.assign(settings, newSettings)
    }
    
    try {
      const dataToSave = {
        ...settings,
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString()
      }
      await chrome.storage.sync.set({ settings: dataToSave })
      log('设置已保存')
    } catch (chromeError) {
      error('Chrome存储不可用，保存设置失败')
      throw chromeError
    }
    
    updateTheme()
  }

  onMounted(() => {
    loadSettings()
    
    // 设置主题监听器
    setupThemeListener()
    
    // 监听主题设置变化
    watch(() => settings.theme, updateTheme)
  })

  // 重置设置到默认值
  const resetSettings = async () => {
    const defaultSettings = getDefaultSettings()
    Object.assign(settings, defaultSettings)
    
    try {
      await chrome.storage.sync.set({ settings: defaultSettings })
      log('设置已重置为默认值')
    } catch (chromeError) {
      error('Chrome存储不可用，重置设置失败')
      throw chromeError
    }
    
    updateTheme()
  }

  return {
    settings,
    saveSettings,
    updateTheme,
    resetSettings
  }
}

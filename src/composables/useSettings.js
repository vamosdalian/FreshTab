import { reactive, onMounted } from 'vue'

export function useSettings() {
  const settings = reactive({
    columnsPerRow: 6,
    bookmarkSize: 'medium',
    searchEngine: 'google',
    showTime: true
  })

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
  }

  onMounted(() => {
    loadSettings()
  })

  return {
    settings,
    saveSettings
  }
}

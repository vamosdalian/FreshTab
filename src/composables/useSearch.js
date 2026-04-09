import { ref, computed } from 'vue'
import { hasChromeSearch, runChromeSearch } from '../services/browserStorage.js'

export function useSearch(settings, saveSettings) {
  const searchQuery = ref('')
  const searchEngines = ref([
    { 
      id: 'chrome-default', 
      name: '默认搜索引擎', 
      url: null, // 特殊标识，使用Chrome API
      icon: '',
      fallbackIcon: '🔍'
    },
    { 
      id: 'google', 
      name: 'Google', 
      url: 'https://www.google.com/search?q=', 
      icon: '/icons/google.png',
      fallbackIcon: '🔍'
    },
    { 
      id: 'bing', 
      name: 'Bing', 
      url: 'https://www.bing.com/search?q=', 
      icon: '/icons/bing.png',
      fallbackIcon: '🅱️'
    },
    { 
      id: 'baidu', 
      name: '百度', 
      url: 'https://www.baidu.com/s?wd=', 
      icon: '/icons/baidu.png',
      fallbackIcon: '🟦'
    },
    { 
      id: 'duckduckgo', 
      name: 'DuckDuckGo', 
      url: 'https://duckduckgo.com/?q=', 
      icon: '/icons/duckduckgo.png',
      fallbackIcon: '🦆'
    },
    { 
      id: 'yahoo', 
      name: 'Yahoo', 
      url: 'https://search.yahoo.com/search?p=', 
      icon: '/icons/yahoo.png',
      fallbackIcon: '🟣'
    }
  ])

  const currentEngine = computed(() => {
    return searchEngines.value.find(engine => engine.id === settings.searchEngine) || searchEngines.value[0]
  })

  // 判断是否是URL
  const isURL = (string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`)
      return string.includes('.')
    } catch {
      return false
    }
  }

  // 执行搜索
  const performSearch = async (query = searchQuery.value) => {
    if (!query.trim()) return
    
    // 检查是否是URL
    if (isURL(query)) {
      // 如果是URL，直接打开
      window.location.href = query.startsWith('http') ? query : `https://${query}`
      return
    }

    // 检查是否使用Chrome默认搜索引擎
    if (currentEngine.value.id === 'chrome-default') {
      try {
        // 使用Chrome搜索API
        if (hasChromeSearch()) {
          await runChromeSearch({
            text: query,
            disposition: 'CURRENT_TAB'
          })
        } else {
          // 如果Chrome API不可用，回退到Google搜索
          window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        }
      } catch (error) {
        console.warn('Chrome search API failed, falling back to Google:', error)
        // 回退到Google搜索
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`
      }
    } else {
      // 使用指定的搜索引擎
      const searchURL = currentEngine.value.url + encodeURIComponent(query)
      window.location.href = searchURL
    }
  }

  // 设置搜索引擎
  const setSearchEngine = async (engine) => {
    if (settings && settings.searchEngine !== undefined) {
      settings.searchEngine = engine.id
      // 保存到Chrome存储
      if (saveSettings) {
        await saveSettings({ searchEngine: engine.id })
      }
    }
  }

  return {
    searchQuery,
    searchEngines,
    currentEngine,
    performSearch,
    setSearchEngine
  }
}

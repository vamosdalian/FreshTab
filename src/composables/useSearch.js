import { ref, computed } from 'vue'

export function useSearch(settings) {
  const searchQuery = ref('')
  const searchEngines = ref([
    { 
      id: 'google', 
      name: 'Google', 
      url: 'https://www.google.com/search?q=', 
      icon: 'https://www.google.com/favicon.ico',
      fallbackIcon: '🔍'
    },
    { 
      id: 'bing', 
      name: 'Bing', 
      url: 'https://www.bing.com/search?q=', 
      icon: 'https://www.bing.com/favicon.ico',
      fallbackIcon: '🅱️'
    },
    { 
      id: 'baidu', 
      name: '百度', 
      url: 'https://www.baidu.com/s?wd=', 
      icon: 'https://www.baidu.com/favicon.ico',
      fallbackIcon: '🟦'
    },
    { 
      id: 'duckduckgo', 
      name: 'DuckDuckGo', 
      url: 'https://duckduckgo.com/?q=', 
      icon: 'https://duckduckgo.com/favicon.ico',
      fallbackIcon: '🦆'
    },
    { 
      id: 'yahoo', 
      name: 'Yahoo', 
      url: 'https://search.yahoo.com/search?p=', 
      icon: 'https://search.yahoo.com/favicon.ico',
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
  const performSearch = (query = searchQuery.value) => {
    if (!query.trim()) return
    
    // 检查是否是URL
    if (isURL(query)) {
      // 如果是URL，直接打开
      window.location.href = query.startsWith('http') ? query : `https://${query}`
    } else {
      // 否则使用搜索引擎搜索
      const searchURL = currentEngine.value.url + encodeURIComponent(query)
      window.location.href = searchURL
    }
  }

  // 设置搜索引擎
  const setSearchEngine = (engine) => {
    if (settings && settings.value) {
      settings.value.searchEngine = engine.id
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

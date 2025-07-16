<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-box">
        <!-- 搜索引擎图标按钮 -->
        <button @click="toggleEngineDropdown" class="engine-icon-btn" ref="engineBtn">
          <img v-if="!iconError" :src="currentEngine.icon" :alt="currentEngine.name" class="engine-icon"
            @error="handleIconError" />
          <span v-else class="engine-icon-fallback">{{ currentEngine.fallbackIcon }}</span>
          <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>

        <!-- 搜索输入框 -->
        <input :value="searchQuery" @keydown="handleKeydown" @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd" type="text" placeholder="搜索或输入网址..." class="search-input"
          ref="searchInput" />

        <!-- 搜索按钮 -->
        <button @click="handleSearch" class="search-button">
          <img src="/icons/search-icon.svg" alt="搜索" class="search-icon" />
        </button>
      </div>

      <!-- 搜索引擎下拉菜单 -->
      <div v-if="showEngineDropdown" class="engine-dropdown" ref="dropdown">
        <div v-for="engine in searchEngines" :key="engine.id" @click="selectSearchEngine(engine)"
          :class="['engine-option', { active: currentEngine.id === engine.id }]">
          <img :src="engine.icon" :alt="engine.name" class="engine-option-icon"
            @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block' }" />
          <span class="engine-option-fallback" style="display: none;">{{ engine.fallbackIcon }}</span>
          <span class="engine-option-name">{{ engine.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSettingsStore } from '../stores/settingsStore';

const settingsStore = useSettingsStore();
const searchQuery = ref('')
const isComposing = ref(false)
const showEngineDropdown = ref(false)
const iconError = ref(false)
const engineBtn = ref(null)
const dropdown = ref(null)
const currentEngine = computed(() => searchEngines.value.find(engine => engine.id === settingsStore.settings.searchEngine) || searchEngines.value[0])

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

// URL检查函数
const isURL = (string) => {
  try {
    // 检查是否包含常见的URL模式
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    const ipPattern = /^(https?:\/\/)?((\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/
    
    return urlPattern.test(string) || ipPattern.test(string) || 
           string.includes('.') && !string.includes(' ')
  } catch (e) {
    return false
  }
}


const handleSearch = () => {
  performSearch(searchQuery.value)
}

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
      if (chrome && chrome.search && chrome.search.query) {
        await chrome.search.query({
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

const handleKeydown = (event) => {
  // 只有在不是输入法组合状态且按下回车键时才触发搜索
  if (event.key === 'Enter' && !isComposing.value) {
    event.preventDefault() // 防止表单提交或其他默认行为
    handleSearch()
  }
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (event) => {
  isComposing.value = false
  // 在某些浏览器中，compositionend 可能在 keydown 之后触发
  // 所以我们需要在下一个事件循环中重置状态
  setTimeout(() => {
    isComposing.value = false
  }, 0)
}

const setSearchEngine = (engine) => {
  console.log('Setting search engine to:', engine)
  currentEngine.value = engine
  settingsStore.updateSettings({ searchEngine: engine.id })
  iconError.value = false
}

const toggleEngineDropdown = () => {
  showEngineDropdown.value = !showEngineDropdown.value
}

const selectSearchEngine = async (engine) => {
  setSearchEngine(engine)
  showEngineDropdown.value = false
}

const handleIconError = () => {
  iconError.value = true
}

// 监听当前引擎变化，重置图标错误状态
const resetIconError = () => {
  iconError.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (engineBtn.value && dropdown.value &&
    !engineBtn.value.contains(event.target) &&
    !dropdown.value.contains(event.target)) {
    showEngineDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-section {
  margin-bottom: 3rem;
  position: relative;
}

.search-container {
  margin: 0 auto;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--input-bg, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border-radius: 50px 50px 50px 50px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  transition: all 0.3s ease;
  overflow: hidden;
  margin: 0 auto;
  width: fit-content;
}

/* 搜索引擎图标按钮 */
.engine-icon-btn {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.875rem 0.5rem 0.875rem 1rem;
  background: none;
  border: none;
  color: var(--text-color-light, rgba(255, 255, 255, 0.8));
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50px 0 0 50px;
  flex-shrink: 0;
  width: auto;
  overflow: hidden;
  position: relative;
}

.engine-icon-btn:hover {
  /* 悬停时向左展开 */
  color: var(--text-color, white);
  padding-left: 1.25rem;
  padding-right: 0.75rem;
  gap: 0.5rem;
}

.engine-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  object-fit: cover;
}

.engine-icon-fallback {
  font-size: 16px;
  display: block;
  line-height: 1;
}

.dropdown-arrow {
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  transform: translateX(10px);
  width: 0;
  margin-left: 0;
}

.engine-icon-btn:hover .dropdown-arrow {
  opacity: 1;
  transform: translateX(0) scale(1.05);
  width: 12px;
  margin-left: 0.25rem;
}

/* 搜索输入框 */
.search-input {
  width: 500px;
  padding: 1rem 4rem 1rem 1rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-color, white);
  outline: none;
  height: 100%;
  position: relative;
  transition: color 0.3s ease;
}

.search-input::placeholder {
  color: var(--text-color-light, rgba(255, 255, 255, 0.6));
  transition: color 0.3s ease;
}

/* 搜索按钮 */
.search-button {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-color-light, rgba(255, 255, 255, 0.7));
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  transform: scale(1.05);
}

.search-icon {
  width: 20px;
  height: 20px;
  filter: var(--icon-filter, brightness(0) invert(0.5));
  opacity: 0.7;
  transition: all 0.3s ease;
}

.search-button:hover .search-icon {
  opacity: 1;
  transform: scale(1.1);
}

/* 搜索引擎下拉菜单 */
.engine-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 200px;
  width: 200px;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--card-shadow, rgba(0, 0, 0, 0.2));
  z-index: 1000;
  overflow: hidden;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  transition: background 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color, rgba(0, 0, 0, 0.8));
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
}

.engine-option:last-child {
  border-bottom: none;
}

.engine-option:hover {
  background: var(--button-hover-bg, rgba(0, 0, 0, 0.08));
  color: var(--text-color, rgba(0, 0, 0, 0.9));
}

.engine-option.active {
  background: var(--button-bg, rgba(0, 0, 0, 0.05));
  color: var(--text-color, rgba(0, 0, 0, 0.9));
  font-weight: 500;
}

.engine-option-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  object-fit: cover;
}

.engine-option-fallback {
  font-size: 16px;
  width: 18px;
  text-align: center;
  line-height: 1;
}

.engine-option-name {
  font-weight: 500;
}

@media (max-width: 768px) {
  .search-container {
    width: 95%;
  }

  .search-box {
    border-radius: 40px 25px 25px 40px;
  }

  .search-input {
    width: calc(100% - 7rem);
    font-size: 0.9rem;
    padding: 0.875rem 3.5rem 0.875rem 0.875rem;
  }

  .engine-icon-btn {
    padding: 0.875rem 0.375rem 0.875rem 0.625rem;
    gap: 0;
    border-radius: 40px 0 0 40px;
  }

  .engine-icon-btn:hover {
    padding-left: 0.75rem;
    padding-right: 0.5rem;
    gap: 0.25rem;
  }

  .engine-icon,
  .engine-option-icon {
    width: 16px;
    height: 16px;
  }

  .engine-icon-fallback,
  .engine-option-fallback {
    font-size: 14px;
    width: 16px;
  }

  .search-button {
    right: 0.5rem;
    padding: 0.625rem;
  }

  .dropdown-arrow {
    width: 10px;
    height: 10px;
  }
}
</style>

<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-box">
        <!-- 搜索引擎图标按钮 -->
        <button @click="toggleEngineDropdown" class="engine-icon-btn" ref="engineBtn">
          <img 
            v-if="!iconError"
            :src="currentEngine.icon" 
            :alt="currentEngine.name"
            class="engine-icon"
            @error="handleIconError"
          />
          <span v-else class="engine-icon-fallback">{{ currentEngine.fallbackIcon }}</span>
          <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        
        <!-- 搜索输入框 -->
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索或输入网址..."
          class="search-input"
          ref="searchInput"
        />
        
        <!-- 搜索按钮 -->
        <button @click="handleSearch" class="search-button">
          <img src="/icons/search-icon.svg" alt="搜索" class="search-icon" />
        </button>
      </div>
      
      <!-- 搜索引擎下拉菜单 -->
      <div v-if="showEngineDropdown" class="engine-dropdown" ref="dropdown">
        <div
          v-for="engine in searchEngines"
          :key="engine.id"
          @click="selectSearchEngine(engine)"
          :class="['engine-option', { active: currentEngine.id === engine.id }]"
        >
          <img 
            :src="engine.icon" 
            :alt="engine.name"
            class="engine-option-icon"
            @error="(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block' }"
          />
          <span class="engine-option-fallback" style="display: none;">{{ engine.fallbackIcon }}</span>
          <span class="engine-option-name">{{ engine.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SearchSection',
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    searchEngines: {
      type: Array,
      required: true
    },
    currentEngine: {
      type: Object,
      required: true
    }
  },
  emits: ['update:searchQuery', 'search', 'setEngine'],
  setup(props, { emit }) {
    const showEngineDropdown = ref(false)
    const iconError = ref(false)
    const engineBtn = ref(null)
    const dropdown = ref(null)

    const handleSearch = () => {
      emit('search')
    }

    const setSearchEngine = (engine) => {
      emit('setEngine', engine)
      // 重置图标错误状态
      iconError.value = false
    }

    const toggleEngineDropdown = () => {
      showEngineDropdown.value = !showEngineDropdown.value
    }

    const selectSearchEngine = (engine) => {
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

    return {
      showEngineDropdown,
      iconError,
      engineBtn,
      dropdown,
      handleSearch,
      setSearchEngine,
      toggleEngineDropdown,
      selectSearchEngine,
      handleIconError,
      resetIconError
    }
  }
}
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50px 50px 50px 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  padding: 0.875rem 0.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
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
  color: white;
  padding-left: 0.75rem;
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
  color: white;
  outline: none;
  height: 100%;
  position: relative;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* 重要：覆盖全局样式，防止聚焦时的颜色变化 */
.search-input:focus {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 搜索按钮 */
.search-button {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.05);
}

.search-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
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
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.engine-option:last-child {
  border-bottom: none;
}

.engine-option:hover {
  background: rgba(255, 255, 255, 0.4);
  color: rgba(0, 0, 0, 0.9);
}

.engine-option.active {
  background: rgba(255, 255, 255, 0.5);
  color: rgba(0, 0, 0, 0.9);
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
    padding: 0.875rem 0.375rem;
    gap: 0;
    border-radius: 40px 0 0 40px;
  }
  
  .engine-icon-btn:hover {
    padding-left: 0.5rem;
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

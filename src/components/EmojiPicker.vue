<template>
  <div class="emoji-picker">
    <!-- Emoji搜索框 -->
    <div class="emoji-search">
      <input
        v-model="emojiSearchQuery"
        type="text"
        placeholder="搜索emoji..."
        class="emoji-search-input"
        @input="onEmojiSearch"
      />
    </div>

    <!-- 智能推荐 -->
    <div v-if="smartRecommendations.length > 0" class="emoji-recommendations">
      <div class="recommendations-label">智能推荐</div>
      <div class="emoji-grid-small">
        <div 
          v-for="emoji in smartRecommendations" 
          :key="'rec-' + emoji"
          @click="selectEmoji(emoji)"
          :class="['emoji-item', { selected: selectedEmoji === emoji }]"
          :title="getEmojiName(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>

    <!-- 最近使用 -->
    <div v-if="recentEmojis.length > 0" class="emoji-recent">
      <div class="recent-label">最近使用</div>
      <div class="emoji-grid-small">
        <div 
          v-for="emoji in recentEmojis" 
          :key="'recent-' + emoji"
          @click="selectEmoji(emoji)"
          :class="['emoji-item', { selected: selectedEmoji === emoji }]"
          :title="getEmojiName(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>

    <!-- Emoji分类标签 -->
    <div class="emoji-categories">
      <button
        v-for="(emojis, category) in displayEmojiCategories"
        :key="category"
        @click="selectedEmojiCategory = category"
        :class="['category-btn', { active: selectedEmojiCategory === category }]"
        type="button"
      >
        {{ category }}
      </button>
    </div>

    <!-- Emoji网格 -->
    <div class="emoji-grid">
      <div 
        v-for="emoji in displayEmojis" 
        :key="emoji"
        @click="selectEmoji(emoji)"
        :class="['emoji-item', { selected: selectedEmoji === emoji }]"
        :title="getEmojiName(emoji)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, defineExpose } from 'vue'
import { emojiLibrary, enhancedEmojiUtils } from '../utils/emojiLibrary'

export default {
  name: 'EmojiPicker',
  props: {
    selectedEmoji: {
      type: String,
      default: ''
    },
    showSmartRecommendations: {
      type: Boolean,
      default: false
    },
    siteName: {
      type: String,
      default: ''
    },
    siteUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['select-emoji'],
  setup(props, { emit }) {
    // 响应式数据
    const emojiSearchQuery = ref('')
    const searchResults = ref([])
    const recentEmojis = ref([])
    const smartRecommendations = ref([])
    
    // 获取emoji分类数据
    const emojiCategories = computed(() => {
      return enhancedEmojiUtils.getCategorizedEmojis()
    })
    
    // 动态设置初始分类
    const selectedEmojiCategory = ref('')
    
    // 初始化选择的分类
    watch(emojiCategories, (categories) => {
      if (categories && Object.keys(categories).length > 0) {
        const availableCategories = Object.keys(categories)
        if (!selectedEmojiCategory.value || !availableCategories.includes(selectedEmojiCategory.value)) {
          selectedEmojiCategory.value = availableCategories[0]
        }
      }
    }, { immediate: true })
    
    // 根据搜索和分类显示的emoji
    const displayEmojiCategories = computed(() => {
      if (emojiSearchQuery.value) {
        return { '搜索结果': searchResults.value }
      }
      return emojiCategories.value
    })
    
    const displayEmojis = computed(() => {
      if (emojiSearchQuery.value) {
        return searchResults.value
      }
      return emojiCategories.value[selectedEmojiCategory.value] || []
    })
    
    // 监听props变化，更新智能推荐
    watch([() => props.siteName, () => props.siteUrl], ([name, url]) => {
      if (props.showSmartRecommendations && (name || url)) {
        smartRecommendations.value = enhancedEmojiUtils.getSmartRecommendations(name, url)
      } else {
        smartRecommendations.value = []
      }
    }, { immediate: true })
    
    // 加载最近使用的emoji
    const loadRecentEmojis = () => {
      recentEmojis.value = enhancedEmojiUtils.getRecentEmojis()
    }
    
    // emoji搜索处理
    const onEmojiSearch = () => {
      if (emojiSearchQuery.value.trim()) {
        searchResults.value = enhancedEmojiUtils.searchEmojis(emojiSearchQuery.value.trim())
      } else {
        searchResults.value = []
      }
    }
    
    // 选择emoji
    const selectEmoji = (emoji) => {
      // 保存到最近使用
      enhancedEmojiUtils.saveRecentEmoji(emoji)
      loadRecentEmojis()
      // 触发事件
      emit('select-emoji', emoji)
    }
    
    // 获取emoji名称
    const getEmojiName = (emoji) => {
      return emojiLibrary.getEmojiName ? emojiLibrary.getEmojiName(emoji) : emoji
    }
    
    // 重置状态
    const reset = () => {
      emojiSearchQuery.value = ''
      searchResults.value = []
      const categories = Object.keys(emojiCategories.value)
      if (categories.length > 0) {
        selectedEmojiCategory.value = categories[0]
      }
    }
    
    // 初始化
    onMounted(() => {
      loadRecentEmojis()
    })
    
    // 暴露方法给父组件
    defineExpose({
      reset,
      loadRecentEmojis
    })
    
    return {
      emojiSearchQuery,
      selectedEmojiCategory,
      displayEmojiCategories,
      displayEmojis,
      recentEmojis,
      smartRecommendations,
      onEmojiSearch,
      selectEmoji,
      getEmojiName,
      loadRecentEmojis,
      reset
    }
  }
}
</script>

<style scoped>
.emoji-picker {
  width: 100%;
}

/* Emoji搜索框 */
.emoji-search {
  margin-bottom: 16px;
}

.emoji-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  background: var(--input-bg, white);
  color: var(--text-color, #495057);
  box-sizing: border-box;
}

.emoji-search-input:focus {
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.emoji-search-input::placeholder {
  color: var(--placeholder-color, #6c757d);
}

/* 智能推荐 */
.emoji-recommendations {
  margin-bottom: 16px;
}

.recommendations-label {
  font-size: 12px;
  color: var(--text-secondary, #6c757d);
  margin-bottom: 8px;
  font-weight: 500;
}

/* 最近使用 */
.emoji-recent {
  margin-bottom: 16px;
}

.recent-label {
  font-size: 12px;
  color: var(--text-secondary, #6c757d);
  margin-bottom: 8px;
  font-weight: 500;
}

.emoji-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 4px;
  max-height: 80px;
  overflow-y: auto;
}

.emoji-grid-small .emoji-item {
  width: 32px;
  height: 32px;
  font-size: 16px;
  min-width: 32px;
}

/* 分类标签 */
.emoji-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 4px 8px;
  background: var(--button-bg, #f8f9fa);
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 4px;
  color: var(--text-color, #495057);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: var(--button-hover-bg, #e9ecef);
}

.category-btn.active {
  background: var(--primary-color, #007bff);
  border-color: var(--primary-color, #007bff);
  color: white;
}

/* Emoji网格 */
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--grid-bg, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--border-color, #dee2e6);
}

.emoji-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  font-size: 16px;
  background: var(--item-bg, white);
}

.emoji-item:hover {
  background: var(--item-hover-bg, #e9ecef);
  transform: scale(1.1);
}

.emoji-item.selected {
  border-color: var(--primary-color, #007bff);
  background: var(--item-selected-bg, rgba(0, 123, 255, 0.1));
}

/* 自定义滚动条 */
.emoji-grid::-webkit-scrollbar,
.emoji-grid-small::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track,
.emoji-grid-small::-webkit-scrollbar-track {
  background: var(--scrollbar-track, #f1f1f1);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb,
.emoji-grid-small::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, #c1c1c1);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover,
.emoji-grid-small::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, #a8a8a8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji-categories {
    justify-content: center;
  }
  
  .category-btn {
    font-size: 11px;
    padding: 3px 6px;
  }
}
</style>

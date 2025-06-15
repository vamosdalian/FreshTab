<template>
  <div class="container">
    <!-- 背景装饰 -->
    <div class="background-gradient"></div>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 时间显示组件 -->
      <TimeSection 
        v-if="settings.showTime" 
        :currentTime="currentTime" 
        :greeting="greeting"
        :timeFormat="settings.timeFormat"
        :showDate="settings.showDate"
        :showSeconds="settings.showSeconds"
      />

      <!-- 搜索框组件 -->
      <SearchSection 
        v-if="settings.showSearch"
        v-model:searchQuery="searchQuery"
        :currentEngine="currentEngine"
        :searchEngines="searchEngines"
        @search="performSearch"
        @setEngine="setSearchEngine"
      />

      <!-- 快捷书签组件 -->
      <BookmarksSection 
        v-if="settings.showBookmarks"
        :bookmarks="bookmarkGroups[0]?.bookmarks || []"
        @openBookmark="(url) => window.open(url, '_self')"
        @deleteBookmark="deleteBookmark"
        @openAddModal="showAddBookmarkModal"
      />
    </main>

    <!-- 设置按钮 -->
    <SettingsButton @openSettings="showSettingsModal = true" />
    
    <!-- 主题切换按钮 -->
    <ThemeToggleButton :settings="settings" :updateTheme="updateTheme" />
    
    <!-- 快速访问栏 -->
    <!-- <QuickAccessBar /> -->
    
    <!-- 设置模态框 -->
    <Transition name="modal">
      <SettingsModal 
        v-if="showSettingsModal"
        :isOpen="showSettingsModal"
        :settings="settings"
        @close="showSettingsModal = false"
        @updateSetting="(key, value) => { settings[key] = value; saveSettings(); updateTheme() }"
        @resetSettings="resetSettings"
      />
    </Transition>

    <!-- 添加书签模态框 -->
    <Transition name="modal">
      <BookmarkModal 
        v-if="showBookmarkModal"
        :isOpen="showBookmarkModal"
        @close="showBookmarkModal = false"
        @save="(bookmark) => { addBookmarkToGroup(bookmark); showBookmarkModal = false }"
      />
    </Transition>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import TimeSection from './components/TimeSection.vue'
import SearchSection from './components/SearchSection.vue'
import BookmarksSection from './components/BookmarksSection.vue'
import SettingsButton from './components/SettingsButton.vue'
import ThemeToggleButton from './components/ThemeToggleButton.vue'
import SettingsModal from './components/SettingsModal.vue'
import BookmarkModal from './components/BookmarkModal.vue'

import { useBookmarks } from './composables/useBookmarks'
import { useSettings } from './composables/useSettings'
import { useTime } from './composables/useTime'
import { useSearch } from './composables/useSearch'

export default {
  name: 'App',
  components: {
    TimeSection,
    SearchSection,
    BookmarksSection,
    SettingsButton,
    ThemeToggleButton,
    SettingsModal,
    BookmarkModal
  },
  setup() {
    // 使用组合式函数
    const { bookmarkGroups, addBookmarkToGroup, deleteBookmark, saveBookmarkGroups } = useBookmarks()
    const { settings, saveSettings, updateTheme, resetSettings } = useSettings()
    const { currentTime, greeting } = useTime()
    const { searchQuery, searchEngines, currentEngine, performSearch, setSearchEngine } = useSearch(settings, saveSettings)

    // 模态框状态
    const showSettingsModal = ref(false)
    const showBookmarkModal = ref(false)
    const currentEditingGroup = ref(null)

    // 键盘事件处理
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        if (showSettingsModal.value) {
          showSettingsModal.value = false
        } else if (showBookmarkModal.value) {
          showBookmarkModal.value = false
        }
      }
    }

    // 显示添加书签模态框
    const showAddBookmarkModal = (groupId) => {
      currentEditingGroup.value = groupId
      showBookmarkModal.value = true
    }

    // 更新书签分组
    const updateBookmarkGroups = (newGroups) => {
      bookmarkGroups.value = newGroups
      saveBookmarkGroups()
    }

    // 生命周期
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return {
      // 数据
      bookmarkGroups,
      settings,
      currentTime,
      greeting,
      searchQuery,
      searchEngines,
      currentEngine,
      showSettingsModal,
      showBookmarkModal,
      currentEditingGroup,
      
      // 方法
      performSearch,
      setSearchEngine,
      addBookmarkToGroup,
      deleteBookmark,
      saveSettings,
      showAddBookmarkModal,
      updateBookmarkGroups,
      resetSettings
    }
  }
}
</script>

<style>
/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>

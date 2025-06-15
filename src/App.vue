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

      <!-- 天气信息 -->
      <WeatherSection />
    </main>

    <!-- 设置按钮 -->
    <SettingsButton @openSettings="showSettingsModal = true" />
    
    <!-- 设置模态框 -->
    <SettingsModal 
      :isOpen="showSettingsModal"
      :settings="settings"
      @close="showSettingsModal = false"
      @updateSetting="(key, value) => { settings[key] = value; saveSettings() }"
      @resetSettings="() => { /* TODO: implement reset */ }"
    />

    <!-- 添加书签模态框 -->
    <BookmarkModal 
      :isOpen="showBookmarkModal"
      @close="showBookmarkModal = false"
      @save="(bookmark) => { addBookmarkToGroup(bookmark); showBookmarkModal = false }"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import TimeSection from './components/TimeSection.vue'
import SearchSection from './components/SearchSection.vue'
import BookmarksSection from './components/BookmarksSection.vue'
import WeatherSection from './components/WeatherSection.vue'
import SettingsButton from './components/SettingsButton.vue'
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
    WeatherSection,
    SettingsButton,
    SettingsModal,
    BookmarkModal
  },
  setup() {
    // 使用组合式函数
    const { bookmarkGroups, addBookmarkToGroup, deleteBookmark, saveBookmarkGroups } = useBookmarks()
    const { settings, saveSettings } = useSettings()
    const { currentTime, greeting } = useTime()
    const { searchQuery, searchEngines, currentEngine, performSearch, setSearchEngine } = useSearch(settings, saveSettings)

    // 模态框状态
    const showSettingsModal = ref(false)
    const showBookmarkModal = ref(false)
    const currentEditingGroup = ref(null)

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
      updateBookmarkGroups
    }
  }
}
</script>

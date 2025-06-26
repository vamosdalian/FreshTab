<template>
  <div class="container">
    <!-- 背景装饰 -->
    <div 
      class="background-gradient" 
      :style="currentWallpaper ? { 
        background: `url(${currentWallpaper}) center/cover no-repeat`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}"
    ></div>
    
    <!-- 主要内容区域 -->
    <main class="main-content" :style="{ maxWidth: settings.displayWidth + 'px' }">
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

      <!-- 标签组件 -->
      <TagsSection 
        v-if="settings.showBookmarks"
        :tagGroups="tagGroups"
        :settings="settings"
        @addTag="showAddTagModal"
        @deleteTag="deleteTag"
        @openSettings="showSettingsModal = true"
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
        :wallpaperState="wallpaperState"
        @close="showSettingsModal = false"
        @updateSetting="handleSettingUpdate"
        @resetSettings="resetSettings"
      />
    </Transition>

    <!-- 添加标签模态框 -->
    <Transition name="modal">
      <TagModal 
        v-if="showTagModal"
        :isOpen="showTagModal"
        :tag="currentEditingTag"
        :themeColors="themeColors"
        @close="closeTagModal"
        @save="saveTag"
      />
    </Transition>

    <!-- 提示组件 -->
    <ToastContainer />
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import TimeSection from './components/TimeSection.vue'
import SearchSection from './components/SearchSection.vue'
import TagsSection from './components/TagsSection.vue'
import SettingsButton from './components/SettingsButton.vue'
import ThemeToggleButton from './components/ThemeToggleButton.vue'
import SettingsModal from './components/SettingsModal.vue'
import TagModal from './components/TagModal.vue'
import ToastContainer from './components/ToastContainer.vue'

import { useTagGroups } from './composables/useTagGroups'
import { useSettings } from './composables/useSettings'
import { useTime } from './composables/useTime'
import { useSearch } from './composables/useSearch'
import { useWallpaper } from './composables/useWallpaper'

export default {
  name: 'App',
  components: {
    TimeSection,
    SearchSection,
    TagsSection,
    SettingsButton,
    ThemeToggleButton,
    SettingsModal,
    TagModal,
    ToastContainer
  },
  setup() {
    // 使用组合式函数
    const { 
      tagGroups, 
      themeColors, 
      addTag, 
      editTag, 
      deleteTag,
      getTagEmojiRecommendations,
      searchEmojis,
      emojiLibrary
    } = useTagGroups()
    const { settings, isLoaded, saveSettings, updateTheme, resetSettings } = useSettings()
    const { currentTime, greeting } = useTime()
    const { searchQuery, searchEngines, currentEngine, performSearch, setSearchEngine } = useSearch(settings, saveSettings)
    const wallpaperState = useWallpaper()
    const { currentWallpaper } = wallpaperState

    // 模态框状态
    const showSettingsModal = ref(false)
    const showTagModal = ref(false)
    const currentEditingTag = ref(null)
    const currentGroupId = ref(null)

    // 键盘事件处理
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        if (showSettingsModal.value) {
          showSettingsModal.value = false
        } else if (showTagModal.value) {
          showTagModal.value = false
        }
      }
    }

    // 显示添加标签模态框
    const showAddTagModal = (groupId) => {
      currentGroupId.value = groupId
      currentEditingTag.value = null
      showTagModal.value = true
    }

    // 显示编辑标签模态框  
    const showEditTagModal = (groupId, tag) => {
      currentGroupId.value = groupId
      currentEditingTag.value = tag
      showTagModal.value = true
    }

    // 关闭标签模态框
    const closeTagModal = () => {
      showTagModal.value = false
      currentEditingTag.value = null
      currentGroupId.value = null
    }

    // 保存标签
    const saveTag = async (tagData) => {
      if (currentEditingTag.value) {
        await editTag(currentGroupId.value, currentEditingTag.value.id, tagData)
      } else {
        await addTag(currentGroupId.value, tagData)
      }
    }

    // 处理设置更新
    const handleSettingUpdate = (key, value) => {
      settings[key] = value
      saveSettings()
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
      tagGroups,
      themeColors,
      settings,
      currentTime,
      greeting,
      searchQuery,
      searchEngines,
      currentEngine,
      showSettingsModal,
      showTagModal,
      currentEditingTag,
      currentWallpaper,
      wallpaperState,
      
      // 方法
      performSearch,
      setSearchEngine,
      saveSettings,
      showAddTagModal,
      showEditTagModal,
      closeTagModal,
      saveTag,
      deleteTag,
      resetSettings,
      handleSettingUpdate
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

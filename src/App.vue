<template>
  <div class="container">
    <!-- 背景壁纸组件 -->
    <WallPaper />
    
    <!-- 主要内容区域 -->
    <main class="main-content" :style="{ maxWidth: displayWidth + 'px' }">
      <!-- 时间显示组件 -->
      <TimeSection 
        v-if="showTime" 
      />

      <!-- 搜索框组件 -->
      <SearchSection 
        v-if="showSearch"
      />

      <!-- 标签组件 -->
      <TagsSection 
        v-if="showBookmarks"
      />
    </main>

    <!-- 设置按钮 -->
    <SettingsButton @openSettings="showSettingsModal = true" />
    
    <!-- 主题切换按钮 -->
    <ThemeToggleButton />
    
    <!-- 设置模态框 -->
    <Transition name="modal">
      <SettingsModal 
        v-if="showSettingsModal"
        @close="showSettingsModal = false"
      />
    </Transition>

    <!-- 添加标签模态框 -->
    <!-- <Transition name="modal">
      <TagModal 
        v-if="showTagModal"
        :isOpen="showTagModal"
        :tag="currentEditingTag"
        :themeColors="themeColors"
        @close="closeTagModal"
        @save="saveTag"
      />
    </Transition> -->

    <!-- 提示组件 -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TimeSection from './components/TimeSection.vue'
import SearchSection from './components/SearchSection.vue'
import TagsSection from './components/TagsSection.vue'
import SettingsButton from './components/SettingsButton.vue'
import ThemeToggleButton from './components/ThemeToggleButton.vue'
import SettingsModal from './components/SettingsModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import WallPaper from './components/WallPaper.vue'


import { useSettingsStore } from './stores/settingsStore';
import { useTagGroupsStore } from './stores/tagGroupsStore'

const showSettingsModal = ref(false)
const showTagModal = ref(false)

const settingsStore = useSettingsStore();
const tagGroupsStore = useTagGroupsStore();

const showSearch = computed(() => settingsStore.settings.showSearch)
const displayWidth = computed(() => settingsStore.settings.displayWidth || 1200)
const showTime = computed(() => settingsStore.settings.showTime)
const showBookmarks = computed(() => settingsStore.settings.showBookmarks)

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    if (showSettingsModal.value) {
      showSettingsModal.value = false
    } else if (showTagModal.value) {
      showTagModal.value = false
    }
  }
}

// 生命周期
onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  await settingsStore.initialize()
  await tagGroupsStore.initialize()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
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

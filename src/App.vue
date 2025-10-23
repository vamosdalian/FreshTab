<template>
  <div class="container">
    <!-- 背景壁纸组件 -->
    <WallPaper />

    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
      <div class="container mx-auto px-4">
        <nav class="flex items-center justify-between h-20">
          <!-- Logo -->
          <a href="#" class="flex items-center space-x-2 text-2xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2-2 2 2"></path>
              <path d="M12 16V10"></path>
            </svg>
            <span>星际轨道</span>
          </a>
        </nav>
      </div>
    </header>
    
    <!-- Hero Section with Time -->
    <section v-if="showTime" class="relative min-h-screen flex items-end justify-center text-center overflow-hidden">
      <!-- Background Gradient Overlay -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute inset-x-0 bottom-0 h-1/2" style="background: linear-gradient(0deg, rgba(10, 10, 10, 1) 0%, rgba(10, 10, 10, 0.7) 30%, rgba(10, 10, 10, 0) 100%);"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 p-4 pb-24 md:pb-32 container mx-auto">
        <TimeSection />

        <!-- Mission Info (with Search) -->
        <div v-if="showSearch" class="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-gray-300 mb-10">
          <SearchSection />
        </div>
      </div>
    </section>

    <!-- No Hero Section - Just Search -->
    <section v-else-if="showSearch && !showTime" class="relative py-32">
      <SearchSection />
    </section>

    <!-- Tags Section -->
    <section v-if="showBookmarks" class="py-20 bg-[#111]">
      <div class="container mx-auto px-4">
        <TagsSection />
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#111] border-t border-gray-800">
      <div class="container mx-auto px-4 py-12">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-2">星际轨道</h3>
            <p class="text-gray-400">FreshTab - 美观且功能丰富的新标签页扩展</p>
          </div>
          <div>
            <h4 class="font-semibold text-lg mb-3">快速链接</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">书签管理</a></li>
              <li><a href="#" class="hover:text-white">搜索引擎</a></li>
              <li><a href="#" class="hover:text-white">时间显示</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-lg mb-3">设置</h4>
            <p class="text-gray-400 mb-4">自定义您的新标签页体验</p>
          </div>
        </div>
        <div class="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2025 星际轨道 - FreshTab. All Rights Reserved.</p>
        </div>
      </div>
    </footer>

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

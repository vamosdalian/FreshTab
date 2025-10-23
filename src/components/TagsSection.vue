<template>
  <section class="tags-section">
    <h2 class="text-3xl font-bold text-center mb-4">快速访问</h2>
    <p class="text-center text-gray-400 max-w-2xl mx-auto mb-12">您收藏的网站和书签，一键直达</p>
    
    <!-- 标签组列表 -->
    <div v-for="group in tagGroups" :key="group.id" class="tag-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-emoji">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
        </div>
      </div>

      <div class="tags-grid" :class="['tag-size-' + (settings.bookmarkSize || 'medium')]">
        <div v-for="tag in (Array.isArray(group.tags) ? group.tags : [])" :key="tag.id" 
          class="card-bg rounded-xl overflow-hidden tag-card"
          @click="openTag(tag.url)">
          <div class="tag-card-content p-6">
            <div class="tag-icon-large mb-4" :style="{ backgroundColor: tag.backgroundColor }">
              <span v-if="tag.iconType === 'emoji'" class="text-4xl">{{ tag.iconValue }}</span>
              <span v-else-if="tag.iconType === 'text'" class="text-2xl font-bold">{{ tag.iconValue }}</span>
              <img v-else-if="tag.iconType === 'favicon'" :src="getFaviconUrl(tag.url, tag)" :alt="tag.name"
                :data-original-url="tag.url" @error="handleIconError" class="w-12 h-12" />
              <span v-else class="text-4xl">🔗</span>
            </div>
            <h3 class="text-xl font-bold mb-2 text-white">{{ tag.name }}</h3>
            <p class="text-gray-300 text-sm mb-4 line-clamp-2">{{ getTagDescription(tag.url) }}</p>
            <a href="#" @click.prevent="openTag(tag.url)" class="text-blue-400 hover:text-blue-300 font-semibold">访问 &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Tag } from '../types/tagGroup'
import { useTagGroupsStore } from '../stores/tagGroupsStore'
import { useSettingsStore } from '../stores/settingsStore'

const tagGroupsStore = useTagGroupsStore()
const settingsStore = useSettingsStore();

const tagGroups = computed(() => tagGroupsStore.tagGroups.groups || [])
const settings = computed(() => settingsStore.settings as any) // TODO: Add proper settings type

function openTag(url: string): void {
  window.location.href = url
}

function getFaviconUrl(url: string, tag: Tag): string {
  // 优先使用保存的 base64 favicon 数据
  const tagWithExtras = tag as Tag & { faviconData?: string; validFaviconUrl?: string }
  
  if (tagWithExtras.faviconData) {
    return tagWithExtras.faviconData
  }
  
  if (tagWithExtras.validFaviconUrl) {
    return tagWithExtras.validFaviconUrl
  }
  
  // 回退到默认 favicon 路径
  try {
    const domain = new URL(url).hostname
    return `https://${domain}/favicon.ico`
  } catch (e) {
    return `https://www.google.com/s2/favicons?domain=${url}&sz=32`
  }
}

function getTagDescription(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain
  } catch {
    return '快速访问链接'
  }
}

function handleIconError(event: Event): void {
  const img = event.target as HTMLImageElement
  const parent = img.parentElement

  // 获取当前使用的URL
  const currentSrc = img.src

  // 获取备用favicon服务列表
  const url = img.alt || img.dataset.originalUrl
  if (url) {
    const domain = new URL(url).hostname
    const backupServices = [
      `https://favicon.link/icon?url=${domain}`,
      `https://icon.horse/icon/${domain}`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      `https://favicon.yandex.net/favicon/v2/${domain}?size=32`,
      `https://${domain}/favicon.ico`
    ]

    // 找到下一个备用服务
    const currentIndex = backupServices.findIndex(service => currentSrc.includes(service.split('/')[2]))
    const nextService = backupServices[currentIndex + 1]

    if (nextService && !img.dataset.tried) {
      // 标记已尝试，避免无限循环
      img.dataset.tried = (parseInt(img.dataset.tried || '0') + 1).toString()

      // 如果尝试次数少于3次，继续尝试下一个服务
      if (parseInt(img.dataset.tried) < 3) {
        img.src = nextService
        return
      }
    }
  }

  // 所有服务都失败了，显示默认图标
  img.style.display = 'none'
  if (parent && !parent.querySelector('.fallback-icon')) {
    const fallback = document.createElement('span')
    fallback.className = 'fallback-icon text-4xl'
    fallback.textContent = '🔗'
    parent.appendChild(fallback)
  }
}

</script>

<style scoped>
.tags-section {
  margin-bottom: 3rem;
}

.tag-group {
  margin-bottom: 3rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.group-emoji {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.group-title h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .tags-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

.tag-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-card:hover {
  border-color: #4a4a4a;
  transform: translateY(-4px);
}

.tag-card-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.tag-icon-large {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.fallback-icon {
  color: white;
}
</style>

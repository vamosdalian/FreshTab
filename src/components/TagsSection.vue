<template>
  <section class="tags-section">
    <!-- 标签组列表 -->
    <div v-for="group in tagGroups" :key="group.id" class="tag-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-emoji" :style="{ backgroundColor: group.themeColor }">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
        </div>
      </div>

      <div class="tags-grid" :class="['tag-size-' + (settings.bookmarkSize || 'medium')]" :style="layoutVars">
        <div v-for="tag in (Array.isArray(group.tags) ? group.tags : [])" :key="tag.id" class="tag-item"
          @click="openTag(tag.url)" :style="{ '--tag-color': group.themeColor }">
          <div class="tag-icon" :style="{ backgroundColor: tag.backgroundColor }">
            <span v-if="tag.iconType === 'emoji'">{{ tag.iconValue }}</span>
            <span v-else-if="tag.iconType === 'text'">{{ tag.iconValue }}</span>
            <img v-else-if="tag.iconType === 'favicon'" :src="getFaviconUrl(tag.url, tag)" :alt="tag.name"
              :data-original-url="tag.url" @error="handleIconError" />
            <span v-else>🔗</span>
          </div>
          <div class="tag-title">{{ tag.name }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '../types/tagGroup'
import { useTagGroupsStore } from '../stores/tagGroupsStore'
import { useSettingsStore } from '../stores/settingsStore'

const tagGroupsStore = useTagGroupsStore()
const settingsStore = useSettingsStore();

const tagGroups = computed(() => tagGroupsStore.tagGroups.groups || [])
const settings = computed(() => settingsStore.settings as any) // TODO: Add proper settings type

function getTagItemWidth(size: string): string {
  switch (size) {
    case 'small':
      return '92px'
    case 'large':
      return '138px'
    case 'medium':
    default:
      return '118px'
  }
}

function getTagGridGap(columnsPerRow: number): string {
  if (columnsPerRow <= 4) {
    return '1.75rem'
  }

  if (columnsPerRow <= 6) {
    return '1.25rem'
  }

  if (columnsPerRow <= 8) {
    return '0.9rem'
  }

  return '0.65rem'
}

function getAutoColumns(displayWidth: number, size: string): number {
  const itemWidth = parseInt(getTagItemWidth(size), 10)
  const estimatedGap = 16
  const safeWidth = Math.max(displayWidth - 24, itemWidth)
  const columns = Math.floor((safeWidth + estimatedGap) / (itemWidth + estimatedGap))

  return Math.max(1, columns)
}

const layoutVars = computed(() => {
  const bookmarkSize = settings.value.bookmarkSize || 'medium'
  const displayWidth = settings.value.displayWidth || 1200
  const itemsPerRow = getAutoColumns(displayWidth, bookmarkSize)

  return {
    '--items-per-row': itemsPerRow,
    '--tag-item-width': getTagItemWidth(bookmarkSize),
    '--tag-grid-gap': getTagGridGap(itemsPerRow),
    maxWidth: '100%'
  }
})

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
    fallback.className = 'fallback-icon'
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
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.group-title h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

/* Dark mode adjustments */
:root[data-theme="dark"] .group-title h3 {
  color: #e0e0e0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tag-grid-gap);
  width: min(100%, calc(var(--items-per-row) * var(--tag-item-width) + (var(--items-per-row) - 1) * var(--tag-grid-gap)));
  max-width: 100%;
  margin: 0 auto;
  justify-content: flex-start;
  padding: 0 0.75rem;
  box-sizing: border-box;
}

/* 不同尺寸的标签容器 */
.tag-size-small .tag-item {
  width: 92px;
  min-height: 92px;
}

.tag-size-medium .tag-item {
  width: 118px;
  min-height: 118px;
}

.tag-size-large .tag-item {
  width: 138px;
  min-height: 138px;
}

.tag-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  padding: 0.35rem 0.15rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.tag-item:hover {
  transform: translateY(-2px);
}

/* 不同尺寸下的图标大小 */
.tag-size-small .tag-icon {
  width: 46px;
  height: 46px;
  font-size: 20px;
}

.tag-size-medium .tag-icon {
  width: 58px;
  height: 58px;
  font-size: 25px;
}

.tag-size-large .tag-icon {
  width: 68px;
  height: 68px;
  font-size: 30px;
}

/* 不同尺寸下的文字大小 */
.tag-size-small .tag-title {
  font-size: 0.7rem;
  line-height: 1.2;
}

.tag-size-medium .tag-title {
  font-size: 0.8rem;
  line-height: 1.3;
}

.tag-size-large .tag-title {
  font-size: 0.9rem;
  line-height: 1.4;
}

.tag-icon {
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.tag-item:hover .tag-icon {
  transform: scale(1.05);
  border-color: var(--tag-color, #667eea);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
}

/* 不同尺寸下的图片大小 */
.tag-size-small .tag-icon img {
  width: 22px;
  height: 22px;
}

.tag-size-medium .tag-icon img {
  width: 28px;
  height: 28px;
}

.tag-size-large .tag-icon img {
  width: 34px;
  height: 34px;
}

.tag-icon img {
  object-fit: cover;
}

.tag-icon .fallback-icon {
  font-size: 24px;
  color: white;
}

.tag-title {
  color: white;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  transition: color 0.3s ease;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.22);
}

:root[data-theme="dark"] .tag-title {
  color: #e0e0e0;
}

.global-empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-color-light, rgba(255, 255, 255, 0.7));
  transition: color 0.3s ease;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.global-empty-state h3 {
  color: var(--title-color, white);
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.global-empty-state p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}
</style>

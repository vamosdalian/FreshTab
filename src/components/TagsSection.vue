<template>
  <section class="tags-section">
    <!-- 标签组列表 -->
    <div v-for="group in tagGroups" :key="group.id" class="tag-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-emoji">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
        </div>
      </div>

      <div class="tags-grid" :class="['tag-size-' + (settings.bookmarkSize || 'medium')]" :style="{
        '--items-per-row': settings.columnsPerRow || 6,
        maxWidth: '100%'
      }">
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
  // Note: validFaviconUrl is not part of the Tag interface but may exist in runtime
  const tagWithExtras = tag as Tag & { validFaviconUrl?: string }
  if (tagWithExtras && tagWithExtras.validFaviconUrl) {
    return tagWithExtras.validFaviconUrl
  }
  const domain = new URL(url).hostname
  return `https://${domain}/favicon.ico`
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
  background: var(--card-bg, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
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
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

/* 不同尺寸的标签容器 */
.tag-size-small .tag-item {
  width: 80px;
  height: 80px;
}

.tag-size-medium .tag-item {
  width: 100px;
  height: 100px;
}

.tag-size-large .tag-item {
  width: 120px;
  height: 120px;
}

.tag-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  flex-shrink: 0;
}

.tag-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--card-shadow, rgba(0, 0, 0, 0.2));
  border-color: var(--tag-color, #667eea);
}

/* 不同尺寸下的图标大小 */
.tag-size-small .tag-icon {
  width: 32px;
  height: 32px;
  font-size: 16px;
  margin-bottom: 0.25rem;
}

.tag-size-medium .tag-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
  margin-bottom: 0.375rem;
}

.tag-size-large .tag-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
  margin-bottom: 0.5rem;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 不同尺寸下的图片大小 */
.tag-size-small .tag-icon img {
  width: 16px;
  height: 16px;
}

.tag-size-medium .tag-icon img {
  width: 20px;
  height: 20px;
}

.tag-size-large .tag-icon img {
  width: 24px;
  height: 24px;
}

.tag-icon img {
  object-fit: cover;
}

.tag-icon .fallback-icon {
  font-size: 24px;
  color: white;
}

.tag-title {
  color: var(--text-color, white);
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  transition: color 0.3s ease;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
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

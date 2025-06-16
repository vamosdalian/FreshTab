<template>
  <section class="tags-section">
    <!-- 标签分组显示 -->
    <div v-for="group in tagGroups" :key="group.id" class="tag-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-emoji">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
        </div>
        <button 
          class="add-tag-btn"
          @click="$emit('addTag', group.id)"
          title="添加标签"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <div 
        class="tags-grid" 
        :class="['tag-size-' + settings.bookmarkSize]"
        :style="{ 
          '--items-per-row': settings.columnsPerRow,
          maxWidth: '100%'
        }"
      >
        <div
          v-for="tag in (Array.isArray(group.tags) ? group.tags : [])"
          :key="tag.id"
          class="tag-item"
          @click="openTag(tag.url)"
          :style="{ '--tag-color': group.themeColor }"
        >
          <div class="tag-icon" :style="{ backgroundColor: tag.backgroundColor }">
            <span v-if="tag.iconType === 'emoji'">{{ tag.iconValue }}</span>
            <span v-else-if="tag.iconType === 'text'">{{ tag.iconValue }}</span>
            <img 
              v-else-if="tag.iconType === 'favicon'"
              :src="getFaviconUrl(tag.url, tag)"
              :alt="tag.name"
              :data-original-url="tag.url"
              @error="handleIconError"
            />
            <span v-else>🔗</span>
          </div>
          <div class="tag-title">{{ tag.name }}</div>
          <button 
            @click.stop="$emit('deleteTag', group.id, tag.id)"
            class="delete-btn"
            title="删除标签"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!Array.isArray(group.tags) || group.tags.length === 0" class="empty-state">
        <p>这个分组还没有标签</p>
        <button @click="$emit('addTag', group.id)" class="add-first-btn">
          添加第一个标签
        </button>
      </div>
    </div>
    
    <!-- 全局空状态 -->
    <div v-if="tagGroups.length === 0" class="global-empty-state">
      <div class="empty-icon">📁</div>
      <h3>还没有任何分组</h3>
      <p>在设置中创建分组来管理你的标签</p>
      <button @click="$emit('openSettings')" class="settings-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        打开设置
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TagsSection',
  props: {
    tagGroups: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ['addTag', 'deleteTag', 'openSettings'],
  methods: {
    openTag(url) {
      window.location.href = url
    },
    
    getFaviconUrl(url, tag) {
      // 优先使用保存的有效favicon URL
      if (tag && tag.validFaviconUrl) {
        return tag.validFaviconUrl
      }
      
      try {
        const domain = new URL(url).hostname
        
        // 国内外favicon服务列表（按优先级排序）
        const faviconServices = [
          // 国内服务（速度更快）
          `https://api.iowen.cn/favicon/${domain}.png`,
          `https://favicon.link/icon?url=${domain}`,
          `https://icon.horse/icon/${domain}`,
          
          // 国外服务（备用）
          `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
          `https://favicon.yandex.net/favicon/v2/${domain}?size=32`,
          
          // 直接尝试网站根目录
          `https://${domain}/favicon.ico`
        ]
        
        // 返回第一个服务作为主要选择
        return faviconServices[0]
      } catch {
        return ''
      }
    },
    
    // 计算最大每行显示个数
    getMaxColumnsPerRow() {
      const tagSizes = {
        small: 80,   // 小标签宽度
        medium: 100, // 中标签宽度
        large: 120   // 大标签宽度
      }
      const tagWidth = tagSizes[this.settings.bookmarkSize] || 100
      const gap = 16 // 1rem = 16px
      const displayWidth = this.settings.displayWidth || 800
      
      // 计算可以放置的标签数量（考虑间距）
      const maxColumns = Math.floor((displayWidth + gap) / (tagWidth + gap))
      return Math.max(1, maxColumns) // 至少显示1个
    },
    
    handleIconError(event) {
      const img = event.target
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

.add-tag-btn {
  background: var(--card-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color, white);
  opacity: 0.7;
}

.add-tag-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
  border-color: var(--tag-color, #667eea);
  opacity: 1;
  transform: scale(1.1);
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
  color: var(--title-color, white);
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  transition: color 0.3s ease;
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

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
}

.tag-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color-light, rgba(255, 255, 255, 0.7));
  transition: color 0.3s ease;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.add-first-btn {
  padding: 0.8rem 1.5rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 25px;
  color: var(--text-color, white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.add-first-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.3));
  transform: translateY(-1px);
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

.settings-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 25px;
  color: var(--text-color, white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.settings-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.3));
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .tags-grid {
    gap: 0.8rem;
  }
  
  /* 移动端强制使用小尺寸 */
  .tag-item {
    width: 70px !important;
    height: 70px !important;
    padding: 0.4rem;
  }
  
  .tag-icon {
    width: 28px !important;
    height: 28px !important;
    font-size: 14px !important;
    margin-bottom: 0.2rem !important;
  }
  
  .tag-icon img {
    width: 14px !important;
    height: 14px !important;
  }
  
  .tag-title {
    font-size: 0.6rem !important;
    line-height: 1.1 !important;
  }
  
  .group-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .group-title h3 {
    text-align: center;
  }
}
</style>

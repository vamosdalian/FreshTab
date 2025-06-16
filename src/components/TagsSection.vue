<template>
  <section class="tags-section">
    <!-- 标签分组显示 -->
    <div v-for="group in tagGroups" :key="group.id" class="tag-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-emoji">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
        </div>
      </div>
      
      <div class="tags-grid">
        <div
          v-for="tag in group.tags"
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
              :src="getFaviconUrl(tag.url)"
              :alt="tag.name"
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
        
        <!-- 添加标签按钮 -->
        <div 
          class="add-tag-item"
          @click="$emit('addTag', group.id)"
          :style="{ '--tag-color': group.themeColor }"
        >
          <div class="add-tag-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div class="add-tag-title">添加标签</div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="group.tags.length === 0" class="empty-state">
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
    }
  },
  emits: ['addTag', 'deleteTag', 'openSettings'],
  methods: {
    openTag(url) {
      window.location.href = url
    },
    
    getFaviconUrl(url) {
      try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {
        return ''
      }
    },
    
    handleIconError(event) {
      // 如果favicon加载失败，隐藏图片并显示默认图标
      event.target.style.display = 'none'
      const parent = event.target.parentElement
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
  color: var(--text-color, white);
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
  transition: color 0.3s ease;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.tag-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.tag-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.6));
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--card-shadow, rgba(0, 0, 0, 0.2));
  border-color: var(--tag-color, #667eea);
}

.tag-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tag-icon img {
  width: 24px;
  height: 24px;
  object-fit: cover;
}

.tag-icon .fallback-icon {
  font-size: 24px;
  color: white;
}

.tag-title {
  color: var(--text-color, white);
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  max-width: 100%;
  transition: color 0.3s ease;
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

.add-tag-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px dashed var(--border-color, rgba(255, 255, 255, 0.3));
}

.add-tag-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.1));
  border-color: var(--tag-color, #667eea);
  transform: translateY(-2px);
}

.add-tag-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tag-color, #667eea);
  color: white;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.add-tag-item:hover .add-tag-icon {
  opacity: 1;
  transform: scale(1.1);
}

.add-tag-title {
  color: var(--text-color-light, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  text-align: center;
  transition: color 0.3s ease;
}

.add-tag-item:hover .add-tag-title {
  color: var(--text-color, white);
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
  color: var(--text-color, white);
  font-size: 1.5rem;
  font-weight: 300;
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.8rem;
  }
  
  .tag-item {
    padding: 0.8rem;
  }
  
  .tag-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .tag-icon img {
    width: 20px;
    height: 20px;
  }
  
  .tag-title {
    font-size: 0.8rem;
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

<template>
  <section class="bookmarks-section">
    <div class="bookmarks-header">
      <h3>常用网站</h3>
      <button @click="$emit('openAddModal')" class="add-bookmark-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加网站
      </button>
    </div>
    
    <div class="bookmarks-grid">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.id || bookmark.name"
        class="bookmark-item"
        @click="$emit('openBookmark', bookmark.url)"
      >
        <div class="bookmark-icon">
          <span v-if="bookmark.icon">{{ bookmark.icon }}</span>
          <img 
            v-else
            :src="`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=32`"
            :alt="bookmark.name || bookmark.title"
            @error="handleIconError"
          />
        </div>
        <div class="bookmark-title">{{ bookmark.name || bookmark.title }}</div>
        <button 
          @click.stop="$emit('deleteBookmark', bookmark.id || bookmark.name)"
          class="delete-btn"
          title="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="bookmarks.length === 0" class="empty-state">
      <p>还没有添加任何网站</p>
      <button @click="$emit('openAddModal')" class="add-first-btn">
        添加第一个网站
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BookmarksSection',
  props: {
    bookmarks: {
      type: Array,
      required: true
    }
  },
  emits: ['openBookmark', 'deleteBookmark', 'openAddModal'],
  methods: {
    getDomain(url) {
      try {
        return new URL(url).hostname
      } catch {
        return url
      }
    },
    handleIconError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDgiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
    }
  }
}
</script>

<style scoped>
.bookmarks-section {
  margin-bottom: 3rem;
}

.bookmarks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.bookmarks-header h3 {
  color: var(--text-color, white);
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
  transition: color 0.3s ease;
}

.add-bookmark-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.15));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 20px;
  color: var(--text-color, white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.add-bookmark-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.25));
  transform: translateY(-1px);
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.bookmark-item {
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

.bookmark-item:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.6));
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--card-shadow, rgba(0, 0, 0, 0.2));
}

.bookmark-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  font-size: 20px;
  transition: background 0.3s ease;
}

.bookmark-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-icon span {
  font-size: 20px;
  color: var(--text-color, white);
  transition: color 0.3s ease;
}

.bookmark-title {
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

.bookmark-item:hover .delete-btn {
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

@media (max-width: 768px) {
  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.8rem;
  }
  
  .bookmark-item {
    padding: 0.8rem;
  }
  
  .bookmark-title {
    font-size: 0.8rem;
  }
  
  .bookmarks-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .bookmarks-header h3 {
    text-align: center;
  }
}
</style>

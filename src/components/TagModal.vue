<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '编辑标签' : '添加标签' }}</h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">标签名称</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="输入标签名称"
            class="form-input"
            required
            ref="nameInput"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">网站地址</label>
          <input
            v-model="formData.url"
            type="url"
            placeholder="https://example.com"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">图标类型</label>
          <div class="icon-type-selector">
            <button 
              type="button"
              @click="formData.iconType = 'favicon'"
              :class="['icon-type-btn', { active: formData.iconType === 'favicon' }]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              网站图标
            </button>
            <button 
              type="button"
              @click="formData.iconType = 'emoji'"
              :class="['icon-type-btn', { active: formData.iconType === 'emoji' }]"
            >
              <span>😀</span>
              Emoji
            </button>
            <button 
              type="button"
              @click="formData.iconType = 'text'"
              :class="['icon-type-btn', { active: formData.iconType === 'text' }]"
            >
              <span>A</span>
              文字
            </button>
          </div>
        </div>
        
        <!-- Emoji选择器 -->
        <div v-if="formData.iconType === 'emoji'" class="form-group">
          <label class="form-label">选择Emoji</label>
          <EmojiPicker 
            :selected-emoji="formData.iconValue"
            :show-smart-recommendations="true"
            :site-name="formData.name"
            :site-url="formData.url"
            @select-emoji="handleEmojiSelect"
          />
        </div>
        
        <!-- 文字输入 -->
        <div v-if="formData.iconType === 'text'" class="form-group">
          <label class="form-label">图标文字</label>
          <input
            v-model="formData.iconValue"
            type="text"
            placeholder="输入1-2个字符"
            class="form-input"
            maxlength="2"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">背景颜色</label>
          <div class="color-grid">
            <div 
              v-for="color in themeColors" 
              :key="color"
              @click="formData.backgroundColor = color"
              :class="['color-item', { selected: formData.backgroundColor === color }]"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">预览</label>
          <div class="tag-preview-container">
            <div 
              class="tag-preview-item"
              :style="{ backgroundColor: formData.backgroundColor }"
            >
              <span v-if="formData.iconType === 'emoji'">{{ formData.iconValue || '🔗' }}</span>
              <span v-else-if="formData.iconType === 'text'">{{ formData.iconValue || formData.name.charAt(0).toUpperCase() }}</span>
              <img 
                v-else-if="formData.iconType === 'favicon' && formData.url"
                :src="getFaviconUrl(formData.url)"
                :alt="formData.name"
                @error="handleFaviconError"
              />
              <span v-else>🔗</span>
            </div>
            <span class="preview-name">{{ formData.name || '标签名称' }}</span>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="cancel-button">
            取消
          </button>
          <button type="submit" class="submit-button">
            {{ isEditing ? '保存' : '添加' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick, computed } from 'vue'
import EmojiPicker from './EmojiPicker.vue'

export default {
  name: 'TagModal',
  components: {
    EmojiPicker
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    tag: {
      type: Object,
      default: null
    },
    emojiOptions: {
      type: Array,
      default: () => []
    },
    themeColors: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      name: '',
      url: '',
      iconType: 'favicon',
      iconValue: '',
      backgroundColor: '#667eea'
    })
    
    const nameInput = ref(null)
    const isEditing = ref(false)
    
    // 监听 props 变化，初始化表单数据
    watch(() => props.tag, (newTag) => {
      if (newTag) {
        isEditing.value = true
        formData.value = {
          name: newTag.name,
          url: newTag.url,
          iconType: newTag.iconType || 'favicon',
          iconValue: newTag.iconValue || '',
          backgroundColor: newTag.backgroundColor || '#667eea'
        }
      } else {
        isEditing.value = false
        formData.value = {
          name: '',
          url: '',
          iconType: 'favicon',
          iconValue: '',
          backgroundColor: '#667eea'
        }
      }
    }, { immediate: true })
    
    // 监听模态框打开状态，自动聚焦输入框
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        nextTick(() => {
          nameInput.value?.focus()
        })
      }
    })
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    const handleSubmit = () => {
      const tagData = {
        name: formData.value.name.trim(),
        url: formData.value.url.trim(),
        iconType: formData.value.iconType,
        iconValue: formData.value.iconValue,
        backgroundColor: formData.value.backgroundColor
      }
      
      // 确保 URL 有协议
      if (!tagData.url.startsWith('http://') && !tagData.url.startsWith('https://')) {
        tagData.url = 'https://' + tagData.url
      }
      
      // 如果是文字类型但没有输入值，使用名称首字母
      if (tagData.iconType === 'text' && !tagData.iconValue) {
        tagData.iconValue = tagData.name.charAt(0).toUpperCase()
      }
      
      if (isEditing.value) {
        tagData.id = props.tag.id
      }
      
      emit('save', tagData)
      emit('close')
    }
    
    const getFaviconUrl = (url) => {
      try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {
        return ''
      }
    }
    
    const handleFaviconError = (event) => {
      event.target.style.display = 'none'
    }
    
    // emoji选择处理
    const handleEmojiSelect = (emoji) => {
      formData.value.iconValue = emoji
    }
    
    // 初始化数据
    const initializeModal = () => {
      // 模态框初始化逻辑
    }
    
    // 监听modal打开状态
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        initializeModal()
        nextTick(() => {
          nameInput.value?.focus()
        })
      }
    })

    return {
      formData,
      nameInput,
      isEditing,
      // 方法
      handleOverlayClick,
      handleSubmit,
      getFaviconUrl,
      handleFaviconError,
      handleEmojiSelect
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--card-bg, rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
  transition: background 0.3s ease, border 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h2 {
  color: var(--text-color, white);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: var(--text-color, white);
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  color: var(--text-color, white);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: rgba(100, 200, 255, 0.8);
  background: var(--input-focus-bg, rgba(255, 255, 255, 0.15));
  box-shadow: 0 0 0 3px rgba(100, 200, 255, 0.2);
}

.form-input::placeholder {
  color: var(--placeholder-color, rgba(255, 255, 255, 0.5));
}

.icon-type-selector {
  display: flex;
  gap: 0.5rem;
}

.icon-type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  color: var(--text-color, white);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.icon-type-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.icon-type-btn.active {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.5);
}

.emoji-grid, .color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--grid-bg, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.emoji-item, .color-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.emoji-item {
  font-size: 1.2rem;
  background: var(--item-bg, rgba(255, 255, 255, 0.1));
}

.emoji-item:hover {
  background: var(--item-hover-bg, rgba(255, 255, 255, 0.2));
}

.emoji-item.selected {
  border-color: rgba(100, 200, 255, 0.8);
  background: rgba(100, 200, 255, 0.2);
}

/* 新增emoji功能样式 */
.emoji-search {
  margin-bottom: 1rem;
}

.emoji-search-input {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

.emoji-recommendations, .emoji-recent {
  margin-bottom: 1rem;
}

.recommendations-label, .recent-label {
  font-size: 0.8rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.emoji-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 0.25rem;
  max-height: 80px;
  overflow-y: auto;
}

.emoji-grid-small .emoji-item {
  width: 32px;
  height: 32px;
  font-size: 1rem;
  min-width: 32px;
}

.emoji-categories {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.25rem 0.5rem;
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 6px;
  color: var(--text-color, white);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.category-btn.active {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.8);
  color: white;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.selected {
  border-color: white;
  transform: scale(1.1);
}

.tag-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--preview-bg, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
}

.tag-preview-item {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tag-preview-item img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.preview-name {
  color: var(--text-color, white);
  font-size: 0.875rem;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: var(--text-color, white);
}

.cancel-button {
  background: var(--button-bg, rgba(255, 255, 255, 0.1));
}

.cancel-button:hover {
  background: var(--button-hover-bg, rgba(255, 255, 255, 0.2));
}

.submit-button {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.5);
}

.submit-button:hover {
  background: rgba(100, 200, 255, 0.5);
  transform: translateY(-1px);
}

/* 自定义滚动条 */
.emoji-grid::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track, rgba(255, 255, 255, 0.1));
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, rgba(255, 255, 255, 0.3));
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, rgba(255, 255, 255, 0.5));
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .submit-button {
    width: 100%;
  }
  
  .emoji-grid, .color-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>

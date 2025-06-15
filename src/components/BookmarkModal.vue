<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '编辑网站' : '添加网站' }}</h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">网站名称</label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="输入网站名称"
            class="form-input"
            required
            ref="titleInput"
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
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'BookmarkModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    bookmark: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      title: '',
      url: ''
    })
    
    const titleInput = ref(null)
    const isEditing = ref(false)
    
    // 监听 props 变化，初始化表单数据
    watch(() => props.bookmark, (newBookmark) => {
      if (newBookmark) {
        isEditing.value = true
        formData.value = {
          title: newBookmark.title,
          url: newBookmark.url
        }
      } else {
        isEditing.value = false
        formData.value = {
          title: '',
          url: ''
        }
      }
    }, { immediate: true })
    
    // 监听模态框打开状态，自动聚焦输入框
    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        nextTick(() => {
          titleInput.value?.focus()
        })
      }
    })
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    const handleSubmit = () => {
      const bookmarkData = {
        title: formData.value.title.trim(),
        url: formData.value.url.trim()
      }
      
      // 确保 URL 有协议
      if (!bookmarkData.url.startsWith('http://') && !bookmarkData.url.startsWith('https://')) {
        bookmarkData.url = 'https://' + bookmarkData.url
      }
      
      if (isEditing.value) {
        bookmarkData.id = props.bookmark.id
      }
      
      emit('save', bookmarkData)
      emit('close')
    }
    
    return {
      formData,
      titleInput,
      isEditing,
      handleOverlayClick,
      handleSubmit
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
  width: 90%;
  animation: slideIn 0.3s ease;
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
  color: white;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 400;
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
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 400;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: white;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.submit-button {
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.5);
}

.submit-button:hover {
  background: rgba(100, 200, 255, 0.5);
  transform: translateY(-1px);
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
}
</style>

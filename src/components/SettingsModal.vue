<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>设置</h2>
        <button @click="$emit('close')" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="settings-group">
          <h3>显示设置</h3>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showTime"
                @change="updateSetting('showTime', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示时间
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showSearch"
                @change="updateSetting('showSearch', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示搜索框
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showBookmarks"
                @change="updateSetting('showBookmarks', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示书签
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showWeather"
                @change="updateSetting('showWeather', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示天气
            </label>
          </div>
        </div>
        
        <div class="settings-group">
          <h3>背景设置</h3>
          <div class="setting-item">
            <label class="setting-label-text">背景类型</label>
            <select 
              :value="settings.backgroundType"
              @change="updateSetting('backgroundType', $event.target.value)"
              class="setting-select"
            >
              <option value="gradient">渐变色</option>
              <option value="image">图片</option>
              <option value="color">纯色</option>
            </select>
          </div>
          
          <div v-if="settings.backgroundType === 'image'" class="setting-item">
            <label class="setting-label-text">背景图片URL</label>
            <input
              type="url"
              :value="settings.backgroundImage"
              @input="updateSetting('backgroundImage', $event.target.value)"
              placeholder="输入图片链接"
              class="setting-input"
            />
          </div>
          
          <div v-if="settings.backgroundType === 'color'" class="setting-item">
            <label class="setting-label-text">背景颜色</label>
            <input
              type="color"
              :value="settings.backgroundColor"
              @input="updateSetting('backgroundColor', $event.target.value)"
              class="setting-color"
            />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="resetSettings" class="reset-button">重置设置</button>
        <button @click="$emit('close')" class="save-button">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'updateSetting', 'resetSettings'],
  methods: {
    handleOverlayClick() {
      this.$emit('close')
    },
    updateSetting(key, value) {
      this.$emit('updateSetting', key, value)
    },
    resetSettings() {
      this.$emit('resetSettings')
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
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
  font-size: 1.5rem;
  font-weight: 300;
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

.settings-group {
  margin-bottom: 2rem;
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-group h3 {
  color: white;
  font-size: 1.2rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.setting-label input[type="checkbox"]:checked + .checkmark {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.setting-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.setting-label-text {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.setting-select,
.setting-input {
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

.setting-select:focus,
.setting-input:focus {
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.setting-select option {
  background: #333;
  color: white;
}

.setting-color {
  width: 60px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: none;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.reset-button {
  background: rgba(255, 100, 100, 0.2);
  color: white;
}

.reset-button:hover {
  background: rgba(255, 100, 100, 0.4);
}

.save-button {
  background: rgba(100, 255, 100, 0.2);
  color: white;
}

.save-button:hover {
  background: rgba(100, 255, 100, 0.4);
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

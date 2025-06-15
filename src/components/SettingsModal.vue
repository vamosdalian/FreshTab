<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- 左侧菜单栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>设置</h2>
        </div>
        
        <nav class="sidebar-nav">
          <button 
            v-for="item in menuItems" 
            :key="item.id"
            @click="activeMenu = item.id"
            :class="['menu-item', { active: activeMenu === item.id }]"
          >
            <span class="menu-icon" v-html="item.icon"></span>
            <span class="menu-text">{{ item.name }}</span>
          </button>
        </nav>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="main-content">
        <!-- 设置页面 -->
        <div v-if="activeMenu === 'settings'" class="content-section">
          <h3>基本设置</h3>
          
          <h4>显示设置</h4>
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
          
          <h4>时间设置</h4>
          <div class="setting-item">
            <label class="setting-label-text">时间格式</label>
            <select 
              :value="settings.timeFormat"
              @change="updateSetting('timeFormat', $event.target.value)"
              class="setting-select"
            >
              <option value="24h">24小时制</option>
              <option value="12h">12小时制</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showDate"
                @change="updateSetting('showDate', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示日期
            </label>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showSeconds"
                @change="updateSetting('showSeconds', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示秒数
            </label>
          </div>
          
          <h4>主题设置</h4>
          <div class="setting-item">
            <label class="setting-label-text">主题模式</label>
            <select 
              :value="settings.theme"
              @change="updateSetting('theme', $event.target.value)"
              class="setting-select"
            >
              <option value="auto">跟随系统</option>
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
            </select>
          </div>
        </div>
        
        <!-- 标签管理页面 -->
        <div v-if="activeMenu === 'bookmarks'" class="content-section">
          <h3>标签管理</h3>
          
          <h4>书签设置</h4>
          <div class="setting-item">
            <label class="setting-label">
              <input
                type="checkbox"
                :checked="settings.showBookmarks"
                @change="updateSetting('showBookmarks', $event.target.checked)"
              />
              <span class="checkmark"></span>
              显示书签栏
            </label>
          </div>
          
          <div class="setting-item">
            <button class="action-button">
              <span>📝</span>
              管理书签
            </button>
          </div>
          
          <div class="setting-item">
            <button class="action-button">
              <span>📁</span>
              导入书签
            </button>
          </div>
        </div>
        
        <!-- 背景页面 -->
        <div v-if="activeMenu === 'background'" class="content-section">
          <h3>背景设置</h3>
          
          <h4>背景类型</h4>
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
        
        <!-- 关于页面 -->
        <div v-if="activeMenu === 'about'" class="content-section">
          <h3>关于</h3>
          
          <h4>应用信息</h4>
          <div class="about-item">
            <strong>FreshTab</strong>
          </div>
          
          <div class="about-item">
            版本：1.0.0
          </div>
          
          <div class="about-item">
            一个简洁美观的新标签页扩展
          </div>
          
          <div class="about-item">
            <button class="action-button">
              <span>🌟</span>
              给我们评分
            </button>
          </div>
          
          <div class="about-item">
            <button class="action-button">
              <span>📞</span>
              联系我们
            </button>
          </div>
        </div>
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
  data() {
    return {
      activeMenu: 'settings',
      menuItems: [
        {
          id: 'settings',
          name: '设置',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
        },
        {
          id: 'bookmarks',
          name: '标签管理',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>'
        },
        {
          id: 'background',
          name: '背景',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>'
        },
        {
          id: 'about',
          name: '关于',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        }
      ]
    }
  },
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
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 1000px;
  height: 800px;
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: row;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

@keyframes slideIn {
  from { 
    transform: translateY(-30px) scale(0.95); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
}

/* 左侧边栏 */
.sidebar {
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  height: 100%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(55, 65, 81, 0.1);
  backdrop-filter: blur(20px);
}

.sidebar-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(55, 65, 81, 0.15);
}

.sidebar-header h2 {
  color: #374151;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sidebar-nav {
  position: relative;
  z-index: 2;
  padding: 1.5rem 0;
  flex: 1;
}

.menu-item {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(55, 65, 81, 0.8);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-align: left;
  margin: 0.25rem 0;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #374151;
  transform: scaleY(0);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.menu-item:hover {
  background: rgba(55, 65, 81, 0.1);
  color: #374151;
  transform: translateX(8px);
}

.menu-item.active {
  background: rgba(55, 65, 81, 0.2);
  color: #374151;
  transform: translateX(12px);
}

.menu-item.active::before {
  transform: scaleY(1);
}

.menu-item.active .menu-icon {
  color: #374151;
  transform: scale(1.1);
}

.menu-icon {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  color: rgba(55, 65, 81, 0.7);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.menu-text {
  flex: 1;
  font-weight: 500;
}

/* 右侧主内容区 */
.main-content {
  flex: 1;
  width: 640px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  position: relative;
  overflow: hidden;
}

.content-section {
  flex: 1;
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
}

.content-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 2rem;
  right: 2rem;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
}

.content-section h3 {
  color: #1a202c;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #64748b;
  position: relative;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.setting-item {
  margin-bottom: 1.25rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.setting-item:hover {
  transform: translateX(4px);
}

.setting-label {
  display: flex;
  align-items: center;
  color: #4a5568;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.setting-label:hover {
  color: #2d3748;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  margin-right: 1rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.setting-label input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-color: #64748b;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.setting-label-text {
  display: block;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.setting-select,
.setting-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #2d3748;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.setting-select:focus,
.setting-input:focus {
  border-color: #64748b;
  box-shadow: 
    0 0 0 3px rgba(100, 116, 139, 0.1),
    0 4px 12px rgba(100, 116, 139, 0.15);
  transform: translateY(-1px);
}

.setting-select option {
  background: white;
  color: #2d3748;
  padding: 0.5rem;
}

.setting-color {
  width: 80px;
  height: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.setting-color:focus {
  border-color: #64748b;
  box-shadow: 
    0 0 0 3px rgba(100, 116, 139, 0.1),
    0 4px 12px rgba(100, 116, 139, 0.15);
  transform: scale(1.05);
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: 100%;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.action-button:hover {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-color: #64748b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(100, 116, 139, 0.25);
}

.action-button span {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.about-item {
  margin-bottom: 1rem;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #64748b;
}

.about-item strong {
  font-size: 1rem;
  color: #1a202c;
  font-weight: 600;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
    max-width: none;
    flex-direction: column;
    border-radius: 16px;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    min-width: auto;
    max-width: none;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    position: relative;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    min-width: auto;
  }
  
  .sidebar-header h2 {
    font-size: 1rem;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: row;
    padding: 1rem 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .sidebar-nav::-webkit-scrollbar {
    display: none;
  }
  
  .menu-item {
    min-width: 100px;
    justify-content: center;
    flex-direction: column;
    padding: 1rem 0.75rem;
    margin: 0 0.25rem;
    border-radius: 12px;
    background: rgba(55, 65, 81, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(55, 65, 81, 0.2);
    transform: none;
  }
  
  .menu-item::before {
    display: none;
  }
  
  .menu-item:hover,
  .menu-item.active {
    transform: none;
    background: rgba(55, 65, 81, 0.25);
  }
  
  .menu-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .menu-text {
    font-size: 0.75rem;
    text-align: center;
    font-weight: 600;
  }
  
  .content-section {
    padding: 1.5rem;
    height: auto;
    flex: 1;
  }
  
  .content-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
  }
}

/* 自定义滚动条 */
.content-section::-webkit-scrollbar {
  width: 6px;
}

.content-section::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.content-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-radius: 10px;
}

.content-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
}

/* 微交互动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.setting-item:active .checkmark {
  animation: pulse 0.3s ease;
}

.action-button:active {
  animation: pulse 0.2s ease;
}

/* 渐变文字效果 */
.gradient-text {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

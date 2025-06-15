<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- 左侧菜单栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="user-info">
            <div class="user-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="user-details">
              <div class="user-name">FreshTab</div>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-group">
            <button 
              v-for="item in menuItems" 
              :key="item.id"
              @click="activeMenu = item.id"
              :class="['menu-item', { active: activeMenu === item.id }]"
            >
              <span class="menu-icon" v-html="item.icon"></span>
              <span class="menu-text">{{ item.name }}</span>
              <span v-if="item.tag" class="menu-tag">{{ item.tag }}</span>
            </button>
          </div>
          
          <div class="nav-footer">
            <div class="version-info">V1.0.0</div>
          </div>
        </nav>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="setting-content">
        <!-- 设置页面 -->
        <div v-if="activeMenu === 'settings'" class="content-section">
          
          <!-- 控制栏 -->
          <div class="settings-group">
            <h3>控制栏</h3>
            <div class="setting-row">
              <span class="setting-label">侧边栏</span>
              <select class="setting-select">
                <option>自动隐藏</option>
                <option>始终显示</option>
                <option>始终隐藏</option>
              </select>
            </div>
            <div class="setting-row">
              <span class="setting-label">侧边栏位置</span>
              <select class="setting-select">
                <option>左侧</option>
                <option>右侧</option>
              </select>
            </div>
            <div class="setting-row">
              <span class="setting-label">底部栏</span>
              <select class="setting-select">
                <option>一直隐藏</option>
                <option>自动隐藏</option>
                <option>始终显示</option>
              </select>
            </div>
          </div>

          <!-- 图标 -->
          <div class="settings-group">
            <h3>图标</h3>
            <div class="setting-row">
              <span class="setting-label">打开方式</span>
              <select class="setting-select">
                <option>当前标签页</option>
                <option>新标签页</option>
              </select>
            </div>
            <div class="setting-row">
              <span class="setting-label">图标尺寸</span>
              <select class="setting-select">
                <option>中</option>
                <option>小</option>
                <option>大</option>
              </select>
            </div>
            <div class="setting-row">
              <span class="setting-label">图标区域宽度</span>
              <div class="range-control">
                <input type="range" min="0" max="100" value="50" class="setting-range">
                <span class="range-icon">›</span>
              </div>
            </div>
            <div class="setting-row">
              <span class="setting-label">隐藏添加图标</span>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span class="setting-label">隐藏图标名称</span>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span class="setting-label">滚动触发翻页</span>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- 搜索 -->
          <div class="settings-group">
            <h3>搜索</h3>
            <div class="setting-row">
              <span class="setting-label">搜索框样式</span>
              <div class="range-control">
                <span class="range-icon">›</span>
              </div>
            </div>
          </div>

        </div>
        
        <!-- 标签管理页面 -->
        <div v-if="activeMenu === 'bookmarks'" class="content-section">
          <h3>标签管理</h3>
          <!-- 内容保持不变 -->
        </div>
        
        <!-- 背景页面 -->
        <div v-if="activeMenu === 'background'" class="content-section">
          <h3>背景设置</h3>
          <!-- 内容保持不变 -->
        </div>
        
        <!-- 关于页面 -->
        <div v-if="activeMenu === 'about'" class="content-section">
          <h3>关于</h3>
          <!-- 内容保持不变 -->
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
          name: '常规设置',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
        },
        {
          id: 'wallpaper',
          name: '壁纸',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>'
        },
        {
          id: 'theme',
          name: '主题切换',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>'
        },
        {
          id: 'about',
          name: '关于我们',
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
  background: #f8f9fa;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 900px;
  height: 600px;
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: row;
  border: 1px solid #e9ecef;
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
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
}

.nav-group {
  flex: 1;
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #007bff;
}

.menu-item.active {
  background: #007bff;
  color: white;
}

.menu-item.active .menu-icon {
  color: white;
}

.menu-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  color: #6c757d;
  transition: color 0.2s ease;
}

.menu-text {
  flex: 1;
  font-weight: 400;
}

.menu-tag {
  background: #28a745;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.nav-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.version-info {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  font-size: 12px;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #007bff;
}

/* 右侧主内容区 */
.setting-content {
  flex: 1;
  height: 100%;
  background: #f8f9fa;
  overflow-y: auto;
}

.content-section {
  padding: 32px;
}

.settings-group {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.settings-group h3 {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #495057;
  font-weight: 400;
  flex: 1;
}

.setting-select {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: #495057;
  min-width: 120px;
  outline: none;
  transition: border-color 0.2s ease;
}

.setting-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #28a745;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.range-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-range {
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: #dee2e6;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.setting-range:hover {
  opacity: 1;
}

.setting-range::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.setting-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.range-icon {
  color: #6c757d;
  font-size: 16px;
}

/* 自定义滚动条 */
.setting-content::-webkit-scrollbar {
  width: 6px;
}

.setting-content::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.setting-content::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.setting-content::-webkit-scrollbar-thumb:hover {
  background: #ced4da;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    min-width: auto;
    max-width: none;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 8px 0;
  }
  
  .nav-group {
    display: flex;
    gap: 8px;
    padding: 0 16px;
  }
  
  .menu-item {
    min-width: 100px;
    justify-content: center;
    flex-direction: column;
    padding: 12px 8px;
    border-radius: 8px;
    margin: 0;
  }
  
  .menu-icon {
    margin-right: 0;
    margin-bottom: 4px;
  }
  
  .menu-text {
    font-size: 12px;
    text-align: center;
  }
  
  .nav-footer {
    display: none;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .settings-group {
    padding: 16px;
    margin-bottom: 16px;
  }
}
</style>

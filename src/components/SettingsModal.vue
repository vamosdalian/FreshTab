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
        
        <!-- 分组管理页面 -->
        <div v-if="activeMenu === 'tagManagement'" class="content-section">
          <div class="section-header">
            <h3>分组管理</h3>
            <button @click="showAddGroupModal = true" class="add-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加分组
            </button>
          </div>
          
          <div class="groups-list">
            <div 
              v-for="group in tagGroups" 
              :key="group.id"
              class="group-item"
            >
              <div class="group-header">
                <div class="group-info">
                  <span class="group-emoji">{{ group.emoji }}</span>
                  <div class="group-details">
                    <h4>{{ group.name }}</h4>
                    <span class="tag-count">{{ group.tags.length }} 个标签</span>
                  </div>
                </div>
                <div class="group-actions">
                  <button 
                    @click="editGroupModal(group)"
                    class="edit-btn"
                    title="编辑分组"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    v-if="group.id !== 'default'"
                    @click="deleteGroupConfirm(group.id)"
                    class="delete-btn"
                    title="删除分组"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="group-color-preview" :style="{ backgroundColor: group.themeColor }"></div>
              
              <div class="tags-preview">
                <div 
                  v-for="tag in group.tags.slice(0, 4)" 
                  :key="tag.id"
                  class="tag-preview"
                  :style="{ backgroundColor: tag.backgroundColor }"
                >
                  <span v-if="tag.iconType === 'emoji'">{{ tag.iconValue }}</span>
                  <span v-else-if="tag.iconType === 'text'">{{ tag.iconValue }}</span>
                  <img 
                    v-else-if="tag.iconType === 'favicon'"
                    :src="getFaviconUrl(tag.url)"
                    :alt="tag.name"
                    @error="$event.target.style.display='none'"
                  />
                </div>
                <span v-if="group.tags.length > 4" class="more-count">+{{ group.tags.length - 4 }}</span>
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
    
    <!-- 添加/编辑分组模态框 -->
    <div v-if="showAddGroupModal || showEditGroupModal" class="group-modal-overlay" @click="closeGroupModal">
      <div class="group-modal-content" @click.stop>
        <div class="group-modal-header">
          <h3>{{ showEditGroupModal ? '编辑分组' : '添加分组' }}</h3>
          <button @click="closeGroupModal" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="group-modal-body">
          <div class="form-group">
            <label>分组名称</label>
            <input 
              v-model="groupForm.name" 
              type="text" 
              placeholder="输入分组名称"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>选择Emoji</label>
            <EmojiPicker 
              :selected-emoji="groupForm.emoji"
              @select-emoji="handleSelectGroupEmoji"
            />
          </div>
          
          <div class="form-group">
            <label>主题颜色</label>
            <div class="color-selector">
              <div 
                v-for="color in themeColors" 
                :key="color"
                @click="groupForm.themeColor = color"
                :class="['color-option', { selected: groupForm.themeColor === color }]"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="group-modal-footer">
          <button @click="closeGroupModal" class="cancel-btn">取消</button>
          <button @click="saveGroup" class="save-btn">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTagGroups } from '../composables/useTagGroups'
import EmojiPicker from './EmojiPicker.vue'

export default {
  name: 'SettingsModal',
  components: {
    EmojiPicker
  },
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
  setup() {
    const { 
      tagGroups, 
      emojiOptions, 
      themeColors, 
      addGroup, 
      editGroup, 
      deleteGroup,
      getFaviconUrl 
    } = useTagGroups()
    
    return {
      tagGroups,
      emojiOptions,
      themeColors,
      addGroup,
      editGroup,
      deleteGroup,
      getFaviconUrl
    }
  },
  data() {
    return {
      activeMenu: 'settings',
      showAddGroupModal: false,
      showEditGroupModal: false,
      editingGroupId: null,
      groupForm: {
        name: '',
        emoji: '📁',
        themeColor: '#667eea'
      },
      menuItems: [
        {
          id: 'settings',
          name: '常规设置',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'
        },
        {
          id: 'tagManagement',
          name: '分组管理',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 2v4"></path><path d="M17 2v4"></path><path d="M14 14l-1-1"></path><circle cx="12" cy="12" r="2"></circle></svg>'
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
    },
    
    // 分组管理方法
    editGroupModal(group) {
      this.editingGroupId = group.id
      this.groupForm = {
        name: group.name,
        emoji: group.emoji,
        themeColor: group.themeColor
      }
      this.showEditGroupModal = true
    },
    
    closeGroupModal() {
      this.showAddGroupModal = false
      this.showEditGroupModal = false
      this.editingGroupId = null
      this.groupForm = {
        name: '',
        emoji: '📁',
        themeColor: '#667eea'
      }
    },
    
    async saveGroup() {
      if (!this.groupForm.name.trim()) {
        alert('请输入分组名称')
        return
      }
      
      try {
        if (this.showEditGroupModal) {
          await this.editGroup(this.editingGroupId, this.groupForm)
        } else {
          await this.addGroup(this.groupForm.name, this.groupForm.emoji, this.groupForm.themeColor)
        }
        this.closeGroupModal()
      } catch (error) {
        console.error('保存分组失败:', error)
        alert('保存失败，请重试')
      }
    },
    
    async deleteGroupConfirm(groupId) {
      await this.deleteGroup(groupId)
    },
    
    // emoji相关方法
    handleSelectGroupEmoji(emoji) {
      this.groupForm.emoji = emoji
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

/* 分组管理样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.add-button:hover {
  background: #0056b3;
}

.groups-list {
  display: grid;
  gap: 16px;
}

.group-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.group-item:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-emoji {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.group-details h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.tag-count {
  font-size: 12px;
  color: #6c757d;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: #f8f9fa;
  color: #6c757d;
}

.edit-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.delete-btn {
  background: #f8f9fa;
  color: #dc3545;
}

.delete-btn:hover {
  background: #f5c6cb;
  color: #721c24;
}

.group-color-preview {
  height: 4px;
  border-radius: 2px;
  margin: 8px 0;
}

.tags-preview {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.tag-preview {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tag-preview img {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.more-count {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

/* 分组模态框样式 */
.group-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.group-modal-content {
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.group-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.group-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.group-modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.color-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.1);
}

.group-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #545b62;
}

.save-btn {
  background: #007bff;
  color: white;
}

.save-btn:hover {
  background: #0056b3;
}
</style>

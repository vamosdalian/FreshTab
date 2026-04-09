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
            <button v-for="item in menuItems" :key="item.id" @click="activeMenu = item.id"
              :class="['menu-item', { active: activeMenu === item.id }]">
              <span class="menu-icon" v-html="item.icon"></span>
              <span class="menu-text">{{ item.name }}</span>
              <span v-if="item.tag" class="menu-tag">{{ item.tag }}</span>
            </button>
          </div>

          <div class="nav-footer">
            <div class="version-info">{{ CURRENT_VERSION }}</div>
          </div>
        </nav>
      </div>

      <!-- 右侧内容区域 -->
      <div class="setting-content">
        <!-- 设置页面 -->
        <div v-if="activeMenu === 'settings'" class="content-section">

          <!-- 标签页 -->
          <div class="settings-group">
            <h3>标签页</h3>
            <div class="setting-row">
              <span class="setting-label">显示区域宽度</span>
              <div class="range-control">
                <input type="range" min="300" :max="getMaxDisplayWidth()" :value="settings.displayWidth"
                  @input="updateDisplayWidth" class="setting-range">
                <span class="range-value">
                  {{ settings.displayWidth }}px
                  ({{ Math.round((settings.displayWidth / windowWidth) * 100) }}%)
                </span>
              </div>
            </div>
            <div class="setting-row">
              <span class="setting-label">每行显示个数</span>
              <select class="setting-select" :value="settings.columnsPerRow"
                @change="updateSetting('columnsPerRow', Number(($event.target as HTMLSelectElement).value))">
                <option v-for="n in getMaxColumnsOptions()" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </div>
            <div class="setting-row">
              <span class="setting-label">标签大小</span>
              <select class="setting-select" :value="settings.bookmarkSize"
                @change="updateSetting('bookmarkSize', ($event.target as HTMLSelectElement).value)">
                <option value="large">大</option>
                <option value="medium">中</option>
                <option value="small">小</option>
              </select>
            </div>
          </div>

          <!-- 日期时间 -->
          <div class="settings-group">
            <h3>日期时间</h3>
            <div class="setting-row">
              <span class="setting-label">显示时间</span>
              <label class="toggle-switch">
                <input type="checkbox" :checked="settings.showTime"
                  @change="updateSetting('showTime', ($event.target as HTMLInputElement).checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span class="setting-label">显示日期</span>
              <label class="toggle-switch">
                <input type="checkbox" :checked="settings.showDate"
                  @change="updateSetting('showDate', ($event.target as HTMLInputElement).checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <span class="setting-label">时间格式</span>
              <select class="setting-select" :value="settings.timeFormat"
                @change="updateSetting('timeFormat', ($event.target as HTMLSelectElement).value)">
                <option value="24h">24小时制</option>
                <option value="12h">12小时制</option>
              </select>
            </div>
          </div>

          <!-- 主题切换 -->
          <div class="settings-group">
            <h3>主题切换</h3>
            <div class="setting-row">
              <span class="setting-label">外观主题</span>
              <select class="setting-select" :value="settings.theme"
                @change="updateSetting('theme', ($event.target as HTMLSelectElement).value)">
                <option value="auto">跟随系统</option>
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
              </select>
            </div>
            <div class="setting-row theme-status-row">
              <span class="setting-label">当前状态</span>
              <span class="theme-status">
                <span class="status-indicator" :class="{ dark: settings.isDarkMode }"></span>
                {{ getThemeStatusText() }}
              </span>
            </div>
            <div class="theme-preview-row">
              <div class="theme-preview-container">
                <div class="theme-preview-item" :class="{ active: settings.theme === 'auto' }"
                  @click="updateTheme('auto')">
                  <div class="preview-card auto-preview">
                    <div class="preview-header">
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                    </div>
                    <div class="preview-content">
                      <div class="preview-text"></div>
                      <div class="preview-text short"></div>
                    </div>
                  </div>
                  <span class="preview-label">跟随系统</span>
                </div>

                <div class="theme-preview-item" :class="{ active: settings.theme === 'light' }"
                  @click="updateTheme('light')">
                  <div class="preview-card light-preview">
                    <div class="preview-header">
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                    </div>
                    <div class="preview-content">
                      <div class="preview-text"></div>
                      <div class="preview-text short"></div>
                    </div>
                  </div>
                  <span class="preview-label">浅色主题</span>
                </div>

                <div class="theme-preview-item" :class="{ active: settings.theme === 'dark' }"
                  @click="updateTheme('dark')">
                  <div class="preview-card dark-preview">
                    <div class="preview-header">
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                      <div class="preview-dot"></div>
                    </div>
                    <div class="preview-content">
                      <div class="preview-text"></div>
                      <div class="preview-text short"></div>
                    </div>
                  </div>
                  <span class="preview-label">深色主题</span>
                </div>
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
            <div v-for="group in tagGroups" :key="group.id" class="group-item">
              <div class="group-header">
                <div class="group-info">
                  <span class="group-emoji">{{ group.emoji }}</span>
                  <div class="group-details">
                    <div class="group-title-row">
                      <h4>{{ group.name }}</h4>
                      <button @click="editGroupModal(group)" class="edit-btn inline-edit-btn" title="编辑分组">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                    <span class="tag-count">{{ Array.isArray(group.tags) ? group.tags.length : 0 }} 个标签</span>
                  </div>
                </div>
                <div class="group-actions">
                  <button v-if="group.id !== 'default'" @click="deleteGroupConfirm(group.id)" class="delete-btn"
                    title="删除分组">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="group-color-preview" :style="{ backgroundColor: group.themeColor }"></div>

              <!-- 标签列表显示 -->
              <div v-if="Array.isArray(group.tags) && group.tags.length > 0" class="tags-list">
                <div v-for="tag in group.tags" :key="tag.id" class="tag-list-item">
                  <div class="tag-list-icon">
                    <span v-if="tag.iconType === 'emoji'">{{ tag.iconValue }}</span>
                    <span v-else-if="tag.iconType === 'text'">{{ tag.iconValue }}</span>
                    <img v-else-if="tag.iconType === 'favicon'" :src="getFaviconUrl(tag.url,tag)" :alt="tag.name"
                      @error="($event.target as HTMLImageElement).style.display = 'none'" />
                    <span v-else>🔗</span>
                  </div>
                  <span class="tag-list-name">{{ tag.name }}</span>
                  <div class="tag-list-actions">
                    <button @click="editTagModal(group.id, tag)" class="edit-btn" title="编辑标签">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button @click="deleteTagConfirm(group.id, tag.id)" class="delete-btn" title="删除标签">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- 添加标签按钮 -->
                <button @click="addTagModal(group.id)" class="add-tag-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加标签
                </button>
              </div>

              <!-- 空状态 -->
              <div v-else class="empty-tags-state">
                <button @click="addTagModal(group.id)" class="add-first-tag-button">
                  添加第一个标签
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 壁纸页面 -->
        <div v-if="activeMenu === 'wallpaper'" class="content-section">
          <div class="settings-group">
            <h3>壁纸设置</h3>
            <div class="setting-row">
              <span class="setting-label">壁纸模式</span>
              <select class="setting-select" :value="wallpaperSettings.wallpaperMode"
                @change="updateWallpaperSetting(($event.target as HTMLSelectElement).value)">
                <option v-for="option in wallpaperModeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Bing每日一图模式 -->
            <div v-if="wallpaperSettings.wallpaperMode === 'bing'" class="wallpaper-mode-content">
              <div class="setting-row">
                <span class="setting-label">自动更新</span>
                <span class="setting-desc">每天自动获取Bing精美壁纸</span>
              </div>
              <div class="wallpaper-actions">
                <button class="action-btn primary" @click="updateBingWallpaper" :disabled="wallpaperLoading">
                  <svg v-if="!wallpaperLoading" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                  </svg>
                  <span v-if="wallpaperLoading" class="loading-spinner"></span>
                  {{ wallpaperLoading ? '获取中...' : '立即更新' }}
                </button>
              </div>
            </div>

            <!-- 固定壁纸模式 -->
            <div v-if="wallpaperSettings.wallpaperMode === 'fixed'" class="wallpaper-mode-content">
              <div class="setting-row">
                <span class="setting-label">选择壁纸</span>
                <span class="setting-desc">从历史Bing壁纸中选择喜欢的图片</span>
              </div>
              <div class="wallpaper-grid" v-if="fixedWallpapers.length > 0">
                <div v-for="wallpaper in fixedWallpapers" :key="wallpaper.date" class="wallpaper-item"
                  :class="{ active: fixedWallpaperDate === wallpaper.date }" @click="selectFixedWallpaper(wallpaper)">
                  <img :src="wallpaper.previewUrl" :alt="wallpaper.date" />
                </div>
              </div>
              <div class="wallpaper-actions">
                <button v-if="fixedWallpapers.length > 0 && currentPage >= 0" @click="loadMoreWallpapers"
                  class="action-btn" :disabled="wallpaperLoading">
                  {{ wallpaperLoading ? '加载中...' : '加载更多' }}
                </button>
              </div>
            </div>

            <!-- 本地上传模式 -->
            <div v-if="wallpaperSettings.wallpaperMode === 'local'" class="wallpaper-mode-content">
              <div class="setting-row">
                <span class="setting-label">上传图片</span>
                <span class="setting-desc">选择本地图片作为壁纸（建议4K分辨率，最大5MB）</span>
              </div>
              <div class="upload-area">
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileUpload" style="display: none" />
                <div class="upload-box" @click="fileInput?.click()" @dragover.prevent
                  @drop.prevent="handleFileDrop">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <p v-if="!wallpaperLoading">点击选择图片或拖拽到此处</p>
                  <p v-else>上传中...</p>
                </div>
              </div>
            </div>

            <!-- 壁纸预览 -->
            <div class="wallpaper-preview">
              <div class="setting-row">
                <span class="setting-label">当前壁纸预览</span>
                <button @click="applyWallpaperSettings" class="apply-btn">应用</button>
              </div>
              <div class="preview-container">
                <div v-if="previewImageLoading && wallpaperPreviewUrl" class="preview-loading-overlay">
                  <span class="loading-spinner preview-loading-spinner"></span>
                </div>
                <img
                  v-if="wallpaperPreviewUrl"
                  :src="wallpaperPreviewUrl"
                  alt="当前壁纸"
                  class="preview-image"
                  :class="{ 'preview-image-loading': previewImageLoading }"
                  @load="handlePreviewImageLoad"
                  @error="handlePreviewImageError"
                />
                <div v-else class="empty-state">
                  <p>暂无壁纸预览</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于页面 -->
        <div v-if="activeMenu === 'about'" class="content-section">
          <div class="about-container">
            <!-- 应用信息 -->
            <div class="about-section app-info">
              <div class="app-details">
                <h2 class="app-title">FreshTab</h2>
                <p class="app-version">版本 {{ CURRENT_VERSION }}</p>
                <p class="app-description">
                  一个简洁优雅的浏览器新标签页扩展，让您的浏览体验更加高效和美观。
                </p>
              </div>
            </div>

            <!-- 功能特性 -->
            <div class="about-section features">
              <h3>功能特性</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                      <path d="M7 2v4"></path>
                      <path d="M17 2v4"></path>
                    </svg>
                  </div>
                  <div class="feature-content">
                    <h4>智能分组</h4>
                    <p>支持自定义分组管理，让您的书签井井有条</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                  <div class="feature-content">
                    <h4>快速搜索</h4>
                    <p>支持多搜索引擎，一键切换，搜索更便捷</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                  </div>
                  <div class="feature-content">
                    <h4>个性壁纸</h4>
                    <p>丰富的壁纸选择，打造属于您的专属桌面</p>
                  </div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </div>
                  <div class="feature-content">
                    <h4>时间显示</h4>
                    <p>实时时间和日期显示，支持多种格式选择</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 开发信息 -->
            <div class="about-section developer-info">
              <h3>开发信息</h3>
              <div class="developer-content">
                <div class="info-row">
                  <span class="info-label">开发者：</span>
                  <span class="info-value">vamosdalian</span>
                </div>
                <div class="info-row">
                  <span class="info-label">发布日期：</span>
                  <span class="info-value">2025年</span>
                </div>
                <div class="info-row">
                  <span class="info-label">许可证：</span>
                  <span class="info-value">MIT License</span>
                </div>
              </div>
            </div>

            <!-- 联系方式 -->
            <div class="about-section contact-info">
              <h3>联系我们</h3>
              <div class="contact-content">
                <p>如果您在使用过程中遇到问题或有任何建议，欢迎通过以下方式联系我们：</p>
                <div class="contact-links">
                  <a href="https://github.com/vamosdalian/FreshTab" class="contact-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path
                        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
                      </path>
                    </svg>
                    GitHub
                  </a>
                  <a href="mailto:elve960520@gmail.com" class="contact-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    邮箱反馈
                  </a>
                </div>
              </div>
            </div>

            <!-- 版权信息 -->
            <div class="about-section copyright">
              <div class="copyright-content">
                <p>&copy; 2025 FreshTab Team. All rights reserved.</p>
                <p class="thanks-text">感谢您选择 FreshTab，让我们一起打造更美好的浏览体验！</p>
              </div>
            </div>
          </div>
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
            <input v-model="groupForm.name" type="text" placeholder="输入分组名称" class="form-input" />
          </div>

          <div class="form-group">
            <label>选择图标</label>
            <button type="button" @click="showEmojiPicker = true" class="emoji-select-button">
              <span class="emoji-preview">{{ groupForm.emoji || '📁' }}</span>
              <span class="emoji-select-text">点击选择 Emoji</span>
            </button>
          </div>

          <div class="form-group">
            <label>主题颜色</label>
            <div class="color-selector">
              <div v-for="color in themeColors" :key="color" @click="groupForm.themeColor = color"
                :class="['color-option', { selected: groupForm.themeColor === color }]"
                :style="{ backgroundColor: color }"></div>
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

  <!-- Emoji选择弹窗 -->
  <EmojiPicker v-if="showEmojiPicker" :site-name="groupForm.name" :site-url="''" @select-emoji="handleSelectGroupEmoji"
    @close="showEmojiPicker = false" />

  <!-- 标签编辑模态框 -->
  <TagModal v-if="showTagModal" :isOpen="showTagModal" :tag="currentEditingTag || undefined" :themeColors="themeColors"
    @close="closeTagModal" @save="saveTag" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { TagGroup, Tag } from '../types/tagGroup'
import { useTagGroupsStore } from '../stores/tagGroupsStore.ts'
import EmojiPicker from './EmojiPicker.vue'
import TagModal from './TagModal.vue'
import { CURRENT_VERSION } from '../services/version'
import { useSettingsStore } from '../stores/settingsStore'
import { useToast } from '../composables/useToast'
import { getFromStorage, setToStorage } from '../services/browserStorage.js'
const { log, error } = useToast()

const settingsStore = useSettingsStore()
const tagGroupsStore = useTagGroupsStore()

const tagGroups = computed(() => tagGroupsStore.tagGroups.groups || [])
const themeColors = computed(() => [
  '#667eea', '#764ba2', '#ff6b6b', '#f7b733', '#4ecdc4', '#556270',
  '#c7f464', '#ff9a8b', '#dfe6e9', '#2d3436', '#00cec9', '#0984e3'
])

const settings = computed(() => settingsStore.settings as any) // TODO: Add proper settings type
const wallpaperSettings = reactive<{
  wallpaperMode?: string
  wallpaperUrl?: string
  wallpaperDate?: string
  wallpaperLocalPath?: string
  fixedWallpaperDate?: string
}>({})
const wallpaperLoading: Ref<boolean> = ref(false)
const previewImageLoading: Ref<boolean> = ref(false)
const fixedWallpapers: Ref<Array<{ date: string; previewUrl: string; fullUrl: string }>> = ref([])
const currentPage: Ref<number> = ref(0)
const fixedWallpaperDate = ref("")
const wallpaperPreviewUrl = computed(() => (
  wallpaperSettings.wallpaperMode === 'local'
    ? wallpaperSettings.wallpaperLocalPath || wallpaperSettings.wallpaperUrl || ''
    : wallpaperSettings.wallpaperUrl || ''
))

const handlePreviewImageLoad = (): void => {
  previewImageLoading.value = false
}

const handlePreviewImageError = (): void => {
  previewImageLoading.value = false
}

watch(wallpaperPreviewUrl, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    previewImageLoading.value = true
  } else if (!newUrl) {
    previewImageLoading.value = false
  }
})

// Define emits
const emit = defineEmits(['close'])

// Reactive data
const activeMenu = ref('settings')
const showAddGroupModal = ref(false)
const showEditGroupModal = ref(false)
const showEmojiPicker = ref(false)
const showTagModal = ref(false)
const editingGroupId: Ref<string> = ref('')
const currentGroupId: Ref<string | null> = ref(null)
const currentEditingTag: Ref<Tag | null> = ref(null)
const windowWidth = ref(window.innerWidth)
const fileInput = ref<HTMLInputElement>()

const groupForm = reactive({
  name: '',
  emoji: '📁',
  themeColor: '#667eea'
})

interface MenuItem {
  id: string
  name: string
  icon: string
  tag?: string
}

const menuItems: MenuItem[] = [
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
    id: 'about',
    name: '关于我们',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  }
]

// Wallpaper mode options
const wallpaperModeOptions = [
  { value: 'bing', label: 'Bing每日一图' },
  { value: 'fixed', label: '固定壁纸' },
  { value: 'local', label: '本地上传' }
]

// Methods
const handleOverlayClick = (): void => {
  emit('close')
}

const updateTheme = (theme: string): void => {
  if (theme === 'auto') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    settingsStore.updateSettings({ "theme": 'auto', "isDarkMode": systemPrefersDark })
  } else {
    settingsStore.updateSettings({ "theme": theme, "isDarkMode": theme === 'dark' })
  }
}

const updateSetting = async (key: string, value: any): Promise<void> => {
  await settingsStore.updateSettings({ [key]: value })
}

// 分组管理方法
const editGroupModal = (group: TagGroup): void => {
  editingGroupId.value = group.id
  groupForm.name = group.name
  groupForm.emoji = group.emoji
  groupForm.themeColor = group.themeColor
  showEditGroupModal.value = true
}

const closeGroupModal = (): void => {
  showAddGroupModal.value = false
  showEditGroupModal.value = false
  showEmojiPicker.value = false
  editingGroupId.value = ""
  groupForm.name = ''
  groupForm.emoji = '📁'
  groupForm.themeColor = '#667eea'
}

const saveGroup = async () => {
  if (!groupForm.name.trim()) {
    return
  }

  try {
    if (showEditGroupModal.value) {
      console.log('[setting] update group:', groupForm)
      await tagGroupsStore.updateGroup(editingGroupId.value, groupForm)
    } else {
      console.log('[setting] Adding new group:', groupForm)
      await tagGroupsStore.addGroup(groupForm)
    }
    closeGroupModal()
  } catch (error) {
    console.error('保存分组失败:', error)
  }
}

const deleteGroupConfirm = async (groupId: string): Promise<void> => {
  console.log('[setting] delete group:', groupId)
  await tagGroupsStore.removeGroup(groupId)
}

// 标签管理方法
const addTagModal = (groupId: string): void => {
  currentGroupId.value = groupId
  currentEditingTag.value = null
  showTagModal.value = true
}

const editTagModal = (groupId: string, tag: Tag): void => {
  currentGroupId.value = groupId
  currentEditingTag.value = tag
  showTagModal.value = true
}

const closeTagModal = (): void => {
  showTagModal.value = false
  currentEditingTag.value = null
  currentGroupId.value = null
}

const saveTag = async (tagData: Partial<Tag>): Promise<void> => {
  try {
    if (currentEditingTag.value) {
      await tagGroupsStore.updateTag(currentGroupId.value!, currentEditingTag.value.id, tagData)
    } else {
      await tagGroupsStore.addTag(currentGroupId.value!, tagData)
    }
    closeTagModal()
  } catch (error) {
    console.error('保存标签失败:', error)
  }
}

const deleteTagConfirm = async (groupId: string, tagId: string): Promise<void> => {
  await tagGroupsStore.removeTag(groupId, tagId)
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

// emoji相关方法
const handleSelectGroupEmoji = (emoji: string): void => {
  groupForm.emoji = emoji
  showEmojiPicker.value = false
}

// 宽度设置方法
const updateDisplayWidth = (event: Event): void => {
  const width = Number((event.target as HTMLInputElement).value)
  updateSetting('displayWidth', width)
}

// 计算最大显示宽度（窗口的90%）
const getMaxDisplayWidth = (): number => {
  const maxWidth = Math.floor(windowWidth.value * 0.9)
  return Math.max(maxWidth, 800) // 最小保证800px
}

// 计算最大列数选项
const getMaxColumnsOptions = (): number[] => {
  const tagSizes = {
    small: 80,   // 小标签宽度
    medium: 100, // 中标签宽度
    large: 120   // 大标签宽度
  }
  const tagWidth = tagSizes[settings.value.bookmarkSize] || 100
  const gap = 16 // 1rem = 16px
  const displayWidth = settings.value.displayWidth || 800

  // 计算可以放置的标签数量
  const maxColumns = Math.floor((displayWidth + gap) / (tagWidth + gap))
  const actualMax = Math.max(1, Math.min(maxColumns, 15)) // 最少1个，最多15个

  // 生成选项数组
  const options: number[] = []
  for (let i = 1; i <= actualMax; i++) {
    options.push(i)
  }

  // 确保当前值在范围内
  if (settings.value.columnsPerRow > actualMax) {
    updateSetting('columnsPerRow', actualMax)
  }

  return options
}

// 获取主题状态文字
const getThemeStatusText = (): string => {
  if (settings.value.theme === 'auto') {
    return settings.value.isDarkMode ? '系统深色模式' : '系统浅色模式'
  } else if (settings.value.theme === 'light') {
    return '浅色模式'
  } else {
    return '深色模式'
  }
}

const updateBingWallpaper = (): void => {
  wallpaperLoading.value = true
  previewImageLoading.value = true

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  fetch(`https://bing.ee123.net/img/4k?type=json&date=${today}`).
    then(response => response.json()).
    then(data => {
      if (data && data.imgurl) {
        const img = new Image()
        img.onload = () => {
          wallpaperSettings.wallpaperUrl = data.imgurl
          wallpaperSettings.wallpaperDate = today
        }
        img.onerror = () => {
          previewImageLoading.value = false
          console.error('Failed to preload Bing wallpaper image:', data.imgurl)
        }
        img.src = data.imgurl
      } else {
        previewImageLoading.value = false
        console.error('No image URL found in Bing response:', data)
      }
      wallpaperLoading.value = false
    }).catch(err => {
      previewImageLoading.value = false
      console.error('Error fetching Bing wallpaper:', err)
      wallpaperLoading.value = false
    })
}

// 壁纸相关方法
const updateWallpaperSetting = (value: string): void => {
  wallpaperSettings.wallpaperMode = value
  if (value === 'fixed') {
    getFixedWallpapers(0)
  } else {
    fixedWallpaperDate.value = ""
  }
}

const handleFileUpload = (event: Event): void => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    uploadLocalWallpaper(file)
  }
}

const handleFileDrop = (event: DragEvent): void => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    uploadLocalWallpaper(files[0])
  }
}

const uploadLocalWallpaper = async (file: File): Promise<void> => {
  try {
    if (!file || !file.type.startsWith('image/')) {
      error('请选择有效的图片文件')
      return
    }

    wallpaperLoading.value = true
    previewImageLoading.value = true

    // 创建本地 URL
    const localUrl = URL.createObjectURL(file)
    wallpaperSettings.wallpaperMode = 'local'
    wallpaperSettings.wallpaperLocalPath = localUrl
    wallpaperSettings.wallpaperUrl = localUrl
    wallpaperSettings.fixedWallpaperDate = ''
    wallpaperLoading.value = false
  } catch (err) {
    previewImageLoading.value = false
    wallpaperLoading.value = false
  }
}

const selectFixedWallpaper = async (wallpaper: { date: string; fullUrl: string }): Promise<void> => {
  console.log("select fixed paper:", wallpaper)
  wallpaperLoading.value = true
  previewImageLoading.value = true
  fixedWallpaperDate.value = wallpaper.date
  fetch(wallpaper.fullUrl).
    then(response => response.json()).
    then(data => {
      if (data && data.imgurl) {
        const img = new Image()
        img.onload = () => {
          wallpaperSettings.wallpaperMode = 'fixed'
          wallpaperSettings.fixedWallpaperDate = wallpaper.date
          wallpaperSettings.wallpaperUrl = data.imgurl
        }
        img.onerror = () => {
          previewImageLoading.value = false
          console.error('Failed to preload Bing wallpaper image:', data.imgurl)
        }
        img.src = data.imgurl
      } else {
        previewImageLoading.value = false
        console.error('No image URL found in Bing response:', data)
      }
      wallpaperLoading.value = false
    }).catch(err => {
      previewImageLoading.value = false
      console.error('Error fetching Bing wallpaper:', err)
      wallpaperLoading.value = false
    })
}

const getFixedWallpapers = async (page: number = 0): Promise<void> => {
  const wallpapersPerPage = 10
  try {
    const wallpapers: Array<{ date: string; previewUrl: string; fullUrl: string }> = []
    const today = new Date()

    for (let i = 0; i < wallpapersPerPage; i++) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() - (page * wallpapersPerPage + i))
      const dateStr = targetDate.toISOString().split('T')[0].replace(/-/g, '')
      wallpapers.push({
        date: dateStr,
        previewUrl: `https://bing.ee123.net/img/?date=${dateStr}&size=320x240`,
        fullUrl: `https://bing.ee123.net/img/?date=${dateStr}&size=4k&type=json`
      })
    }

    if (page === 0) {
      fixedWallpapers.value = wallpapers
    } else {
      fixedWallpapers.value.push(...wallpapers)
    }

    currentPage.value = page
  } catch (err) {
    throw new Error('fetch paper error: ' + err.message)
  } finally {
    wallpaperLoading.value = false
  }
}

const loadMoreWallpapers = (): void => {
  getFixedWallpapers(currentPage.value + 1)
}

const applyWallpaperSettings = async (): Promise<void> => {
  await setToStorage({
    wallpaperSettings: {
      wallpaperMode: wallpaperSettings.wallpaperMode || 'bing',
      wallpaperUrl: wallpaperSettings.wallpaperUrl || '',
      wallpaperDate: wallpaperSettings.wallpaperDate || '',
      wallpaperLocalPath: wallpaperSettings.wallpaperLocalPath || '',
      fixedWallpaperDate: wallpaperSettings.fixedWallpaperDate || fixedWallpaperDate.value || ''
    }
  })
  log('壁纸设置已应用')
}

// Lifecycle hooks
onMounted(async () => {
  const result = await getFromStorage(['wallpaperSettings'])
  const savedWallpaperSettings = result.wallpaperSettings || {}

  wallpaperSettings.wallpaperMode = savedWallpaperSettings.wallpaperMode || settings.value.wallpaperMode || 'bing'
  wallpaperSettings.wallpaperUrl = savedWallpaperSettings.wallpaperUrl || settings.value.wallpaperPath || ''
  wallpaperSettings.wallpaperDate = savedWallpaperSettings.wallpaperDate || ''
  wallpaperSettings.wallpaperLocalPath = savedWallpaperSettings.wallpaperLocalPath || ''
  wallpaperSettings.fixedWallpaperDate = savedWallpaperSettings.fixedWallpaperDate || ''
  fixedWallpaperDate.value = wallpaperSettings.fixedWallpaperDate || ""

  if (wallpaperSettings.wallpaperMode === 'fixed') {
    await getFixedWallpapers(0)
  }

  console.log('[setting] Tag groups loaded:', tagGroups.value)
  console.log('[setting] Settings loaded:', settings.value)
})
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

.toggle-switch input:checked+.toggle-slider {
  background-color: #28a745;
}

.toggle-switch input:checked+.toggle-slider:before {
  transform: translateX(20px);
}

.range-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-range {
  width: 300px;
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

.range-value {
  color: #6c757d;
  font-size: 12px;
  min-width: 80px;
  text-align: right;
}

/* 主题状态样式 */
.theme-status-row {
  background: #f8f9fa;
  border-radius: 6px;
  margin: 8px 0;
  padding: 12px 16px !important;
}

.theme-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffc107;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #dee2e6;
  transition: all 0.3s ease;
}

.status-indicator.dark {
  background: #6f42c1;
}

/* 主题预览样式 */
.theme-preview-row {
  padding: 20px 0 0 0;
  border-bottom: none;
}

.theme-preview-container {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.theme-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.theme-preview-item:hover {
  background: #f8f9fa;
}

.theme-preview-item.active {
  border-color: #007bff;
  background: #f8f9fa;
}

.preview-card {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.preview-header {
  height: 16px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
}

.preview-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.preview-content {
  padding: 4px 6px;
  height: calc(100% - 16px);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.preview-text {
  height: 6px;
  border-radius: 2px;
}

.preview-text.short {
  width: 60%;
}

/* 浅色主题预览 */
.light-preview {
  background: #ffffff;
}

.light-preview .preview-header {
  background: #f8f9fa;
}

.light-preview .preview-dot {
  background: #dee2e6;
}

.light-preview .preview-content {
  background: #ffffff;
}

.light-preview .preview-text {
  background: #e9ecef;
}

/* 深色主题预览 */
.dark-preview {
  background: #2d3748;
}

.dark-preview .preview-header {
  background: #4a5568;
}

.dark-preview .preview-dot {
  background: #718096;
}

.dark-preview .preview-content {
  background: #2d3748;
}

.dark-preview .preview-text {
  background: #4a5568;
}

/* 自动主题预览（渐变效果） */
.auto-preview {
  background: linear-gradient(135deg, #ffffff 50%, #2d3748 50%);
}

.auto-preview .preview-header {
  background: linear-gradient(135deg, #f8f9fa 50%, #4a5568 50%);
}

.auto-preview .preview-dot:nth-child(1) {
  background: #dee2e6;
}

.auto-preview .preview-dot:nth-child(2) {
  background: linear-gradient(135deg, #dee2e6 50%, #718096 50%);
}

.auto-preview .preview-dot:nth-child(3) {
  background: #718096;
}

.auto-preview .preview-content {
  background: linear-gradient(135deg, #ffffff 50%, #2d3748 50%);
}

.auto-preview .preview-text {
  background: linear-gradient(135deg, #e9ecef 50%, #4a5568 50%);
}

.preview-label {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
  text-align: center;
}

.theme-preview-item.active .preview-label {
  color: #007bff;
  font-weight: 600;
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

.group-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-edit-btn {
  padding: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6c757d;
  opacity: 0;
}

.group-item:hover .inline-edit-btn {
  opacity: 1;
}

.inline-edit-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.tag-count {
  font-size: 12px;
  color: #6c757d;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
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

/* 标签列表样式 */
.tags-list {
  margin-top: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.tag-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.tag-list-item:last-child {
  border-bottom: none;
}

.tag-list-item:hover {
  background-color: #f8f9fa;
}

.tag-list-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  font-size: 14px;
  flex-shrink: 0;
}

.tag-list-icon img {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.tag-list-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.tag-list-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tag-list-item:hover .tag-list-actions {
  opacity: 1;
}

.add-tag-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 0 0 8px 8px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.add-tag-button:hover {
  background: #e9ecef;
  color: #495057;
  border-color: #adb5bd;
}

.empty-tags-state {
  text-align: center;
  padding: 24px 16px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 16px;
}

.empty-tags-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.add-first-tag-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.add-first-tag-button:hover {
  background: #0056b3;
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

.cancel-btn,
.save-btn {
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

.apply-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* Emoji选择器样式 */
.emoji-select-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.emoji-select-button:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.emoji-preview {
  font-size: 1.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.emoji-select-text {
  color: #495057;
  font-size: 0.9rem;
}

/* 关于页面样式 */
.about-container {
  max-width: 600px;
  margin: 0 auto;
}

.about-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.about-section:last-child {
  margin-bottom: 0;
}

/* 应用信息样式 */
.app-info {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
}

.app-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.app-details {
  flex: 1;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 8px 0;
}

.app-version {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 12px 0;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.app-description {
  font-size: 16px;
  color: #495057;
  line-height: 1.6;
  margin: 0;
}

/* 功能特性样式 */
.features h3 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff;
  flex-shrink: 0;
}

.feature-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
}

.feature-content p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

/* 开发信息样式 */
.developer-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
}

.developer-content {
  display: grid;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #495057;
  min-width: 120px;
}

.info-value {
  color: #212529;
  flex: 1;
}

/* 联系方式样式 */
.contact-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 20px 0;
}

.contact-content p {
  font-size: 14px;
  color: #495057;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.contact-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f9fa;
  color: #495057;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.contact-link:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

/* 版权信息样式 */
.copyright {
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.copyright-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6c757d;
}

.copyright-content p:last-child {
  margin-bottom: 0;
}

.thanks-text {
  color: #007bff !important;
  font-weight: 500;
}

/* 壁纸设置样式 */
.wallpaper-mode-content {
  margin-top: 16px;
  padding-top: 16px;
}

.setting-desc {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  display: block;
}

.wallpaper-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.wallpaper-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #f8f9fa;
}

.wallpaper-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wallpaper-item.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.wallpaper-item img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.upload-area {
  margin-top: 16px;
}

.upload-box {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-box:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-box svg {
  color: #6c757d;
  margin-bottom: 12px;
}

.upload-box p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.wallpaper-preview {
  margin-top: 24px;
  border-top: 1px solid #f1f3f4;
  padding-top: 24px;
}

.preview-container {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s ease;
}

.preview-image-loading {
  opacity: 0.35;
}

.preview-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 250, 0.18);
  backdrop-filter: blur(1px);
  z-index: 1;
}

.preview-loading-spinner {
  width: 28px;
  height: 28px;
  border-width: 3px;
  color: #007bff;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>

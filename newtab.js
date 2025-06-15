// 新标签页功能
class FreshTab {
    constructor() {
        this.searchEngines = [
            { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
            { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🅱️' },
            { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', icon: '🟦' },
            { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: '🦆' },
            { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=', icon: '🟣' }
        ];
        this.currentEngine = 'google';
        this.bookmarkGroups = [];
        this.currentEditingGroup = null;
        this.settings = {
            columnsPerRow: 6,
            bookmarkSize: 'medium',
            searchEngine: 'google',
            showTime: true
        };
        
        this.init();
    }

    init() {
        this.updateTime();
        this.loadSettings();
        this.setupSearch();
        this.loadBookmarkGroups();
        this.setupBookmarkModal();
        this.setupSettingsModal();
        this.setupGroupsModal();
        this.updateGreeting();
        
        // 每秒更新时间
        setInterval(() => this.updateTime(), 1000);
        
        // 每分钟更新问候语
        setInterval(() => this.updateGreeting(), 60000);
    }

    // 更新时间显示
    updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');

        // 检查元素是否存在
        if (!timeElement || !dateElement) {
            console.warn('时间或日期元素未找到');
            return;
        }

        // 格式化时间 - 24小时制
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        timeElement.textContent = timeString;

        // 格式化日期
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        
        const weekday = weekdays[now.getDay()];
        const month = months[now.getMonth()];
        const day = now.getDate();
        
        dateElement.textContent = `${weekday}, ${month}${day}日`;
    }

    // 更新问候语
    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const greetingElement = document.getElementById('greeting');
        
        // 检查元素是否存在
        if (!greetingElement) {
            console.warn('问候语元素未找到');
            return;
        }
        
        let greeting;
        if (hour < 6) {
            greeting = '夜深了，早点休息！';
        } else if (hour < 12) {
            greeting = '早上好！';
        } else if (hour < 18) {
            greeting = '下午好！';
        } else {
            greeting = '晚上好！';
        }
        
        greetingElement.textContent = greeting;
    }

    // 更新搜索引擎图标和占位符
    updateSearchEngine() {
        const searchEngineIcon = document.getElementById('search-engine-icon');
        const searchInput = document.getElementById('search-input');
        
        // 检查元素是否存在
        if (!searchEngineIcon || !searchInput) {
            console.warn('搜索引擎图标或搜索输入框元素未找到');
            return;
        }
        
        const currentEngine = this.searchEngines.find(engine => engine.id === this.currentEngine);
        if (currentEngine) {
            searchEngineIcon.textContent = currentEngine.icon;
            searchInput.placeholder = `搜索 ${currentEngine.name} 或输入网址`;
        }
    }

    // 设置搜索功能
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchEngineIcon = document.getElementById('search-engine-icon');
        
        // 检查搜索输入框是否存在
        if (!searchInput) {
            console.warn('搜索输入框元素未找到');
            return;
        }
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        // 点击搜索图标也可以搜索
        if (searchEngineIcon) {
            searchEngineIcon.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }
    }

    // 执行搜索
    performSearch(query) {
        if (!query.trim()) return;
        
        // 检查是否是URL
        if (this.isURL(query)) {
            // 如果是URL，直接打开
            window.location.href = query.startsWith('http') ? query : `https://${query}`;
        } else {
            // 否则使用搜索引擎搜索
            const currentEngine = this.searchEngines.find(engine => engine.id === this.currentEngine);
            if (currentEngine) {
                const searchURL = currentEngine.url + encodeURIComponent(query);
                window.location.href = searchURL;
            }
        }
    }

    // 判断是否是URL
    isURL(string) {
        try {
            new URL(string.startsWith('http') ? string : `https://${string}`);
            return string.includes('.');
        } catch {
            return false;
        }
    }

    // 加载设置
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['settings']);
            this.settings = { ...this.settings, ...(result.settings || {}) };
            this.currentEngine = this.settings.searchEngine || 'google';
        } catch (error) {
            console.log('使用默认设置');
            const savedSettings = localStorage.getItem('freshtab-settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                this.currentEngine = this.settings.searchEngine || 'google';
            }
        }
        this.applySettings();
    }

    // 保存设置
    async saveSettings() {
        try {
            await chrome.storage.sync.set({ settings: this.settings });
        } catch (error) {
            console.log('无法保存到Chrome存储，使用localStorage');
            localStorage.setItem('freshtab-settings', JSON.stringify(this.settings));
        }
    }

    // 应用设置
    applySettings() {
        // 应用所有分组的网格设置
        const grids = document.querySelectorAll('.bookmarks-grid');
        grids.forEach(grid => {
            this.applyBookmarkGridSettings(grid);
        });
        
        // 控制时间显示
        const timeSection = document.getElementById('time-section');
        if (timeSection) {
            // 不改变整个区域的显示，只控制内容的可见性
            const timeContent = timeSection.querySelector('.time-date-display');
            const greetingContent = timeSection.querySelector('.greeting');
            
            if (timeContent) {
                timeContent.style.visibility = this.settings.showTime ? 'visible' : 'hidden';
            }
            if (greetingContent) {
                greetingContent.style.visibility = this.settings.showTime ? 'visible' : 'hidden';
            }
        }
        
        // 更新搜索引擎
        this.updateSearchEngine();
    }

    // 加载书签分组
    async loadBookmarkGroups() {
        try {
            // 从Chrome存储中加载分组
            const result = await chrome.storage.sync.get(['bookmarkGroups']);
            this.bookmarkGroups = result.bookmarkGroups || this.getDefaultBookmarkGroups();
            this.renderBookmarkGroups();
        } catch (error) {
            console.log('使用默认分组');
            this.bookmarkGroups = this.getDefaultBookmarkGroups();
            this.renderBookmarkGroups();
        }
    }

    // 获取默认书签分组
    getDefaultBookmarkGroups() {
        return [
            {
                id: 'default',
                name: '快速访问',
                bookmarks: [
                    { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
                    { name: 'GitHub', url: 'https://github.com', icon: '🐱' },
                    { name: '知乎', url: 'https://www.zhihu.com', icon: '🤔' },
                    { name: '微博', url: 'https://weibo.com', icon: '📝' },
                    { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
                    { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' }
                ]
            }
        ];
    }

    // 渲染书签分组
    renderBookmarkGroups() {
        const container = document.getElementById('bookmarks-groups');
        
        if (!container) {
            console.warn('书签分组容器未找到');
            return;
        }
        
        container.innerHTML = '';
        
        this.bookmarkGroups.forEach(group => {
            const groupElement = this.createGroupElement(group);
            container.appendChild(groupElement);
        });
    }

    // 创建分组元素
    createGroupElement(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'bookmark-group';
        groupDiv.innerHTML = `
            <h3 class="section-title">${group.name}</h3>
            <div class="bookmarks-grid" data-group-id="${group.id}">
                <button class="add-bookmark-btn" data-group-id="${group.id}">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>添加书签</span>
                </button>
            </div>
        `;

        const grid = groupDiv.querySelector('.bookmarks-grid');
        const addBtn = groupDiv.querySelector('.add-bookmark-btn');

        // 渲染分组内的书签
        group.bookmarks.forEach((bookmark, index) => {
            const bookmarkElement = this.createBookmarkElement(bookmark, index, group.id);
            grid.insertBefore(bookmarkElement, addBtn);
        });

        // 添加书签按钮事件
        addBtn.addEventListener('click', () => {
            this.currentEditingGroup = group.id;
            this.showAddBookmarkModal();
        });

        this.applyBookmarkGridSettings(grid);
        return groupDiv;
    }

    // 应用书签网格设置
    applyBookmarkGridSettings(grid) {
        // 移除所有列数类
        grid.classList.remove('columns-3', 'columns-4', 'columns-5', 'columns-6', 'columns-7', 'columns-8');
        // 添加当前设置的列数类
        grid.classList.add(`columns-${this.settings.columnsPerRow}`);
        
        // 移除所有大小类
        grid.classList.remove('size-small', 'size-medium', 'size-large');
        // 添加当前设置的大小类
        grid.classList.add(`size-${this.settings.bookmarkSize}`);
    }

    // 创建书签元素
    createBookmarkElement(bookmark, index, groupId) {
        const element = document.createElement('a');
        element.className = 'bookmark-item';
        element.href = bookmark.url;
        element.target = '_blank';
        
        element.innerHTML = `
            <div class="bookmark-icon">${bookmark.icon}</div>
            <div class="bookmark-name">${bookmark.name}</div>
            <button class="bookmark-delete" data-index="${index}" data-group-id="${groupId}">&times;</button>
        `;

        // 添加删除功能
        const deleteBtn = element.querySelector('.bookmark-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.deleteBookmark(index, groupId);
        });

        return element;
    }

    // 删除书签
    async deleteBookmark(index, groupId) {
        const group = this.bookmarkGroups.find(g => g.id === groupId);
        if (group) {
            group.bookmarks.splice(index, 1);
            await this.saveBookmarkGroups();
            this.renderBookmarkGroups();
        }
    }

    // 保存书签分组到存储
    async saveBookmarkGroups() {
        try {
            await chrome.storage.sync.set({ bookmarkGroups: this.bookmarkGroups });
        } catch (error) {
            console.log('无法保存到Chrome存储，使用localStorage');
            localStorage.setItem('freshtab-bookmark-groups', JSON.stringify(this.bookmarkGroups));
        }
    }

    // 设置书签模态框
    setupBookmarkModal() {
        const modal = document.getElementById('bookmark-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-bookmark');
        const saveBtn = document.getElementById('save-bookmark');
        const nameInput = document.getElementById('bookmark-name');
        const urlInput = document.getElementById('bookmark-url');

        // 检查必要元素是否存在
        if (!modal || !closeBtn || !cancelBtn || !saveBtn || !nameInput || !urlInput) {
            console.warn('书签模态框相关元素未完全找到');
            return;
        }

        // 关闭模态框
        const closeModal = () => {
            modal.classList.remove('show');
            nameInput.value = '';
            urlInput.value = '';
            this.currentEditingGroup = null;
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // 保存书签
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const url = urlInput.value.trim();

            if (name && url && this.currentEditingGroup) {
                this.addBookmarkToGroup(name, url, this.currentEditingGroup);
                closeModal();
            }
        });

        // 回车保存
        [nameInput, urlInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveBtn.click();
                }
            });
        });
    }

    // 显示添加书签模态框
    showAddBookmarkModal() {
        const modal = document.getElementById('bookmark-modal');
        const nameInput = document.getElementById('bookmark-name');
        if (modal && nameInput) {
            modal.classList.add('show');
            nameInput.focus();
        }
    }

    // 添加书签到分组
    async addBookmarkToGroup(name, url, groupId) {
        // 确保URL格式正确
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // 生成图标（使用域名首字母或emoji）
        const icon = this.generateIcon(name);

        const bookmark = { name, url, icon };
        
        const group = this.bookmarkGroups.find(g => g.id === groupId);
        if (group) {
            group.bookmarks.push(bookmark);
            await this.saveBookmarkGroups();
            this.renderBookmarkGroups();
        }
    }

    // 生成书签图标
    generateIcon(name) {
        // 常见网站的emoji映射
        const iconMap = {
            'google': '🔍',
            'github': '🐱',
            'youtube': '📺',
            'facebook': '📘',
            'twitter': '🐦',
            'instagram': '📷',
            'linkedin': '💼',
            'reddit': '🤖',
            'stackoverflow': '📚',
            'medium': '📖',
            'netflix': '🎬',
            'spotify': '🎵',
            'amazon': '📦',
            '知乎': '🤔',
            '微博': '📝',
            '百度': '🔍',
            '淘宝': '🛒',
            '京东': '📦'
        };

        const lowerName = name.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }

        // 如果没有匹配，使用首字母
        return name.charAt(0).toUpperCase();
    }

    // 设置模态框功能
    setupSettingsModal() {
        const modal = document.getElementById('settings-modal');
        const settingsBtn = document.getElementById('settings-btn');
        const closeBtn = document.getElementById('close-settings');
        const cancelBtn = document.getElementById('cancel-settings');
        const saveBtn = document.getElementById('save-settings');
        const columnsSlider = document.getElementById('columns-per-row');
        const columnsValue = document.getElementById('columns-value');
        const bookmarkSizeSelect = document.getElementById('bookmark-size');
        const showTimeCheckbox = document.getElementById('show-time');
        const searchEngineSelect = document.getElementById('search-engine');

        // 检查必要元素是否存在
        if (!modal || !settingsBtn || !closeBtn || !cancelBtn || !saveBtn || !columnsSlider || !columnsValue || !bookmarkSizeSelect || !showTimeCheckbox || !searchEngineSelect) {
            console.warn('设置模态框相关元素未完全找到');
            return;
        }

        // 初始化搜索引擎选项
        this.searchEngines.forEach(engine => {
            const option = document.createElement('option');
            option.value = engine.id;
            option.textContent = `${engine.icon} ${engine.name}`;
            searchEngineSelect.appendChild(option);
        });

        // 设置菜单切换功能
        this.setupSettingsMenu();

        // 打开设置模态框
        settingsBtn.addEventListener('click', () => {
            modal.classList.add('show');
            // 更新UI为当前设置值
            columnsSlider.value = this.settings.columnsPerRow;
            columnsValue.textContent = this.settings.columnsPerRow;
            bookmarkSizeSelect.value = this.settings.bookmarkSize;
            showTimeCheckbox.checked = this.settings.showTime;
            searchEngineSelect.value = this.currentEngine;
            
            // 刷新分组列表
            this.renderGroupsList();
        });

        // 关闭模态框
        const closeModal = () => {
            modal.classList.remove('show');
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // 滑块值实时更新
        columnsSlider.addEventListener('input', (e) => {
            columnsValue.textContent = e.target.value;
        });

        // 保存设置
        saveBtn.addEventListener('click', async () => {
            this.settings.columnsPerRow = parseInt(columnsSlider.value);
            this.settings.bookmarkSize = bookmarkSizeSelect.value;
            this.settings.showTime = showTimeCheckbox.checked;
            this.settings.searchEngine = searchEngineSelect.value;
            this.currentEngine = searchEngineSelect.value;
            
            await this.saveSettings();
            this.applySettings();
            closeModal();
        });
    }

    // 设置菜单切换功能
    setupSettingsMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        const panels = document.querySelectorAll('.settings-panel');

        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('data-tab');
                
                // 更新菜单项状态
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
                
                // 更新面板显示
                panels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = document.getElementById(`${targetTab}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
                
                // 如果切换到分组页面，刷新分组列表
                if (targetTab === 'groups') {
                    this.renderGroupsList();
                }
            });
        });
    }

    // 设置按钮功能（旧方法替换）
    setupSettings() {
        // 这个方法现在被 setupSettingsModal 替代
    }

    // 设置分组管理模态框
    setupGroupsModal() {
        // 编辑分组模态框（旧版本）
        const editModal = document.getElementById('edit-group-modal');
        const closeEditBtn = document.getElementById('close-edit-group');
        const cancelEditBtn = document.getElementById('cancel-edit-group');
        const saveGroupBtn = document.getElementById('save-group');
        const groupNameInputOld = document.getElementById('group-name');
        const addGroupBtn = document.getElementById('add-group-btn');

        // 添加书签到分组模态框（旧版本）
        const addBookmarkModal = document.getElementById('add-bookmark-to-group-modal');
        const closeAddBookmarkBtn = document.getElementById('close-add-bookmark-to-group');
        const cancelAddBookmarkBtn = document.getElementById('cancel-add-bookmark-to-group');
        const saveBookmarkToGroupBtn = document.getElementById('save-bookmark-to-group');
        const addBookmarkToGroupBtn = document.getElementById('add-bookmark-to-group-btn');

        // 新的分组名称模态框
        const groupNameModal = document.getElementById('group-name-modal');
        const closeGroupNameBtn = document.getElementById('close-group-name-modal');
        const cancelGroupNameBtn = document.getElementById('cancel-group-name');
        const saveGroupNameBtn = document.getElementById('save-group-name');
        const groupNameInput = document.getElementById('group-name-input');

        // 新的内联添加书签模态框
        const addBookmarkInlineModal = document.getElementById('add-bookmark-inline-modal');
        const closeAddBookmarkInlineBtn = document.getElementById('close-add-bookmark-inline');
        const cancelAddBookmarkInlineBtn = document.getElementById('cancel-add-bookmark-inline');
        const saveBookmarkInlineBtn = document.getElementById('save-bookmark-inline');
        const bookmarkNameInlineInput = document.getElementById('bookmark-name-inline');
        const bookmarkUrlInlineInput = document.getElementById('bookmark-url-inline');

        // 编辑分组模态框事件
        const closeEditGroupModal = () => {
            editModal.classList.remove('show');
            this.currentEditingGroup = null;
            if (groupNameInputOld) groupNameInputOld.value = '';
        };

        closeEditBtn?.addEventListener('click', closeEditGroupModal);
        cancelEditBtn?.addEventListener('click', closeEditGroupModal);

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditGroupModal();
        });

        // 保存分组
        saveGroupBtn?.addEventListener('click', () => {
            const name = groupNameInputOld?.value.trim();
            if (name) {
                this.saveGroup(name);
                closeEditGroupModal();
            }
        });

        // 添加书签到分组
        addGroupBtn?.addEventListener('click', () => {
            this.currentEditingGroup = null;
            this.showGroupNameModal();
        });

        // 旧版添加书签到分组模态框事件
        if (addBookmarkModal) {
            addBookmarkToGroupBtn?.addEventListener('click', () => {
                this.showAddBookmarkToGroupModal();
            });

            const closeAddBookmarkToGroupModal = () => {
                addBookmarkModal.classList.remove('show');
                const nameInput = document.getElementById('bookmark-name-group');
                const urlInput = document.getElementById('bookmark-url-group');
                if (nameInput) nameInput.value = '';
                if (urlInput) urlInput.value = '';
            };

            closeAddBookmarkBtn?.addEventListener('click', closeAddBookmarkToGroupModal);
            cancelAddBookmarkBtn?.addEventListener('click', closeAddBookmarkToGroupModal);

            addBookmarkModal.addEventListener('click', (e) => {
                if (e.target === addBookmarkModal) closeAddBookmarkToGroupModal();
            });

            saveBookmarkToGroupBtn?.addEventListener('click', () => {
                const nameInput = document.getElementById('bookmark-name-group');
                const urlInput = document.getElementById('bookmark-url-group');
                const name = nameInput?.value.trim();
                const url = urlInput?.value.trim();

                if (name && url && this.currentEditingGroup) {
                    this.addBookmarkToEditingGroup(name, url);
                    closeAddBookmarkToGroupModal();
                }
            });
        }

        // 新的分组名称模态框事件
        if (groupNameModal) {
            const closeGroupNameModal = () => {
                groupNameModal.classList.remove('show');
                if (groupNameInput) groupNameInput.value = '';
                this.currentEditingGroup = null;
            };

            closeGroupNameBtn?.addEventListener('click', closeGroupNameModal);
            cancelGroupNameBtn?.addEventListener('click', closeGroupNameModal);
            
            groupNameModal.addEventListener('click', (e) => {
                if (e.target === groupNameModal) closeGroupNameModal();
            });

            saveGroupNameBtn?.addEventListener('click', async () => {
                const name = groupNameInput?.value.trim();
                if (name) {
                    await this.saveGroup(name);
                    closeGroupNameModal();
                }
            });

            // 回车键保存
            groupNameInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveGroupNameBtn?.click();
                }
            });
        }

        // 内联添加书签模态框事件
        if (addBookmarkInlineModal) {
            const closeAddBookmarkInlineModal = () => {
                addBookmarkInlineModal.classList.remove('show');
                if (bookmarkNameInlineInput) bookmarkNameInlineInput.value = '';
                if (bookmarkUrlInlineInput) bookmarkUrlInlineInput.value = '';
                this.currentEditingGroup = null;
            };

            closeAddBookmarkInlineBtn?.addEventListener('click', closeAddBookmarkInlineModal);
            cancelAddBookmarkInlineBtn?.addEventListener('click', closeAddBookmarkInlineModal);
            
            addBookmarkInlineModal.addEventListener('click', (e) => {
                if (e.target === addBookmarkInlineModal) closeAddBookmarkInlineModal();
            });

            saveBookmarkInlineBtn?.addEventListener('click', async () => {
                const name = bookmarkNameInlineInput?.value.trim();
                const url = bookmarkUrlInlineInput?.value.trim();
                
                if (name && url && this.currentEditingGroup) {
                    await this.addBookmarkToGroup(name, url, this.currentEditingGroup);
                    
                    // 更新内联显示
                    const group = this.bookmarkGroups.find(g => g.id === this.currentEditingGroup);
                    if (group) {
                        this.renderGroupBookmarksInline(group);
                        this.renderBookmarkGroups(); // 更新主页面
                        this.renderGroupsList(); // 更新分组列表计数
                    }
                    
                    closeAddBookmarkInlineModal();
                }
            });

            // 回车键保存
            bookmarkUrlInlineInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveBookmarkInlineBtn?.click();
                }
            });
        }
    }

    // 显示编辑分组模态框（旧版本，用于向后兼容）
    showEditGroupModal(group = null) {
        const modal = document.getElementById('edit-group-modal');
        const title = document.getElementById('edit-group-title');
        const nameInput = document.getElementById('group-name');

        if (modal && title && nameInput) {
            modal.classList.add('show');
            
            if (group) {
                title.textContent = '编辑分组';
                nameInput.value = group.name;
                this.currentEditingGroup = group.id;
                this.renderBookmarksInGroup(group);
            } else {
                title.textContent = '添加新分组';
                nameInput.value = '';
                this.currentEditingGroup = null;
                this.renderBookmarksInGroup({ bookmarks: [] });
            }
        }
    }

    // 渲染分组内的书签（旧版本）
    renderBookmarksInGroup(group) {
        const container = document.getElementById('bookmarks-list');
        if (!container) return;

        container.innerHTML = '';

        group.bookmarks.forEach((bookmark, index) => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-list-item';
            bookmarkItem.innerHTML = `
                <div class="bookmark-info">
                    <span class="bookmark-icon">${bookmark.icon}</span>
                    <span class="bookmark-name">${bookmark.name}</span>
                    <span class="bookmark-url">${bookmark.url}</span>
                </div>
                <button class="btn-delete-bookmark" data-index="${index}">删除</button>
            `;

            // 删除书签
            const deleteBtn = bookmarkItem.querySelector('.btn-delete-bookmark');
            deleteBtn.addEventListener('click', () => {
                this.deleteBookmarkFromEditingGroup(index);
            });

            container.appendChild(bookmarkItem);
        });
    }

    // 显示添加书签到分组模态框（旧版本）
    showAddBookmarkToGroupModal() {
        const modal = document.getElementById('add-bookmark-to-group-modal');
        const nameInput = document.getElementById('bookmark-name-group');
        if (modal && nameInput) {
            modal.classList.add('show');
            nameInput.focus();
        }
    }

    // 添加书签到正在编辑的分组（旧版本）
    addBookmarkToEditingGroup(name, url) {
        // 确保URL格式正确
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const icon = this.generateIcon(name);
        const bookmark = { name, url, icon };

        if (this.currentEditingGroup) {
            const group = this.bookmarkGroups.find(g => g.id === this.currentEditingGroup);
            if (group) {
                group.bookmarks.push(bookmark);
                this.renderBookmarksInGroup(group);
                this.saveBookmarkGroups();
            }
        }
    }

    // 从正在编辑的分组中删除书签（旧版本）
    deleteBookmarkFromEditingGroup(index) {
        if (this.currentEditingGroup) {
            const group = this.bookmarkGroups.find(g => g.id === this.currentEditingGroup);
            if (group) {
                group.bookmarks.splice(index, 1);
                this.renderBookmarksInGroup(group);
                this.saveBookmarkGroups();
            }
        }
    }

    // 保存分组
    async saveGroup(name) {
        if (this.currentEditingGroup) {
            // 编辑现有分组
            const group = this.bookmarkGroups.find(g => g.id === this.currentEditingGroup);
            if (group) {
                group.name = name;
            }
        } else {
            // 添加新分组
            const newGroup = {
                id: 'group_' + Date.now(),
                name: name,
                bookmarks: []
            };
            this.bookmarkGroups.push(newGroup);
        }

        await this.saveBookmarkGroups();
        this.renderBookmarkGroups();
        this.renderGroupsList();
    }

    // 删除分组
    async deleteGroup(groupId) {
        if (groupId === 'default') return; // 不能删除默认分组

        if (confirm('确定要删除这个分组吗？分组内的所有书签也将被删除。')) {
            this.bookmarkGroups = this.bookmarkGroups.filter(g => g.id !== groupId);
            await this.saveBookmarkGroups();
            this.renderBookmarkGroups();
            this.renderGroupsList();
        }
    }

    // 渲染分组列表 - 内联管理版本
    renderGroupsList() {
        const container = document.getElementById('groups-management');
        if (!container) return;

        container.innerHTML = '';

        this.bookmarkGroups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-management-item';
            groupItem.innerHTML = `
                <div class="group-header" data-group-id="${group.id}">
                    <div class="group-info">
                        <span class="group-name">${group.name}</span>
                        <span class="group-count">${group.bookmarks.length} 个书签</span>
                    </div>
                    <div class="group-controls">
                        <button class="btn-edit-group-name" data-group-id="${group.id}" title="编辑分组名称">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3l-9.5 9.5-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        ${group.id !== 'default' ? `
                        <button class="btn-delete-group" data-group-id="${group.id}" title="删除分组">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
                            </svg>
                        </button>
                        ` : ''}
                        <div class="group-expand-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="group-content" id="group-content-${group.id}">
                    <div class="group-bookmarks">
                        <div class="group-bookmarks-title">书签列表</div>
                        <div class="group-bookmarks-list" id="bookmarks-list-${group.id}">
                            ${group.bookmarks.length === 0 ? 
                                '<div class="empty-group-message">该分组暂无书签</div>' : ''
                            }
                        </div>
                    </div>
                    <div class="group-add-bookmark">
                        <button class="btn-add-bookmark-inline" data-group-id="${group.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            添加书签
                        </button>
                    </div>
                </div>
            `;

            // 分组头部点击展开/折叠
            const header = groupItem.querySelector('.group-header');
            const content = groupItem.querySelector('.group-content');
            const expandIcon = groupItem.querySelector('.group-expand-icon');
            
            header.addEventListener('click', (e) => {
                // 如果点击的是按钮，不触发展开/折叠
                if (e.target.closest('button')) return;
                
                const isExpanded = content.classList.contains('expanded');
                content.classList.toggle('expanded');
                expandIcon.classList.toggle('expanded');
                header.classList.toggle('expanded');
            });

            // 编辑分组名称
            const editNameBtn = groupItem.querySelector('.btn-edit-group-name');
            editNameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditGroupNameInline(group);
            });

            // 删除分组
            const deleteBtn = groupItem.querySelector('.btn-delete-group');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteGroup(group.id);
                });
            }

            // 添加书签
            const addBookmarkBtn = groupItem.querySelector('.btn-add-bookmark-inline');
            addBookmarkBtn.addEventListener('click', () => {
                this.showAddBookmarkInlineModal(group.id);
            });

            container.appendChild(groupItem);
            
            // 渲染分组内的书签（必须在元素添加到DOM后调用）
            this.renderGroupBookmarksInline(group);
        });
    }

    // 渲染分组内书签列表（内联版本）
    renderGroupBookmarksInline(group) {
        const container = document.getElementById(`bookmarks-list-${group.id}`);
        if (!container) return;

        const bookmarksList = group.bookmarks.map((bookmark, index) => `
            <div class="group-bookmark-item">
                <div class="bookmark-info-inline">
                    <div class="bookmark-icon-inline">${bookmark.icon}</div>
                    <div class="bookmark-details-inline">
                        <div class="bookmark-name-inline">${bookmark.name}</div>
                        <div class="bookmark-url-inline">${bookmark.url}</div>
                    </div>
                </div>
                <button class="btn-remove-bookmark-inline" data-group-id="${group.id}" data-bookmark-index="${index}" title="删除书签">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        if (group.bookmarks.length === 0) {
            container.innerHTML = '<div class="empty-group-message">该分组暂无书签</div>';
        } else {
            container.innerHTML = bookmarksList;
        }

        // 添加删除书签事件
        container.querySelectorAll('.btn-remove-bookmark-inline').forEach(btn => {
            btn.addEventListener('click', () => {
                const groupId = btn.dataset.groupId;
                const bookmarkIndex = parseInt(btn.dataset.bookmarkIndex);
                this.deleteBookmarkFromGroup(groupId, bookmarkIndex);
            });
        });
    }

    // 显示编辑分组名称
    showEditGroupNameInline(group) {
        this.showGroupNameModal(group);
    }

    // 显示添加书签内联模态框
    showAddBookmarkInlineModal(groupId) {
        this.currentEditingGroup = groupId;
        const modal = document.getElementById('add-bookmark-inline-modal');
        if (modal) {
            modal.classList.add('show');
            const nameInput = document.getElementById('bookmark-name-inline');
            if (nameInput) nameInput.focus();
        }
    }

    // 显示分组名称模态框
    showGroupNameModal(group = null) {
        const modal = document.getElementById('group-name-modal');
        const title = document.getElementById('group-name-modal-title');
        const input = document.getElementById('group-name-input');
        
        if (modal && title && input) {
            modal.classList.add('show');
            
            if (group) {
                title.textContent = '编辑分组名称';
                input.value = group.name;
                this.currentEditingGroup = group.id;
            } else {
                title.textContent = '添加新分组';
                input.value = '';
                this.currentEditingGroup = null;
            }
            
            input.focus();
        }
    }

    // 从分组中删除书签
    async deleteBookmarkFromGroup(groupId, bookmarkIndex) {
        const group = this.bookmarkGroups.find(g => g.id === groupId);
        if (group && group.bookmarks[bookmarkIndex]) {
            if (confirm('确定要删除这个书签吗？')) {
                group.bookmarks.splice(bookmarkIndex, 1);
                await this.saveBookmarkGroups();
                this.renderGroupBookmarksInline(group);
                this.renderBookmarkGroups(); // 更新主页面显示
                this.renderGroupsList(); // 更新分组列表计数
            }
        }
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
    document.addEventListener('DOMContentLoaded', () => {
        try {
            new FreshTab();
        } catch (error) {
            console.error('FreshTab初始化失败:', error);
        }
    });
} else {
    // DOM已经加载完成，直接初始化
    try {
        new FreshTab();
    } catch (error) {
        console.error('FreshTab初始化失败:', error);
    }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // ESC 取消焦点
    if (e.key === 'Escape') {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }
});

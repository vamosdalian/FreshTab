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
        this.bookmarks = [];
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
        this.loadBookmarks();
        this.setupBookmarkModal();
        this.setupSettingsModal();
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
        const grid = document.getElementById('bookmarks-grid');
        
        // 检查网格元素是否存在
        if (!grid) {
            console.warn('书签网格元素未找到');
            return;
        }
        
        // 移除所有列数类
        grid.classList.remove('columns-3', 'columns-4', 'columns-5', 'columns-6', 'columns-7', 'columns-8');
        // 添加当前设置的列数类
        grid.classList.add(`columns-${this.settings.columnsPerRow}`);
        
        // 移除所有大小类
        grid.classList.remove('size-small', 'size-medium', 'size-large');
        // 添加当前设置的大小类
        grid.classList.add(`size-${this.settings.bookmarkSize}`);
        
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

    // 加载书签
    async loadBookmarks() {
        try {
            // 从Chrome存储中加载书签
            const result = await chrome.storage.sync.get(['bookmarks']);
            this.bookmarks = result.bookmarks || this.getDefaultBookmarks();
            this.renderBookmarks();
        } catch (error) {
            console.log('使用默认书签');
            this.bookmarks = this.getDefaultBookmarks();
            this.renderBookmarks();
        }
    }

    // 获取默认书签
    getDefaultBookmarks() {
        return [
            { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
            { name: 'GitHub', url: 'https://github.com', icon: '🐱' },
            { name: '知乎', url: 'https://www.zhihu.com', icon: '🤔' },
            { name: '微博', url: 'https://weibo.com', icon: '📝' },
            { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
            { name: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' }
        ];
    }

    // 渲染书签
    renderBookmarks() {
        const grid = document.getElementById('bookmarks-grid');
        
        // 检查网格元素是否存在
        if (!grid) {
            console.warn('书签网格元素未找到');
            return;
        }
        
        // 保存添加按钮
        const addBtn = document.getElementById('add-bookmark-btn');
        
        // 清空网格但保留添加按钮
        grid.innerHTML = '';
        
        // 重新添加所有书签
        this.bookmarks.forEach((bookmark, index) => {
            const bookmarkElement = this.createBookmarkElement(bookmark, index);
            grid.appendChild(bookmarkElement);
        });
        
        // 将添加按钮放在最后（如果存在）
        if (addBtn) {
            grid.appendChild(addBtn);
        }

        // 应用当前设置
        this.applySettings();
    }

    // 创建书签元素
    createBookmarkElement(bookmark, index) {
        const element = document.createElement('a');
        element.className = 'bookmark-item';
        element.href = bookmark.url;
        element.target = '_blank';
        
        element.innerHTML = `
            <div class="bookmark-icon">${bookmark.icon}</div>
            <div class="bookmark-name">${bookmark.name}</div>
            <button class="bookmark-delete" data-index="${index}">&times;</button>
        `;

        // 添加删除功能
        const deleteBtn = element.querySelector('.bookmark-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.deleteBookmark(index);
        });

        return element;
    }

    // 删除书签
    async deleteBookmark(index) {
        this.bookmarks.splice(index, 1);
        await this.saveBookmarks();
        this.renderBookmarks();
    }

    // 保存书签到存储
    async saveBookmarks() {
        try {
            await chrome.storage.sync.set({ bookmarks: this.bookmarks });
        } catch (error) {
            console.log('无法保存到Chrome存储，使用localStorage');
            localStorage.setItem('freshtab-bookmarks', JSON.stringify(this.bookmarks));
        }
    }

    // 设置书签模态框
    setupBookmarkModal() {
        const modal = document.getElementById('bookmark-modal');
        const addBtn = document.getElementById('add-bookmark-btn');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-bookmark');
        const saveBtn = document.getElementById('save-bookmark');
        const nameInput = document.getElementById('bookmark-name');
        const urlInput = document.getElementById('bookmark-url');

        // 检查必要元素是否存在
        if (!modal || !addBtn || !closeBtn || !cancelBtn || !saveBtn || !nameInput || !urlInput) {
            console.warn('书签模态框相关元素未完全找到');
            return;
        }

        // 打开模态框
        addBtn.addEventListener('click', () => {
            modal.classList.add('show');
            nameInput.focus();
        });

        // 关闭模态框
        const closeModal = () => {
            modal.classList.remove('show');
            nameInput.value = '';
            urlInput.value = '';
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

            if (name && url) {
                this.addBookmark(name, url);
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

    // 添加书签
    async addBookmark(name, url) {
        // 确保URL格式正确
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // 生成图标（使用域名首字母或emoji）
        const icon = this.generateIcon(name);

        const bookmark = { name, url, icon };
        this.bookmarks.push(bookmark);
        
        await this.saveBookmarks();
        this.renderBookmarks();
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

        // 打开设置模态框
        settingsBtn.addEventListener('click', () => {
            modal.classList.add('show');
            // 更新UI为当前设置值
            columnsSlider.value = this.settings.columnsPerRow;
            columnsValue.textContent = this.settings.columnsPerRow;
            bookmarkSizeSelect.value = this.settings.bookmarkSize;
            showTimeCheckbox.checked = this.settings.showTime;
            searchEngineSelect.value = this.currentEngine;
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

    // 设置按钮功能（旧方法替换）
    setupSettings() {
        // 这个方法现在被 setupSettingsModal 替代
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

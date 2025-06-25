# FreshTab - Vue.js Chrome Extension

> 基于 Vue.js 3 构建的美观且功能丰富的新标签页替换 Chrome 扩展程序

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg)
![Vue](https://img.shields.io/badge/vue-3.5.16-green.svg)
![Vite](https://img.shields.io/badge/vite-6.3.5-purple.svg)
![License](https://img.shields.io/badge/license-ISC-yellow.svg)

## ✨ 功能特性

- 🕒 **实时时钟** - 24小时制时间显示和智能问候语
- 🔍 **多搜索引擎** - 支持 Google、Bing、百度、DuckDuckGo、Yahoo
- 📚 **书签管理** - 快速访问常用网站，支持自定义图标
- 🌓 **智能主题** - 自动跟随系统主题，支持深色/浅色模式切换
- ⚙️ **个性化设置** - 自定义显示组件、主题、背景等
- 📱 **响应式设计** - 完美适配各种屏幕尺寸

## 🛠️ 技术栈

- **前端框架**: Vue.js 3 (Composition API)
- **构建工具**: Vite 6
- **状态管理**: Vue Reactive APIs
- **样式**: CSS3 + 毛玻璃效果
- **存储**: Chrome Storage API
- **扩展**: Chrome Extension Manifest V3

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- Chrome 浏览器

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:3000
```

### 构建扩展

```bash
# 构建生产版本
npm run build:extension

# 清理构建文件
npm run clean
```

### 安装到 Chrome

1. 运行 `npm run build:extension`
2. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录下的 `dist` 文件夹

## 📁 项目结构

```
FreshTab/
├── public/                 # 静态资源目录
│   ├── manifest.json      # Chrome 扩展清单文件
│   └── icons/             # 扩展图标
├── src/                   # 源代码目录
│   ├── App.vue           # 主应用组件
│   ├── main.js           # 应用入口文件
│   ├── style.css         # 全局样式
│   ├── components/       # Vue 组件
│   │   ├── TimeSection.vue
│   │   ├── SearchSection.vue
│   │   ├── BookmarksSection.vue
│   │   ├── SettingsButton.vue
│   │   ├── SettingsModal.vue
│   │   └── BookmarkModal.vue
│   └── composables/      # 组合式函数
│       ├── useTime.js
│       ├── useSearch.js
│       ├── useBookmarks.js
│       └── useSettings.js
├── docs/                 # 项目文档
├── dist/                 # 构建输出目录
├── index.html           # 开发环境入口
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置
```

## 🔧 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run build:extension` - 构建 Chrome 扩展
- `npm run preview` - 预览生产构建
- `npm run clean` - 清理构建文件

## 📚 文档

- [安装指南](./docs/INSTALL.md)
- [主题切换指南](./THEME_GUIDE.md) - 🆕 深色/浅色模式使用说明
- [搜索引擎更新](./docs/SEARCH_ENGINE_UPDATE.md)
- [Vue.js 迁移指南](./docs/VUE_MIGRATION.md)

## 🎯 开发指南

### 组件开发

项目使用 Vue 3 Composition API，每个组件都有明确的职责：

- **TimeSection**: 时间显示和问候语
- **SearchSection**: 搜索引擎和输入框
- **BookmarksSection**: 书签展示和管理
- **SettingsModal**: 设置面板
- **BookmarkModal**: 书签编辑对话框

### 状态管理

使用 Vue 3 的 Composition API 和 composables 进行状态管理：

```javascript
// 使用时间相关状态
const { currentTime, currentDate, greeting } = useTime()

// 使用书签管理
const { bookmarks, addBookmark, deleteBookmark } = useBookmarks()

// 使用设置
const { settings, updateSetting } = useSettings()

// 使用搜索功能
const { searchQuery, performSearch, setSearchEngine } = useSearch()
```

### 添加新功能

1. 在 `src/composables/` 中创建新的 composable
2. 在 `src/components/` 中创建对应的 Vue 组件
3. 在 `App.vue` 中引入和使用新组件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

[ISC](LICENSE)

## 🔗 相关链接

- [Vue.js 官网](https://vuejs.org/)
- [Vite 官网](https://vitejs.dev/)
- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)

## ⭐ 如果觉得有用，请给个 Star！

# FreshTab - Chrome 新标签页替换扩展

一个美观且功能丰富的 Chrome 新标签页替换扩展。

## 功能特点

### 🕒 实时时间显示
- 大字体时间显示（12小时制）
- 中文日期显示
- 智能问候语（根据时间变化）

### 🔍 多搜索引擎支持
- Google、Bing、百度三种搜索引擎
- 智能URL检测（直接输入网址可直接访问）
- 键盘快捷键支持（Ctrl/Cmd + K 聚焦搜索框）

### 📚 快速书签
- 可自定义添加/删除书签
- 自动图标生成（常见网站使用emoji，其他使用首字母）
- 鼠标悬停显示删除按钮

### 🎨 现代化设计
- 渐变背景与毛玻璃效果
- 响应式设计，支持各种屏幕尺寸
- 流畅的动画效果

## 安装方法

1. **下载扩展文件**
   - 下载整个项目文件夹

2. **启用开发者模式**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 打开右上角的"开发者模式"开关

3. **加载扩展**
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹（包含 manifest.json 的文件夹）

4. **设置图标（可选）**
   - 在 `icons` 文件夹中添加以下尺寸的图标：
     - icon-16.png (16x16)
     - icon-32.png (32x32)
     - icon-48.png (48x48)
     - icon-128.png (128x128)

## 使用说明

### 搜索功能
- 在搜索框中输入关键词进行搜索
- 可以切换不同的搜索引擎（Google、Bing、百度）
- 直接输入网址会跳转到该网站
- 使用 `Ctrl/Cmd + K` 快速聚焦搜索框

### 书签管理
- 点击"添加书签"按钮添加新书签
- 鼠标悬停在书签上可以看到删除按钮
- 书签数据会自动保存到 Chrome 同步存储

### 键盘快捷键
- `Ctrl/Cmd + K`: 聚焦搜索框
- `Enter`: 执行搜索
- `ESC`: 取消当前焦点

## 文件结构

```
FreshTab/
├── manifest.json      # 扩展配置文件
├── newtab.html       # 新标签页HTML
├── newtab.js         # 主要JavaScript功能
├── styles.css        # 样式文件
├── icons/            # 图标文件夹
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md         # 项目说明
```

## 自定义配置

### 修改默认书签
在 `newtab.js` 文件的 `getDefaultBookmarks()` 方法中修改默认书签：

```javascript
getDefaultBookmarks() {
    return [
        { name: '网站名称', url: 'https://example.com', icon: '🌐' },
        // 添加更多书签...
    ];
}
```

### 修改搜索引擎
在 `newtab.js` 文件的构造函数中修改搜索引擎：

```javascript
this.searchEngines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    baidu: 'https://www.baidu.com/s?wd=',
    // 添加更多搜索引擎...
};
```

### 修改样式主题
编辑 `styles.css` 文件中的颜色变量来自定义主题颜色。

## 版本历史

### v1.0
- 初始版本
- 基本的时间显示、搜索、书签功能
- 现代化UI设计

## 技术栈

- **HTML5**: 页面结构
- **CSS3**: 样式和动画（使用现代CSS特性如 Grid、Flexbox、backdrop-filter）
- **Vanilla JavaScript**: 功能实现（ES6+）
- **Chrome Extension API**: 存储和扩展功能

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于 Chromium 的浏览器

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

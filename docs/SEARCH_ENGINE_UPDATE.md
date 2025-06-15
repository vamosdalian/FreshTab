# FreshTab 搜索引擎功能更新

## 新功能概述

### 🔍 搜索引擎下拉选择
- 将原来的搜索引擎按钮改为下拉选择框
- 下拉框位于搜索框左侧，界面更加简洁
- 支持多个搜索引擎：Google、Bing、百度、DuckDuckGo、Yahoo

### 💾 本地存储功能
- 用户选择的搜索引擎会自动保存到本地存储
- 下次打开页面时会自动恢复用户上次选择的搜索引擎
- 使用Chrome扩展存储API（备用localStorage）

### 📱 响应式设计
- 在平板设备上，搜索引擎选择框和搜索框垂直排列
- 在手机设备上，布局完全垂直，确保良好的用户体验
- 保持与原有书签和时间显示的响应式兼容

## 技术实现

### HTML结构变化
```html
<div class="search-input-wrapper">
    <select class="search-engine-select" id="search-engine-select">
        <!-- 动态加载搜索引擎选项 -->
    </select>
    <div class="search-input-container">
        <svg class="search-icon">...</svg>
        <input type="text" class="search-input" id="search-input">
    </div>
</div>
```

### JavaScript功能
- `searchEngines` 数组包含所有可用搜索引擎
- `setupSearchEngine()` 方法动态生成下拉选项
- `saveSettings()` 和 `loadSettings()` 处理本地存储
- `updateSearchPlaceholder()` 根据选择的搜索引擎更新占位符

### CSS样式
- `.search-engine-select` 下拉框样式，与搜索框保持一致的视觉效果
- `.search-input-container` 包装搜索图标和输入框
- 响应式媒体查询适配不同屏幕尺寸

## 使用方法

1. **选择搜索引擎**：点击搜索框左侧的下拉菜单选择喜欢的搜索引擎
2. **搜索**：在搜索框中输入关键词，按回车或点击搜索图标
3. **自动保存**：选择的搜索引擎会自动保存，下次打开时自动恢复

## 兼容性

- ✅ Chrome扩展环境
- ✅ 本地HTML文件
- ✅ 移动设备响应式
- ✅ 暗色模式友好的样式

## 测试

运行 `test.html` 文件可以测试：
- 搜索引擎数据结构
- 本地存储功能
- URL编码正确性
- 图标生成功能
